import { z } from 'zod';

import type { PlanStatus } from '@/types/database.types';

/**
 * Schemas Zod do domínio de treinos (architecture.md §6.2, §6.4).
 *
 * O MESMO schema valida no cliente (UX via react-hook-form + zodResolver) e no
 * servidor (segurança, nas Server Actions de `actions/treinos.ts`). As colunas
 * espelham `workouts`/`workout_exercises`/`workout_plans`/`workout_plan_items`
 * em `types/database.types.ts`.
 *
 * Dois níveis de reutilização:
 *   - MODELO (`workouts.is_template = true` + `workout_exercises`): rotina
 *     reutilizável, sem aluno e sem dia da semana;
 *   - FICHA (`workout_plans` + `workout_plan_items`): prescrição por aluno,
 *     com `status plan_status` e itens opcionalmente por dia da semana.
 */

// -----------------------------------------------------------------------------
// Helpers de normalização (FormData envia tudo como string)
// -----------------------------------------------------------------------------

/** String vazia/nula vira `undefined` (campo de texto opcional). */
const textoOpcional = z.preprocess(
  (valor) => (valor === '' || valor === null ? undefined : valor),
  z.string().trim().min(1).optional()
);

/**
 * Inteiro positivo opcional vindo de `number` ou `string`. Vazio → `undefined`.
 * Usado em `sets` e `rest_seconds` (colunas `integer` no banco).
 */
const inteiroPositivoOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor);
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().int().positive().optional());

/**
 * Número positivo opcional (carga alvo — coluna `numeric(6,2)`). Aceita vírgula
 * decimal, como é comum no pt-BR. Vazio → `undefined`.
 */
const numeroPositivoOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor.replace(',', '.'));
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().positive().optional());

/** `reps` é `text` no banco (ex.: "12", "8-12", "até a falha"). */
const repsOpcional = z.preprocess(
  (valor) => (valor === '' || valor === null ? undefined : valor),
  z.string().trim().min(1).optional()
);

// -----------------------------------------------------------------------------
// Itens (um exercício prescrito dentro de um modelo ou de uma ficha)
// -----------------------------------------------------------------------------

/** Campos comuns de prescrição (compartilhados por item de modelo e de ficha). */
const camposPrescricao = {
  exercise_id: z
    .string({ required_error: 'Selecione um exercício.' })
    .uuid('Exercício inválido.'),
  order_index: z.coerce.number().int().min(0).default(0),
  sets: inteiroPositivoOpcional,
  reps: repsOpcional,
  rest_seconds: inteiroPositivoOpcional,
  target_load: numeroPositivoOpcional,
  notes: textoOpcional,
};

/** Item de um MODELO de treino (`workout_exercises`). */
export const itemModeloSchema = z.object(camposPrescricao);

/** Dia da semana 0 (domingo) a 6 (sábado), opcional. */
const weekdayOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor);
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().int().min(0).max(6).optional());

/**
 * Rótulo curto de divisão ('A', 'B', 'C' ou nome do modelo), opcional. Vazio/
 * nulo → `undefined`. Espelha `workout_plan_items.division` (text nullable).
 */
const divisaoOpcional = z.preprocess(
  (valor) => (valor === '' || valor === null ? undefined : valor),
  z.string().trim().min(1).max(40).optional()
);

/** Item de uma FICHA (`workout_plan_items`) — acrescenta `weekday` e `division`. */
export const itemFichaSchema = z.object({
  ...camposPrescricao,
  weekday: weekdayOpcional,
  division: divisaoOpcional,
});

// -----------------------------------------------------------------------------
// Modelo e Ficha
// -----------------------------------------------------------------------------

/** Criação/edição de MODELO reutilizável (`workouts is_template=true`). */
export const modeloSchema = z.object({
  name: z
    .string({ required_error: 'Informe o nome do modelo.' })
    .trim()
    .min(1, 'Informe o nome do modelo.'),
  description: textoOpcional,
  itens: z
    .array(itemModeloSchema)
    .min(1, 'Adicione ao menos um exercício ao modelo.'),
});

/** Criação/edição de FICHA por aluno (`workout_plans` + itens). */
export const fichaSchema = z.object({
  student_id: z
    .string({ required_error: 'Selecione um aluno.' })
    .uuid('Aluno inválido.'),
  name: z
    .string({ required_error: 'Informe o nome da ficha.' })
    .trim()
    .min(1, 'Informe o nome da ficha.'),
  source_workout_id: z
    .string()
    .uuid('Modelo de origem inválido.')
    .optional(),
  itens: z
    .array(itemFichaSchema)
    .min(1, 'Adicione ao menos um exercício à ficha.'),
});

export type ItemModeloInput = z.infer<typeof itemModeloSchema>;
export type ItemFichaInput = z.infer<typeof itemFichaSchema>;
export type ModeloInput = z.infer<typeof modeloSchema>;
export type FichaInput = z.infer<typeof fichaSchema>;

// -----------------------------------------------------------------------------
// Montagem de FICHA por DIVISÃO (A/B/C), a partir de múltiplos modelos
// -----------------------------------------------------------------------------

/**
 * Um modelo escolhido para virar uma divisão da ficha: o modelo de origem e o
 * rótulo curto da divisão ('A', 'B', 'C' ou nome do modelo). O rótulo nunca é
 * vazio — o cliente aplica o padrão posicional (A/B/C/D/E) antes de validar.
 */
export const divisaoModeloSchema = z.object({
  source_workout_id: z.string().uuid('Modelo inválido.'),
  division: z.string().trim().min(1, 'Informe o rótulo da divisão.').max(40),
});

