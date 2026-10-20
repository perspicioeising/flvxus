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

/** Item de uma FICHA (`workout_plan_items`) — acrescenta `weekday`. */
export const itemFichaSchema = z.object({
  ...camposPrescricao,
  weekday: weekdayOpcional,
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
