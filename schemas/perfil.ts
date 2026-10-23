import { z } from 'zod';

import { GENEROS } from '@/schemas/aluno';
import type { ConsentType, DataRequestType } from '@/types/database.types';

/**
 * Schemas Zod do PERFIL do aluno + LGPD (architecture.md §6.2, §11).
 *
 * O MESMO schema valida no cliente (UX via react-hook-form + zodResolver) e no
 * servidor (segurança, nas Server Actions de `actions/perfil.ts`).
 *
 * `editarPerfilSchema` é o SUBCONJUNTO de `profiles` que o próprio aluno pode
 * editar: a policy `profiles_update` permite ao dono (`user_id = auth.uid()`)
 * alterar seus dados pessoais. Campos sensíveis de gestão (role, status,
 * trainer_id, total_points, …) NÃO entram aqui — ficam a cargo do professor.
 */

/** Transforma string vazia/nula em `undefined` para campos opcionais de forms. */
const opcionalVazio = (schema: z.ZodTypeAny) =>
  z.preprocess((valor) => (valor === '' || valor === null ? undefined : valor), schema.optional());

/**
 * Número positivo opcional (altura — coluna `numeric`). Aceita vírgula decimal,
 * como é comum no pt-BR. Vazio → `undefined`. Mesma convenção de
 * `schemas/treino.ts`.
 */
const numeroPositivoOpcional = z.preprocess((valor) => {
  if (valor === '' || valor === null || valor === undefined) return undefined;
  if (typeof valor === 'string') {
    const n = Number(valor.replace(',', '.'));
    return Number.isNaN(n) ? valor : n;
  }
  return valor;
}, z.number().positive('A altura deve ser um número positivo.').optional());

/**
 * Edição dos próprios dados pelo aluno. `full_name` obrigatório; os demais
 * opcionais (aceitam vazio no form). O e-mail NÃO é editável aqui (identidade
 * da conta é gerida pelo Supabase Auth).
 */
export const editarPerfilSchema = z.object({
  full_name: z
    .string({ required_error: 'Informe o nome completo.' })
    .trim()
    .min(1, 'Informe o nome completo.'),
  phone: opcionalVazio(z.string().trim().min(1)),
  birth_date: opcionalVazio(z.string().trim().min(1)),
  gender: opcionalVazio(
    z.enum(GENEROS, { errorMap: () => ({ message: 'Selecione um gênero válido.' }) })
  ),
  height_cm: numeroPositivoOpcional,
});

/** Tipos de consentimento LGPD (enum `consent_type`). */
export const TIPOS_CONSENTIMENTO = [
  'data_processing',
  'health_data',
  'ai_processing',
  'terms',
] as const satisfies readonly ConsentType[];

/** Registro de consentimento: tipo + se foi concedido. */
export const registrarConsentimentoSchema = z.object({
  consent_type: z.enum(TIPOS_CONSENTIMENTO, {
    errorMap: () => ({ message: 'Tipo de consentimento inválido.' }),
  }),
  granted: z.boolean({ required_error: 'Informe se o consentimento foi concedido.' }),
});

/** Tipos de solicitação de dados (enum `data_request_type`). */
export const TIPOS_SOLICITACAO = ['export', 'delete'] as const satisfies readonly DataRequestType[];

/** Solicitação de exportação/exclusão de dados (titular dos dados). */
export const solicitarDadosSchema = z.object({
  request_type: z.enum(TIPOS_SOLICITACAO, {
    errorMap: () => ({ message: 'Tipo de solicitação inválido.' }),
  }),
});

export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;
export type RegistrarConsentimentoInput = z.infer<typeof registrarConsentimentoSchema>;
export type SolicitarDadosInput = z.infer<typeof solicitarDadosSchema>;
