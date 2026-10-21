import { z } from 'zod';

/**
 * Schemas Zod da execução de treino do aluno (architecture.md §6.4).
 *
 * O MESMO schema valida no cliente (UX) e no servidor (segurança, nas Server
 * Actions). As colunas espelham `workout_sessions` e `workout_set_logs` em
 * `types/database.types.ts`. Os preprocessos de número seguem o padrão de
 * `schemas/treino.ts` (FormData envia tudo como string; aceita vírgula decimal).
 */

/**
 * Inteiro ≥ 0 opcional vindo de `number` ou `string`. Vazio → `undefined`.
 * Usado em `reps_done` (coluna `integer`).
 */
const inteiroNaoNegativoOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor);
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().int().min(0).optional());

/**
 * Número ≥ 0 opcional (carga executada — coluna `numeric`). Aceita vírgula
 * decimal, como é comum no pt-BR. Vazio → `undefined`.
 */
const numeroNaoNegativoOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor.replace(',', '.'));
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().min(0).optional());

/** Início de uma sessão de treino a partir de uma ficha liberada. */
export const iniciarSessaoSchema = z.object({
  plan_id: z.string().uuid('Ficha inválida.'),
  // Divisão (A/B/C/… ou nome do modelo) que o aluno está executando. Opcional:
  // fichas legadas por weekday não têm divisão. String vazia é rejeitada.
  division: z.string().trim().min(1).optional(),
});

/** Registro de uma série executada (`workout_set_logs`). */
export const registrarSerieSchema = z.object({
  session_id: z.string().uuid('Sessão inválida.'),
  plan_item_id: z.string().uuid('Exercício inválido.'),
  set_number: z.coerce.number().int().min(1, 'A série deve ser 1 ou maior.'),
  reps_done: inteiroNaoNegativoOpcional,
  load_done: numeroNaoNegativoOpcional,
  completed: z.coerce.boolean().default(false),
});

/**
 * Intensidade percebida (RPE) opcional: inteiro de 1 a 10. Vazio/ausente →
 * `undefined`. Segue o padrão de preprocess do arquivo (FormData envia string).
 * Espelha a coluna `perceived_intensity` (`smallint`, nullable) de
 * `workout_sessions`.
 */
const intensidadePercebidaOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor);
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().int().min(1).max(10).optional());

/** Finalização de uma sessão (carimba `finished_at`, com nota e RPE opcionais). */
export const finalizarSessaoSchema = z.object({
  session_id: z.string().uuid('Sessão inválida.'),
  notes: z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    z.string().trim().min(1).optional()
  ),
  perceived_intensity: intensidadePercebidaOpcional,
});

export type IniciarSessaoInput = z.infer<typeof iniciarSessaoSchema>;
export type RegistrarSerieInput = z.infer<typeof registrarSerieSchema>;
export type FinalizarSessaoInput = z.infer<typeof finalizarSessaoSchema>;

/**
 * Tipo de ENTRADA de `registrarSerieSchema` (antes dos preprocessos). O cliente
 * envia `reps_done`/`load_done` como string (inputs numéricos aceitando vírgula
 * decimal) e `completed`/`set_number` em suas formas brutas; o `safeParse` na
 * Server Action coage tudo para o tipo de saída. A UI usa este tipo para não
 * precisar converter antes de chamar a action.
 */
export type RegistrarSerieEntrada = z.input<typeof registrarSerieSchema>;
