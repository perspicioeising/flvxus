import { z } from 'zod';

import type {
  ExperienceLevel,
  GoalType,
  StudentStatus,
} from '@/types/database.types';

/**
 * Schemas Zod do domínio de alunos (architecture.md §4).
 *
 * O MESMO schema valida no cliente (UX via react-hook-form + zodResolver) e no
 * servidor (segurança, nas Server Actions de `actions/alunos.ts`). As colunas
 * espelham `profiles` em `types/database.types.ts` (role='student').
 */

/** Níveis de experiência (enum `experience_level`). */
export const NIVEIS_EXPERIENCIA = [
  'beginner',
  'intermediate',
  'advanced',
] as const satisfies readonly ExperienceLevel[];

/** Objetivos (enum `goal`). */
export const OBJETIVOS = [
  'weight_loss',
  'muscle_gain',
  'maintenance',
  'conditioning',
  'rehabilitation',
  'performance',
] as const satisfies readonly GoalType[];

/** Status que o professor pode aplicar a um aluno (subconjunto de `student_status`). */
export const STATUS_ALUNO = ['active', 'inactive', 'archived'] as const satisfies readonly StudentStatus[];

/**
 * Opções de gênero. A coluna no banco é `text` livre, mas na UI padronizamos
 * num conjunto fechado (select) para evitar entrada digitável inconsistente.
 */
export const GENEROS = ['masculino', 'feminino', 'outro', 'nao_informado'] as const;
export type Genero = (typeof GENEROS)[number];

/**
 * Transforma string vazia/nula/`'undefined'`/`NaN` em `undefined` para campos
 * opcionais vindos de forms (o input numérico produz `NaN`; selects podem
 * mandar string vazia). Só então aplica o schema como opcional.
 */
const opcionalVazio = (schema: z.ZodTypeAny) =>
  z.preprocess((valor) => {
    if (valor === '' || valor === null || valor === undefined || valor === 'undefined') {
      return undefined;
    }
    if (typeof valor === 'number' && Number.isNaN(valor)) {
      return undefined;
    }
    return valor;
  }, schema.optional());

/**
 * Campos comuns a criar/editar aluno. `full_name` e `email` obrigatórios; os
 * demais opcionais (aceitam vazio no form).
 */
const camposBaseAluno = {
  full_name: z
    .string({ required_error: 'Informe o nome completo.' })
    .trim()
    .min(1, 'Informe o nome completo.'),
  email: z
    .string({ required_error: 'Informe o e-mail.' })
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('E-mail inválido.'),
  phone: opcionalVazio(z.string().trim().min(1)),
  birth_date: opcionalVazio(z.string().trim().min(1)),
  gender: opcionalVazio(
    z.enum(GENEROS, { errorMap: () => ({ message: 'Selecione um gênero válido.' }) })
  ),
  // Converte string vazia/NaN -> undefined (opcional); string numérica -> number.
  height_cm: z.preprocess(
    (valor) => {
      if (valor === '' || valor === null || valor === undefined) return undefined;
      const n = typeof valor === 'number' ? valor : Number(valor);
      return Number.isNaN(n) ? undefined : n;
    },
    z
      .number({ invalid_type_error: 'A altura deve ser um número.' })
      .positive('A altura deve ser um número positivo.')
      .optional()
  ),
  experience_level: opcionalVazio(
    z.enum(NIVEIS_EXPERIENCIA, {
      errorMap: () => ({ message: 'Selecione um nível válido.' }),
    })
  ),
  goal: opcionalVazio(
    z.enum(OBJETIVOS, { errorMap: () => ({ message: 'Selecione um objetivo válido.' }) })
  ),
};

/** Convite de aluno (cria o perfil role='student'). */
export const criarAlunoSchema = z.object(camposBaseAluno);

/** Edição de aluno existente. */
export const editarAlunoSchema = z.object(camposBaseAluno);

/** Alteração de status (ativar/inativar/arquivar). */
export const alterarStatusSchema = z.object({
  status: z.enum(STATUS_ALUNO, {
    errorMap: () => ({ message: 'Status inválido.' }),
  }),
});

export type CriarAlunoInput = z.infer<typeof criarAlunoSchema>;
export type EditarAlunoInput = z.infer<typeof editarAlunoSchema>;
export type AlterarStatusInput = z.infer<typeof alterarStatusSchema>;
