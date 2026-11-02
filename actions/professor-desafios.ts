'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  criarDesafioTurmaSchema,
  type CriarDesafioTurmaInput,
} from '@/schemas/professor-desafios';

/**
 * Server Action do painel de desafios do PERSONAL (G3, B2B intra-tenant). Mesmo
 * molde de `actions/arena-social.ts`: `getSessionUser()` → gate →
 * validação zod na BORDA → `createClient()` (RLS ativo, nunca `service_role`) →
 * `supabase.rpc('gamification_create_coach_challenge', ...)` →
 * `revalidatePath('/professor/desafios')` → repassa o `{status}` do RPC.
 *
 * DEFESA EM PROFUNDIDADE: além do gate de rota em `desafios/layout.tsx`, esta
 * action RECUSA o aluno autônomo (`isSelfManaged`) antes de qualquer RPC —
 * espelhando o `forbidden` da própria função `SECURITY DEFINER` (que gateia por
 * `account_type='professional'`, não por `role`). Nenhuma regra de negócio vive
 * aqui: o pertencimento ao tenant, o teto de membros e o `tenant_id` são
 * resolvidos dentro da função do banco.
 */

/** Resultado uniforme da action: `ok` + o `status` repassado do RPC. */
export interface EstadoDesafio {
  ok: boolean;
  /** Código de status do RPC (ex.: 'created', 'forbidden') ou interno. */
  status: string;
  /** Mensagem opcional em pt-BR (erros de borda/sessão). */
  message?: string;
  /** Id do desafio criado, quando `status === 'created'`. */
  challengeId?: string;
}

/** Extrai o campo `status` de um retorno jsonb de RPC, com fallback. */
function statusDoRpc(data: unknown, fallback = 'erro'): string {
  if (data && typeof data === 'object' && 'status' in data) {
    const s = (data as { status: unknown }).status;
    if (typeof s === 'string') {
      return s;
    }
  }
  return fallback;
}

/** Extrai o `challenge_id` de um retorno jsonb de RPC, quando presente. */
function challengeIdDoRpc(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'challenge_id' in data) {
    const id = (data as { challenge_id: unknown }).challenge_id;
    if (typeof id === 'string') {
      return id;
    }
  }
  return undefined;
}

/**
 * Cria um desafio da turma (kind='coach') com os alunos selecionados do tenant,
 * duração 7/15/30 dias, e meta/recompensa em texto livre. Recusa o autônomo
 * (defesa em profundidade) e repassa o `{status}` da função do banco.
 */
export async function criarDesafioTurma(
  input: CriarDesafioTurmaInput
): Promise<EstadoDesafio> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, status: 'sem_sessao', message: 'Sessão expirada.' };
  }

  // Defesa em profundidade: o painel do personal é exclusivo do profissional
  // (account_type='professional'). O autônomo (trainer self_managed) é barrado
  // ANTES de qualquer RPC — espelha o `forbidden` da função 4.3.
  if (isSelfManaged(usuario)) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Apenas o personal pode criar desafios da turma.',
    };
  }

  const parsed = criarDesafioTurmaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 'invalido', message: 'Desafio inválido.' };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      'gamification_create_coach_challenge',
      {
        p_member_ids: parsed.data.memberIds,
        p_duration_days: parsed.data.dias,
        p_title: parsed.data.title ?? null,
        p_goal_text: parsed.data.goalText ?? null,
        p_reward_text: parsed.data.rewardText ?? null,
      }
    );
    if (error) {
      console.error('[professor-desafios] criarDesafioTurma:', error.message);
      return { ok: false, status: 'erro', message: 'Não foi possível criar o desafio.' };
    }
    const status = statusDoRpc(data);
    revalidatePath('/professor/desafios');
    return {
      ok: status === 'created',
      status,
      challengeId: challengeIdDoRpc(data),
    };
  } catch (e) {
    console.error('[professor-desafios] criarDesafioTurma (exceção):', e);
    return { ok: false, status: 'erro', message: 'Não foi possível criar o desafio.' };
  }
}
