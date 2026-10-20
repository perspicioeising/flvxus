import { z } from 'zod';

import type { AssessmentProtocol, GoalType } from '@/types/database.types';

/**
 * Schemas Zod do domínio de avaliação física (architecture.md §4).
 *
 * O MESMO schema valida no cliente (react-hook-form + zodResolver) e no servidor
 * (Server Actions de `actions/avaliacoes.ts`). As colunas espelham
 * `physical_assessments` em `types/database.types.ts`.
 *
 * Refinamento por protocolo: cada protocolo de dobras exige um conjunto próprio
 * de medidas (ver lib/assessment/index.ts). O `superRefine` garante que, ao
 * escolher um protocolo que usa dobras, as dobras necessárias (por gênero)
 * estejam presentes. O protocolo 'manual' dispensa dobras e aceita o
 * `body_fat_pct` informado diretamente.
 */

/** Protocolos aceitos (enum `assessment_protocol`). */
export const PROTOCOLOS = [
  'pollock_3',
  'pollock_7',
  'guedes',
  'durnin',
  'manual',
] as const satisfies readonly AssessmentProtocol[];

/** Gênero usado nos cálculos (os protocolos distinguem male/female). */
export const GENEROS_AVALIACAO = ['male', 'female'] as const;

/** Objetivos (enum `goal`), reaproveitado da ficha do aluno. */
export const OBJETIVOS_AVALIACAO = [
  'weight_loss',
  'muscle_gain',
  'maintenance',
  'conditioning',
  'rehabilitation',
  'performance',
] as const satisfies readonly GoalType[];

/** Dobras exigidas por protocolo e gênero (em mm). Base do refinamento. */
export const DOBRAS_POR_PROTOCOLO: Record<
  Exclude<AssessmentProtocol, 'manual'>,
  { male: readonly DobraKey[]; female: readonly DobraKey[] }
> = {
  pollock_3: {
    male: ['skf_chest', 'skf_abdominal', 'skf_thigh'],
    female: ['skf_triceps', 'skf_suprailiac', 'skf_thigh'],
  },
  pollock_7: {
    male: ['skf_chest', 'skf_midaxillary', 'skf_triceps', 'skf_subscapular', 'skf_abdominal', 'skf_suprailiac', 'skf_thigh'],
    female: ['skf_chest', 'skf_midaxillary', 'skf_triceps', 'skf_subscapular', 'skf_abdominal', 'skf_suprailiac', 'skf_thigh'],
  },
  guedes: {
    male: ['skf_triceps', 'skf_suprailiac', 'skf_abdominal'],
    female: ['skf_thigh', 'skf_suprailiac', 'skf_subscapular'],
  },
  durnin: {
    male: ['skf_biceps', 'skf_triceps', 'skf_subscapular', 'skf_suprailiac'],
    female: ['skf_biceps', 'skf_triceps', 'skf_subscapular', 'skf_suprailiac'],
  },
};

/** Chaves de dobras cutâneas (algumas não têm coluna própria — vão para `measurements`). */
export type DobraKey =
  | 'skf_triceps'
  | 'skf_subscapular'
  | 'skf_chest'
  | 'skf_midaxillary'
  | 'skf_suprailiac'
  | 'skf_abdominal'
  | 'skf_thigh'
  | 'skf_biceps';

/** Dobras que possuem coluna dedicada em `physical_assessments`. */
export const DOBRAS_COM_COLUNA = [
  'skf_triceps',
  'skf_subscapular',
  'skf_chest',
  'skf_midaxillary',
  'skf_suprailiac',
  'skf_abdominal',
  'skf_thigh',
] as const satisfies readonly DobraKey[];

/**
 * Dobras sem coluna dedicada no schema v2 (gravadas em `measurements` jsonb).
 * `skf_biceps` é exigida por Durnin, mas não há coluna `skf_biceps` em
 * `physical_assessments` — documentado em docs/pendencias.md.
 */
export const DOBRAS_SEM_COLUNA = ['skf_biceps'] as const satisfies readonly DobraKey[];

/** Circunferências com coluna dedicada (em cm). */
export const CIRCUNFERENCIAS = [
  'neck_cm',
  'shoulder_cm',
  'chest_cm',
  'waist_cm',
  'abdomen_cm',
  'hip_cm',
  'left_arm_cm',
  'right_arm_cm',
  'left_thigh_cm',
  'right_thigh_cm',
  'left_calf_cm',
  'right_calf_cm',
] as const;

/**
 * Normaliza a entrada numérica vinda do form (sempre string): aceita decimal com
 * vírgula (pt-BR, ex.: "80,5") convertendo para ponto, e trata vazio/nulo como
 * `undefined`. Sem essa normalização, `z.coerce.number()` faria `Number("80,5")`
 * virar `NaN` e o parse falharia silenciosamente, impedindo o submit de chegar à
 * action e os cálculos de rodarem.
 */
