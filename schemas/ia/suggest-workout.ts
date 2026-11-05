import { z } from 'zod';

import { SET_KINDS, validarSeriesContiguas } from '@/schemas/treino';

/**
 * Schema de saída da IA para `suggest_workout` (Edge Function `suggest-workout`),
 * FORMATO v2: treino por DIVISÕES, com dias de descanso e séries individuais.
 *
 * PURO: só `zod` (+ reuso de constantes/validadores puros de `schemas/treino`).
 * Nenhuma API só-Deno.
 *
 * Espelha a estrutura da ficha v2 (`workout_plans` + `workout_plan_items` +
 * `workout_plan_item_sets`) e os dois modos mutuamente exclusivos de
 * organização de uma ficha (ver `fichaSchema.superRefine` em
 * `schemas/treino.ts`):
 *   - POR DIA: cada divisão tem `weekday` (0..6) e `rotation_steps` é nulo/ausente;
 *   - POR DIVISÃO (rotação): todas as divisões têm `weekday = null` e
 *     `rotation_steps` descreve a sequência (divisões + descansos).
 *
 * A IA escolhe exercícios SOMENTE do catálogo existente e retorna o
 * `exercise_id` real (uuid) — nunca nome livre como identidade.
 */

// -----------------------------------------------------------------------------
// Peças de base
// -----------------------------------------------------------------------------

/** Dia da semana: 0 (domingo) .. 6 (sábado), como em `workout_plan_items.weekday`. */
const weekday = z
  .number({ invalid_type_error: 'weekday deve ser numérico.' })
  .int('weekday deve ser inteiro.')
  .min(0, 'weekday mínimo é 0 (domingo).')
  .max(6, 'weekday máximo é 6 (sábado).');

/**
 * `kind` da série (Decisão 1): aceita o enum completo `SET_KINDS`, mas qualquer
 * valor FORA de ['warmup','adaptation','work'] é rebaixado para 'work' — nunca
 * falha por causa do tipo de série. Valor desconhecido/ausente também vira 'work'.
 */
const KINDS_PERMITIDOS = ['warmup', 'adaptation', 'work'] as const;
type KindPermitido = (typeof KINDS_PERMITIDOS)[number];

const kind = z.preprocess((valor) => {
  // Mantém só os três tipos permitidos na saída da IA; o resto vira 'work'.
  if (
    typeof valor === 'string' &&
    (KINDS_PERMITIDOS as readonly string[]).includes(valor)
  ) {
    return valor;
  }
  // Valores do enum amplo (dropset, failure, ...) e qualquer desconhecido → 'work'.
  void SET_KINDS;
  return 'work';
}, z.enum(KINDS_PERMITIDOS)) as unknown as z.ZodType<KindPermitido>;

/** Uma SÉRIE individual de um exercício (`workout_plan_item_sets`). */
export const workoutSeriesSchema = z.object({
  set_number: z.number().int('set_number deve ser inteiro.').min(1, 'set_number mínimo é 1.'),
  kind,
  // `target_reps` é texto (ex.: "8-12", "até a falha"); pode ser nulo.
  target_reps: z.string().min(1).nullable(),
  rest_seconds: z.number().int('rest_seconds deve ser inteiro.').nonnegative('rest_seconds não pode ser negativo.').nullable(),
  target_load: z.number().nullable(),
  note: z.string().min(1).nullable(),
});

/** Um exercício prescrito numa divisão (`workout_plan_items`), com séries detalhadas. */
export const workoutExerciseV2Schema = z
  .object({
    // Identidade DURÁVEL do exercício: uuid real do catálogo (nunca nome livre).
    exercise_id: z.string().uuid('exercise_id deve ser um uuid do catálogo.'),
    // Nome só para exibição/debug; não é a identidade.
    exercise_name: z.string().min(1).optional(),
    order_index: z.number().int('order_index deve ser inteiro.').nonnegative('order_index não pode ser negativo.'),
    // Prescrição "geral" do item (fallback quando a série não define o valor).
    sets: z.number().int('sets deve ser inteiro.').positive('sets deve ser positivo.').nullable().optional(),
    reps: z.string().min(1).nullable().optional(),
    rest_seconds: z.number().int('rest_seconds deve ser inteiro.').nonnegative('rest_seconds não pode ser negativo.').nullable().optional(),
    target_load: z.number().nullable().optional(),
    notes: z.string().min(1).nullable().optional(),
    series: z.array(workoutSeriesSchema).min(1, 'O exercício precisa de ao menos uma série.'),
  })
  // Séries numeradas 1..N sem buraco nem repetição (mesma regra da ficha).
  .superRefine(validarSeriesContiguas);

