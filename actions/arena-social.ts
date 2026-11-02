'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  criarDueloSchema,
  definirHandleSchema,
  enviarSolicitacaoSchema,
  responderDueloSchema,
  responderSolicitacaoSchema,
} from '@/schemas/arena-social';

/**
 * Server Actions da UX SOCIAL do atleta na Arena (G3) — amizades e desafios
 * individuais. Mesmo molde de `actions/habitos.ts`: `getSessionUser()` → gate
 * `podeOperarProprio` (student OU trainer+self_managed) → validação zod na
 * BORDA → `createClient()` (RLS ativo, nunca `service_role`) → `supabase.rpc`
 * de uma função G3 `SECURITY DEFINER` → `revalidatePath('/aluno/arena')`.
 *
 * NENHUMA action escreve direto em `gamification_*`: toda regra (resolução de
 * handle, transições de amizade, criação/resposta/apuração de duelo, concessão
 * de medalha) vive nas funções do banco. Estas actions só repassam o `status`
 * do RPC. Erro inesperado → `console.error` + `{ ok:false, status:'erro' }`
 * (mensagem genérica pt-BR fica na UI).
 *
 * O aluno autônomo (trainer self_managed) usa estas actions como o aluno
 * vinculado, sem caso especial.
 */

/** Resultado uniforme das actions sociais: `ok` + o `status` repassado do RPC. */
export interface EstadoSocial {
  ok: boolean;
  /** Código de status do RPC (ex.: 'sent', 'already', 'not_found') ou interno. */
  status: string;
  /** Mensagem opcional em pt-BR (erros de borda/sessão). */
  message?: string;
}

/** `true` quando o usuário pode operar a própria Arena (aluno ou autônomo). */
function podeOperarProprio(usuario: {
  role: string;
  accountType: 'professional' | 'self_managed';
}): boolean {
  return (
    usuario.role === 'student' ||
    (usuario.role === 'trainer' && isSelfManaged(usuario))
  );
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

/**
 * Define (ou atualiza) o PRÓPRIO `@handle` social do atleta. Normaliza/valida na
 * borda (regex do handle) e grava em `profiles.social_handle` do próprio usuário
 * — a policy `profiles_update` (`user_id = auth.uid()`) e a constraint de formato
 * + índice único parcial `lower(social_handle)` são a fronteira do banco. Não é
 * escrita em `gamification_*`: o handle é coluna de `profiles`, de posse do dono.
 * Violação de unicidade (código `23505`) → status `em_uso`.
 */
export async function definirHandle(handle: string): Promise<EstadoSocial> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, status: 'sem_sessao', message: 'Sessão expirada.' };
  }
  if (!podeOperarProprio(usuario)) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Apenas o atleta pode definir o próprio handle.',
    };
  }

  const parsed = definirHandleSchema.safeParse({ handle });
  if (!parsed.success) {
    return { ok: false, status: 'handle_invalido', message: 'Handle inválido.' };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ social_handle: parsed.data.handle })
      .eq('user_id', usuario.userId);
    if (error) {
      // 23505 = unique_violation: o handle já pertence a outro atleta.
      if (error.code === '23505') {
        return { ok: false, status: 'em_uso', message: 'Esse @handle já está em uso.' };
      }
      console.error('[arena-social] definirHandle:', error.message);
      return { ok: false, status: 'erro', message: 'Não foi possível salvar o handle.' };
    }
    revalidatePath('/aluno/arena');
    return { ok: true, status: 'saved' };
  } catch (e) {
    console.error('[arena-social] definirHandle (exceção):', e);
    return { ok: false, status: 'erro', message: 'Não foi possível salvar o handle.' };
  }
}

/**
 * Envia uma solicitação de amizade resolvendo o alvo por `@handle`. A função do
 * banco resolve o handle SOMENTE entre atletas sociais e devolve
 * `{status:'sent'|'already'|'not_found'}` — o handle inexistente/não-adicionável
 * é indistinguível (não vaza existência).
 */
export async function enviarSolicitacaoPorHandle(handle: string): Promise<EstadoSocial> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, status: 'sem_sessao', message: 'Sessão expirada.' };
  }
  if (!podeOperarProprio(usuario)) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Apenas o atleta pode enviar solicitações.',
    };
  }

  const parsed = enviarSolicitacaoSchema.safeParse({ p_handle: handle });
  if (!parsed.success) {
    return { ok: false, status: 'handle_invalido', message: 'Handle inválido.' };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      'gamification_friend_request_by_handle',
      { p_handle: parsed.data.p_handle }
    );
    if (error) {
      console.error('[arena-social] enviarSolicitacao:', error.message);
      return { ok: false, status: 'erro', message: 'Não foi possível enviar a solicitação.' };
    }
    const status = statusDoRpc(data);
    revalidatePath('/aluno/arena');
    return { ok: status === 'sent' || status === 'already', status };
  } catch (e) {
    console.error('[arena-social] enviarSolicitacao (exceção):', e);
    return { ok: false, status: 'erro', message: 'Não foi possível enviar a solicitação.' };
  }
}