function normalizarNumero(v: unknown): unknown {
  if (v === '' || v === null || v === undefined) return undefined;
  if (typeof v === 'string') return v.trim().replace(',', '.');
  return v;
}

/** Número opcional positivo (string vazia/null → undefined; aceita vírgula decimal). */
const numeroOpcional = (msg: string) =>
  z.preprocess(normalizarNumero, z.coerce.number().positive(msg).optional());

/** String opcional (string vazia/null → undefined). */
const stringOpcional = () =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().trim().min(1).optional());

/** Monta o shape de todas as dobras como números opcionais. */
const dobrasShape = Object.fromEntries(
  ([...DOBRAS_COM_COLUNA, ...DOBRAS_SEM_COLUNA] as DobraKey[]).map((k) => [
    k,
    numeroOpcional('A dobra deve ser um número positivo (mm).'),
  ])
) as Record<DobraKey, ReturnType<typeof numeroOpcional>>;

/** Monta o shape de todas as circunferências como números opcionais. */
const circunferenciasShape = Object.fromEntries(
  CIRCUNFERENCIAS.map((k) => [k, numeroOpcional('A circunferência deve ser um número positivo (cm).')])
) as Record<(typeof CIRCUNFERENCIAS)[number], ReturnType<typeof numeroOpcional>>;

/** Campos base da avaliação (sem refinamento por protocolo). */
const camposBase = {
  student_id: z.string({ required_error: 'Selecione o aluno.' }).uuid('Aluno inválido.'),
  assessed_at: stringOpcional(),
  age: numeroOpcional('A idade deve ser um número positivo.'),
  gender: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.enum(GENEROS_AVALIACAO, { errorMap: () => ({ message: 'Selecione o gênero.' }) }).optional()
  ),
  protocol: z.enum(PROTOCOLOS, {
    errorMap: () => ({ message: 'Selecione um protocolo válido.' }),
  }),
  weight_kg: numeroOpcional('O peso deve ser um número positivo (kg).'),
  height_cm: numeroOpcional('A altura deve ser um número positivo (cm).'),
  body_fat_pct: z.preprocess(
    normalizarNumero,
    z.coerce.number().min(1, 'Informe um %gordura entre 1 e 75.').max(75, 'Informe um %gordura entre 1 e 75.').optional()
  ),
  goal: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.enum(OBJETIVOS_AVALIACAO).optional()
  ),
  anamnesis: stringOpcional(),
  photos_consent: z.preprocess((v) => v === true || v === 'true' || v === 'on', z.boolean()),
  ...circunferenciasShape,
  ...dobrasShape,
};

/**
 * Aplica o refinamento por protocolo: valida que as dobras exigidas pelo
 * protocolo/gênero estão presentes; que protocolos de dobras têm gênero; que
 * protocolos com idade (todos exceto guedes) têm idade; e que 'manual' tem
 * `body_fat_pct`.
 */
function refinarPorProtocolo(
  dados: { protocol: AssessmentProtocol; gender?: 'male' | 'female'; age?: number; body_fat_pct?: number } & Record<string, unknown>,
  ctx: z.RefinementCtx
) {
  const { protocol } = dados;

  if (protocol === 'manual') {
    if (dados.body_fat_pct == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o %gordura para o protocolo manual.',
        path: ['body_fat_pct'],
      });
    }
    return;
  }

  // Protocolos de dobras exigem gênero.
  if (!dados.gender) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecione o gênero para este protocolo.',
      path: ['gender'],
    });
    return;
  }

  // Todos os protocolos de dobras, exceto Guedes, usam a idade.
  if (protocol !== 'guedes' && (dados.age == null || dados.age <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe a idade para este protocolo.',
      path: ['age'],
    });
  }

  const exigidas = DOBRAS_POR_PROTOCOLO[protocol][dados.gender];
  for (const dobra of exigidas) {
    if (dados[dobra] == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Dobra obrigatória para o protocolo selecionado.',
        path: [dobra],
      });
    }
  }
}

/** Schema de criação de avaliação (com refinamento por protocolo). */
export const criarAvaliacaoSchema = z.object(camposBase).superRefine(refinarPorProtocolo);

/** Schema de edição: mesmos campos/refinamento (o id vai à parte, na action). */
export const editarAvaliacaoSchema = criarAvaliacaoSchema;

export type CriarAvaliacaoInput = z.infer<typeof criarAvaliacaoSchema>;
export type EditarAvaliacaoInput = z.infer<typeof editarAvaliacaoSchema>;