/** Uma DIVISÃO do treino (ex.: "Treino A — Peito e Tríceps"). */
export const workoutDivisionSchema = z.object({
  label: z.string().min(1, 'A divisão precisa de um rótulo.'),
  // POR DIA: weekday 0..6. POR DIVISÃO (rotação): null.
  weekday: weekday.nullable(),
  exercises: z
    .array(workoutExerciseV2Schema)
    .min(1, 'A divisão precisa de ao menos um exercício.'),
});

/**
 * Sequência de rotação (divisões + descansos), espelhando
 * `workout_plans.rotation_steps`. A ordem do array É a ordem da rotação.
 */
const rotationStepsSchema = z.array(
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('division'), label: z.string().min(1) }),
    z.object({ type: z.literal('rest') }),
  ])
);

// -----------------------------------------------------------------------------
// Saída completa (v2)
// -----------------------------------------------------------------------------

/** Saída completa da sugestão de treino (formato v2). */
export const suggestWorkoutOutputSchema = z
  .object({
    divisions: z
      .array(workoutDivisionSchema)
      .min(1, 'O plano precisa de ao menos uma divisão.'),
    // Dias da semana de descanso (0..6), opcional (informativo).
    rest_days: z.array(weekday).optional(),
    // Sequência de rotação para fichas POR DIVISÃO; nulo/ausente nas POR DIA.
    rotation_steps: rotationStepsSchema.nullable().optional(),
    // Aviso de rascunho / não substitui profissional (ADR 0001 §6).
    disclaimer: z.string().min(1, 'O aviso é obrigatório.'),
  })
  .superRefine((plano, ctx) => {
    const { divisions, rotation_steps } = plano;

    // (2) Labels de divisão únicos.
    const labelsDivisoes = divisions.map((d) => d.label);
    if (new Set(labelsDivisoes).size !== labelsDivisoes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cada divisão precisa de um rótulo único.',
        path: ['divisions'],
      });
    }

    // (1) Modos mutuamente exclusivos: ou TODAS por dia (weekday != null) e
    // rotation_steps nulo/ausente, ou TODAS por divisão (weekday == null) e
    // rotation_steps presente. Qualquer mistura rejeita.
    const temRotacao = rotation_steps !== undefined && rotation_steps !== null;
    const todasComWeekday = divisions.every((d) => d.weekday !== null);
    const todasSemWeekday = divisions.every((d) => d.weekday === null);

    if (!todasComWeekday && !todasSemWeekday) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Ou todas as divisões têm dia da semana, ou nenhuma tem (modo rotação).',
        path: ['divisions'],
      });
      return;
    }

    if (todasComWeekday && temRotacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Fichas por dia da semana não podem ter sequência de rotação.',
        path: ['rotation_steps'],
      });
      return;
    }

    if (todasSemWeekday && !temRotacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Fichas por divisão precisam de uma sequência de rotação (rotation_steps).',
        path: ['rotation_steps'],
      });
      return;
    }

    // (3) Coerência da rotação: labels dos passos `division` sem repetição e
    // formando EXATAMENTE o conjunto dos labels das divisões.
    if (temRotacao) {
      const labelsPassos = rotation_steps
        .filter((s): s is { type: 'division'; label: string } => s.type === 'division')
        .map((s) => s.label);

      if (new Set(labelsPassos).size !== labelsPassos.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Cada divisão só pode aparecer uma vez na sequência de rotação.',
          path: ['rotation_steps'],
        });
      }

      const setDivisoes = new Set(labelsDivisoes);
      const setPassos = new Set(labelsPassos);
      const todasNaSequencia = [...setDivisoes].every((l) => setPassos.has(l));
      const soDivisoesDoPlano = labelsPassos.every((l) => setDivisoes.has(l));
      if (!todasNaSequencia || !soDivisoesDoPlano) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'A sequência de rotação deve incluir todas as divisões do plano, e só elas.',
          path: ['rotation_steps'],
        });
      }
    }
  });

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

export type WorkoutSeries = z.infer<typeof workoutSeriesSchema>;
export type WorkoutExerciseV2 = z.infer<typeof workoutExerciseV2Schema>;
export type WorkoutDivision = z.infer<typeof workoutDivisionSchema>;
export type SuggestWorkoutOutput = z.infer<typeof suggestWorkoutOutputSchema>;
