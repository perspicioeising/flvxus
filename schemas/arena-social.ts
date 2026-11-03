import { z } from 'zod';

/**
 * Schemas Zod de BORDA da UX social da Arena (G3). O MESMO schema valida no
 * cliente (UX) e no servidor (segurança, nas Server Actions de
 * `actions/arena-social.ts`). As regras espelham as constraints do banco
 * (FEAT-001): formato do `social_handle` (`^[a-z0-9_]{3,30}$`), ações válidas de
 * amizade/duelo e a duração de desafio restrita a 7/15/30 dias.
 *
 * A validação definitiva é das funções `SECURITY DEFINER` sob RLS; aqui é a
 * primeira barreira (rejeitar input malformado antes do RPC).
 */

/** Formato canônico do handle — mesma regex da constraint do banco. */
const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

/**
 * Definição do PRÓPRIO `@handle` social. O `transform` normaliza (trim, remove
 * `@` inicial, lower) antes de validar o formato — assim "@Joao" vira "joao".
 */
export const definirHandleSchema = z.object({
  handle: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, '').toLowerCase())
    .refine((v) => HANDLE_REGEX.test(v), {
      message: 'Use 3 a 30 caracteres: letras minúsculas, números ou _.',
    }),
});

/** Envio de solicitação de amizade por `@handle`. */
export const enviarSolicitacaoSchema = z.object({
  p_handle: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, '').toLowerCase())
    .refine((v) => HANDLE_REGEX.test(v), {
      message: 'Nome de usuário inválido.',
    }),
});

/** Resposta a uma solicitação/relação de amizade. */
export const responderSolicitacaoSchema = z.object({
  request_id: z.string().uuid('Solicitação inválida.'),
  acao: z.enum(['accept', 'reject', 'block', 'unblock', 'remove']),
});

/** Criação de um duelo (desafio individual) com um amigo. */
export const criarDueloSchema = z.object({
  friend_id: z.string().uuid('Amigo inválido.'),
  dias: z.union([z.literal(7), z.literal(15), z.literal(30)]),
});

/** Resposta (aceitar/recusar) a um convite de duelo. */
export const responderDueloSchema = z.object({
  challenge_id: z.string().uuid('Desafio inválido.'),
  aceitar: z.boolean(),
});

export type DefinirHandleInput = z.infer<typeof definirHandleSchema>;
export type EnviarSolicitacaoInput = z.infer<typeof enviarSolicitacaoSchema>;
export type ResponderSolicitacaoInput = z.infer<typeof responderSolicitacaoSchema>;
export type CriarDueloInput = z.infer<typeof criarDueloSchema>;
export type ResponderDueloInput = z.infer<typeof responderDueloSchema>;