/**
 * Criação de FICHA multi-modelo por divisão: um aluno, um nome e ao menos um
 * modelo, cada um com seu rótulo de divisão único (case-insensitive, com trim).
 * O aluno executa as divisões na ordem que conseguir ir à academia (sem dia
 * fixo).
 */
export const criarFichaMultiModeloSchema = z
  .object({
    student_id: z.string().uuid('Aluno inválido.'),
    name: z.string().trim().min(1, 'Informe o nome da ficha.'),
    modelos: z
      .array(divisaoModeloSchema)
      .min(1, 'Selecione ao menos um modelo.'),
  })
  .refine(
    ({ modelos }) => {
      const rotulos = modelos.map((m) => m.division.trim().toLowerCase());
      return new Set(rotulos).size === rotulos.length;
    },
    {
      message: 'Cada divisão precisa de um rótulo diferente.',
      path: ['modelos'],
    }
  );

export type DivisaoModeloInput = z.infer<typeof divisaoModeloSchema>;
export type CriarFichaMultiModeloInput = z.infer<
  typeof criarFichaMultiModeloSchema
>;

// -----------------------------------------------------------------------------
// Clonagem de FICHA para outro aluno
// -----------------------------------------------------------------------------

/**
 * Clonagem de uma FICHA existente para um NOVO aluno. A cópia nasce como
 * rascunho (a action carimba `status='draft'`), preservando todos os itens da
 * ficha de origem. O `name` é opcional: quando ausente/vazio, a action aplica o
 * padrão `"<nome origem> (cópia)"`. O limite de 120 é um teto defensivo coerente
 * com os demais nomes de ficha (que só exigem `min(1)`).
 */
export const clonarFichaSchema = z.object({
  source_plan_id: z.string().uuid('Ficha de origem inválida.'),
  student_id: z.string().uuid('Aluno inválido.'),
  name: z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    z.string().trim().min(1).max(120).optional()
  ),
});

export type ClonarFichaInput = z.infer<typeof clonarFichaSchema>;

// -----------------------------------------------------------------------------
// Transição de status da ficha (plan_status)
// -----------------------------------------------------------------------------

/**
 * Transições válidas de `plan_status`. O fluxo normal avança
 * draft → pending_review → approved → released; qualquer estado (menos o
 * próprio arquivado) pode ir para `archived`. A invariante "aluno só vê
 * `released`" é garantida por RLS (não reimplementada no cliente); aqui apenas
 * impedimos saltos/voltas sem sentido no controle do professor.
 */
export const TRANSICOES_STATUS: Record<PlanStatus, PlanStatus[]> = {
  draft: ['pending_review', 'archived'],
  pending_review: ['approved', 'draft', 'archived'],
  approved: ['released', 'pending_review', 'archived'],
  released: ['archived'],
  archived: [],
};

const STATUS_VALIDOS = [
  'draft',
  'pending_review',
  'approved',
  'released',
  'archived',
] as const satisfies readonly PlanStatus[];

/**
 * Valida uma transição de status: o par (de, para) precisa estar em
 * `TRANSICOES_STATUS`. Rejeita status fora do enum e transições inválidas.
 */
export const transicaoStatusSchema = z
  .object({
    de: z.enum(STATUS_VALIDOS),
    para: z.enum(STATUS_VALIDOS),
  })
  .refine(({ de, para }) => TRANSICOES_STATUS[de].includes(para), {
    message: 'Transição de status inválida.',
    path: ['para'],
  });

export type TransicaoStatusInput = z.infer<typeof transicaoStatusSchema>;

/** Conveniência: a transição (de → para) é permitida? */
export function transicaoPermitida(de: PlanStatus, para: PlanStatus): boolean {
  return TRANSICOES_STATUS[de]?.includes(para) ?? false;
}

// -----------------------------------------------------------------------------
// Liberação programada de treinos (agendamento)
// -----------------------------------------------------------------------------

const MS_DIA = 86_400_000;

/**
 * Data-alvo de liberação para "prazo em N dias": data base + N dias (em ms UTC).
 * A data base é o momento do agendamento (relógio do SERVIDOR), passado pela
 * action. Função pura, sem dependência de lib de data e sem mutar `base`.
 */
export function resolverPrazoParaData(base: Date, dias: number): Date {
  return new Date(base.getTime() + dias * MS_DIA);
}

/**
 * Entrada do agendamento de liberação (discriminated union por `modo`):
 *   - `agora`: libera imediatamente (a action faz UPDATE DIRETO draft→released,
 *     fora da máquina de transições — ver actions/treinos.ts e o design §2/§6.1);
 *   - `data`: data fixa FUTURA (> agora);
 *   - `dias`: prazo em dias inteiros (> 0, teto 3650 ~ 10 anos).
 *
 * `<input type="date">` envia `YYYY-MM-DD`; `z.coerce.date` interpreta essa forma
 * como meia-noite UTC daquele dia. Por isso o refine `> Date.now()` rejeita "hoje"
 * e aceita a partir de "amanhã", concordando com `min = amanhã` imposto pela UI.
 */
export const agendamentoSchema = z.discriminatedUnion('modo', [
  z.object({ modo: z.literal('agora') }),

  z.object({
    modo: z.literal('data'),
    data: z.coerce
      .date({ invalid_type_error: 'Informe uma data válida.' })
      .refine((d) => d.getTime() > Date.now(), {
        message: 'A data de liberação deve estar no futuro.',
      }),
  }),

  z.object({
    modo: z.literal('dias'),
    dias: z.coerce
      .number({ invalid_type_error: 'Informe o número de dias.' })
      .int('Use dias inteiros.')
      .positive('O prazo deve ser maior que zero.')
      .max(3650, 'Prazo máximo de 10 anos.'),
  }),
]);

export type AgendamentoInput = z.infer<typeof agendamentoSchema>;
