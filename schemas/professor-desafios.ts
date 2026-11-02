import { z } from 'zod';

/**
 * Schema Zod de BORDA do painel de desafios do PERSONAL (G3). O MESMO schema
 * valida no cliente (UX) e no servidor (segurança, na Server Action
 * `actions/professor-desafios.ts`). As regras espelham as guardas da função
 * `gamification_create_coach_challenge` (FEAT-001): duração restrita a 7/15/30
 * dias, pelo menos um aluno selecionado, e campos de texto opcionais (título,
 * meta, recompensa) limitados a 280 caracteres.
 *
 * A validação definitiva (gate por `account_type`, pertencimento ao tenant,
 * teto de 100 membros) é da função `SECURITY DEFINER` sob RLS; aqui é a
 * primeira barreira — rejeitar input malformado antes do RPC.
 */

/** Texto livre opcional (título/meta/recompensa), `trim` e limite de 280. */
const textoOpcional = z
  .string()
  .trim()
  .max(280, 'Use no máximo 280 caracteres.')
  .optional();

/** Criação de um desafio da turma (kind='coach'). */
export const criarDesafioTurmaSchema = z.object({
  title: textoOpcional,
  dias: z.union([z.literal(7), z.literal(15), z.literal(30)]),
  memberIds: z
    .array(z.string().uuid('Aluno inválido.'))
    .min(1, 'Selecione pelo menos um aluno.'),
  goalText: textoOpcional,
  rewardText: textoOpcional,
});

export type CriarDesafioTurmaInput = z.infer<typeof criarDesafioTurmaSchema>;
