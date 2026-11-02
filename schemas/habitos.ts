import { z } from 'zod';

/**
 * Schemas Zod dos HÁBITOS do aluno (água, dieta, check-in). O MESMO schema
 * valida no cliente (UX) e no servidor (segurança, nas Server Actions de
 * `actions/habitos.ts`). Os limites espelham os CHECKs das tabelas em
 * `types/database.types.ts`/migrations (FEAT-001): `amount_ml` 1..5000 e
 * `target_ml` 250..20000.
 *
 * NUNCA validamos `occurred_on` aqui: o dia é carimbado pelo banco
 * (`default public.gamification_sp_date(now())`) — fonte única de fuso.
 */

/** Registro de ingestão de água (`water_intake_logs.amount_ml`, 1..5000 ml). */
export const registrarAguaSchema = z.object({
  amount_ml: z.coerce
    .number()
    .int('A quantidade deve ser um número inteiro.')
    .min(1, 'Informe pelo menos 1 ml.')
    .max(5000, 'O máximo por registro é 5000 ml.'),
});

/**
 * Definição da meta de hidratação (`water_goals`). `alvo_user_id` opcional: quando
 * ausente, é o próprio aluno; quando presente, é o professor definindo a meta de
 * um aluno (a RLS valida o vínculo trainer→student do tenant).
 */
export const definirMetaAguaSchema = z.object({
  target_ml: z.coerce
    .number()
    .int('A meta deve ser um número inteiro.')
    .min(250, 'A meta mínima é 250 ml.')
    .max(20000, 'A meta máxima é 20000 ml.'),
  source: z.enum(['manual', 'derived_weight', 'default']),
  alvo_user_id: z.string().uuid('Aluno inválido.').optional(),
});

/** Alternância de cumprimento de uma refeição do dia (`diet_meal_completions`). */
export const alternarRefeicaoSchema = z.object({
  meal_id: z.string().uuid('Refeição inválida.'),
  diet_id: z.string().uuid('Dieta inválida.'),
});

export type RegistrarAguaInput = z.infer<typeof registrarAguaSchema>;
export type DefinirMetaAguaInput = z.infer<typeof definirMetaAguaSchema>;
export type AlternarRefeicaoInput = z.infer<typeof alternarRefeicaoSchema>;