/**
 * Responde a uma solicitação/relação de amizade: `accept`/`reject`/`block`/
 * `unblock`/`remove`. As transições válidas (ex.: só o destinatário aceita uma
 * pendente) são impostas por `gamification_respond_friend_request`.
 */
export async function responderSolicitacao(
  requestId: string,
  acao: 'accept' | 'reject' | 'block' | 'unblock' | 'remove'
): Promise<EstadoSocial> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, status: 'sem_sessao', message: 'Sessão expirada.' };
  }
  if (!podeOperarProprio(usuario)) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Apenas o atleta pode responder solicitações.',
    };
  }

  const parsed = responderSolicitacaoSchema.safeParse({ request_id: requestId, acao });
  if (!parsed.success) {
    return { ok: false, status: 'invalido', message: 'Solicitação inválida.' };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      'gamification_respond_friend_request',
      { p_request_id: parsed.data.request_id, p_action: parsed.data.acao }
    );
    if (error) {
      console.error('[arena-social] responderSolicitacao:', error.message);
      return { ok: false, status: 'erro', message: 'Não foi possível responder a solicitação.' };
    }
    const status = statusDoRpc(data);
    revalidatePath('/aluno/arena');
    return {
      ok: status !== 'invalid' && status !== 'forbidden' && status !== 'erro',
      status,
    };
  } catch (e) {
    console.error('[arena-social] responderSolicitacao (exceção):', e);
    return { ok: false, status: 'erro', message: 'Não foi possível responder a solicitação.' };
  }
}

/**
 * Cria um duelo (desafio individual) de 7/15/30 dias com um amigo aceito. A
 * função valida a amizade e a duração e devolve `{status, challenge_id?}`.
 */
export async function criarDuelo(
  amigoId: string,
  dias: 7 | 15 | 30
): Promise<EstadoSocial> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, status: 'sem_sessao', message: 'Sessão expirada.' };
  }
  if (!podeOperarProprio(usuario)) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Apenas o atleta pode criar desafios.',
    };
  }

  const parsed = criarDueloSchema.safeParse({ friend_id: amigoId, dias });
  if (!parsed.success) {
    return { ok: false, status: 'invalido', message: 'Desafio inválido.' };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc('gamification_create_duel', {
      p_friend_id: parsed.data.friend_id,
      p_duration_days: parsed.data.dias,
    });
    if (error) {
      console.error('[arena-social] criarDuelo:', error.message);
      return { ok: false, status: 'erro', message: 'Não foi possível criar o desafio.' };
    }
    const status = statusDoRpc(data);
    revalidatePath('/aluno/arena');
    return { ok: status === 'created', status };
  } catch (e) {
    console.error('[arena-social] criarDuelo (exceção):', e);
    return { ok: false, status: 'erro', message: 'Não foi possível criar o desafio.' };
  }
}

/**
 * Responde a um convite de duelo (aceitar ou recusar). `gamification_respond_duel`
 * só permite ao convidado e devolve `{status}`.
 */
export async function responderDuelo(
  challengeId: string,
  aceitar: boolean
): Promise<EstadoSocial> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, status: 'sem_sessao', message: 'Sessão expirada.' };
  }
  if (!podeOperarProprio(usuario)) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Apenas o atleta pode responder desafios.',
    };
  }

  const parsed = responderDueloSchema.safeParse({
    challenge_id: challengeId,
    aceitar,
  });
  if (!parsed.success) {
    return { ok: false, status: 'invalido', message: 'Desafio inválido.' };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc('gamification_respond_duel', {
      p_challenge_id: parsed.data.challenge_id,
      p_accept: parsed.data.aceitar,
    });
    if (error) {
      console.error('[arena-social] responderDuelo:', error.message);
      return { ok: false, status: 'erro', message: 'Não foi possível responder o desafio.' };
    }
    const status = statusDoRpc(data);
    revalidatePath('/aluno/arena');
    return {
      ok: status === 'accepted' || status === 'cancelled',
      status,
    };
  } catch (e) {
    console.error('[arena-social] responderDuelo (exceção):', e);
    return { ok: false, status: 'erro', message: 'Não foi possível responder o desafio.' };
  }
}
