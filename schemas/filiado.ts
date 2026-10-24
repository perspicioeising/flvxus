import { z } from 'zod';

import type { VisibilityModule } from '@/types/database.types';

/**
 * Schemas Zod do domínio de FILIADOS e VISIBILIDADE (Fase 3).
 * O MESMO schema valida no cliente (UX) e no servidor (segurança) nas actions
 * de `actions/filiados.ts`.
 */

/** Módulos de visibilidade (enum `visibility_module`). */
export const MODULOS_VISIBILIDADE = [
  'students',
  'workouts',
  'assessments',
  'diets',
  'exercises',
] as const satisfies readonly VisibilityModule[];

/** Convite de filiado (cria o perfil role='trainer', is_tenant_master=false). */
export const convidarFiliadoSchema = z.object({
  full_name: z
    .string({ required_error: 'Informe o nome completo.' })
    .trim()
    .min(2, 'Informe o nome completo.')
    .max(120, 'Nome muito longo.'),
  email: z
    .string({ required_error: 'Informe o e-mail.' })
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('E-mail inválido.'),
});

/** Remoção/desativação de filiado. */
export const removerFiliadoSchema = z.object({
  userId: z.string({ required_error: 'Filiado inválido.' }).uuid('Filiado inválido.'),
});

/**
 * Atualização de um estado de visibilidade (um módulo por vez). `is_open` aceita
 * boolean ou as strings 'true'/'false' (vindas de FormData). `z.coerce.boolean`
 * trataria 'false' como true — por isso o preprocess explícito.
 */
export const atualizarVisibilidadeSchema = z.object({
  module: z.enum(MODULOS_VISIBILIDADE, {
    errorMap: () => ({ message: 'Módulo inválido.' }),
  }),
  is_open: z.preprocess((valor) => {
    if (typeof valor === 'boolean') return valor;
    if (valor === 'true' || valor === 'on' || valor === '1') return true;
    if (valor === 'false' || valor === 'off' || valor === '0') return false;
    return valor;
  }, z.boolean({ required_error: 'Estado inválido.', invalid_type_error: 'Estado inválido.' })),
});

export type ConvidarFiliadoInput = z.infer<typeof convidarFiliadoSchema>;
export type RemoverFiliadoInput = z.infer<typeof removerFiliadoSchema>;
export type AtualizarVisibilidadeInput = z.infer<typeof atualizarVisibilidadeSchema>;
