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

/** Transforma string vazia em `undefined` para campos opcionais vindos de forms. */
const opcionalVazio = (schema: z.ZodTypeAny) =>
  z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), schema.optional());

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
  gender: opcionalVazio(z.string().trim().min(1)),
  height_cm: opcionalVazio(
    z.coerce.number().positive('A altura deve ser um número positivo.')
  ),
  experience_level: opcionalVazio(z.enum(NIVEIS_EXPERIENCIA)),
  goal: opcionalVazio(z.enum(OBJETIVOS)),
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
