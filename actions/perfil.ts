'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  editarPerfilSchema,
  registrarConsentimentoSchema,
  solicitarDadosSchema,
} from '@/schemas/perfil';
import type { ConsentType, DataRequestType } from '@/types/database.types';

/**
 * Server Actions do PERFIL do aluno + LGPD (architecture.md §6.2, §11).
 *
 * Toda mutação usa `createClient()` (RLS ativo) — nunca filtramos posse
 * manualmente. As policies garantem o isolamento:
 *   - `profiles_update` permite ao dono (`user_id = auth.uid()`) editar seus dados;
 *   - `consent_records_insert`/`data_requests_insert` exigem `tenant_id` do
 *     usuário e `user_id = auth.uid()` (por isso CARIMBAMOS essas colunas).
 *
 * Nada de service_role aqui: o aluno opera sempre no próprio contexto.
 */

/** Estado tipado retornado pelas actions para os forms (molde de `actions/treinos.ts`). */
export interface EstadoAcao {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
}

/** Converte os erros do Zod num mapa `campo -> primeira mensagem`. */
function erroDeCampo(flatten: {
  fieldErrors: Record<string, string[] | undefined>;
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [campo, mensagens] of Object.entries(flatten.fieldErrors)) {
    if (mensagens && mensagens.length > 0) {
      out[campo] = mensagens[0];
    }
  }
  return out;
}

/**
 * Atualiza os dados pessoais do próprio aluno (`profiles`). Valida com
 * `editarPerfilSchema` e grava apenas o subconjunto editável. O filtro
 * `.eq('user_id', ...)` é redundante com a policy `profiles_update` (que só
 * libera o dono), mas deixa a intenção explícita.
 */
export async function atualizarPerfil(formData: FormData): Promise<EstadoAcao> {
  const aluno = await getSessionUser();
  if (!aluno) {
    return { ok: false, message: 'Sessão expirada. Entre novamente.' };
  }

  const parsed = editarPerfilSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone ?? null,
      birth_date: parsed.data.birth_date ?? null,
      gender: parsed.data.gender ?? null,
      height_cm: parsed.data.height_cm ?? null,
    })
    .eq('user_id', aluno.userId);

  if (error) {
    return { ok: false, message: `Não foi possível salvar: ${error.message}` };
  }

  revalidatePath('/aluno/perfil');

  return { ok: true, message: 'Dados atualizados.' };
}

/**
 * Registra (append-only) um consentimento em `consent_records`. A tabela é um
 * histórico: cada mudança é uma nova linha, nunca um update. Carimba
 * `tenant_id`/`user_id` do aluno (exigência do `with check`); grava
 * `granted_at` quando concede e `revoked_at` quando revoga.
 */
export async function registrarConsentimento(
  consentType: ConsentType,
  granted: boolean
): Promise<EstadoAcao> {
  const aluno = await getSessionUser();
  if (!aluno) {
    return { ok: false, message: 'Sessão expirada. Entre novamente.' };
  }

  const parsed = registrarConsentimentoSchema.safeParse({
    consent_type: consentType,
    granted,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const agora = new Date().toISOString();

  const { data, error } = await supabase
    .from('consent_records')
    .insert({
      tenant_id: aluno.tenantId,
      user_id: aluno.userId,
      consent_type: parsed.data.consent_type,
      granted: parsed.data.granted,
      granted_at: parsed.data.granted ? agora : null,
      revoked_at: parsed.data.granted ? null : agora,
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível registrar o consentimento: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/aluno/perfil');

  return {
    ok: true,
    message: parsed.data.granted ? 'Consentimento registrado.' : 'Consentimento revogado.',
    id: data.id,
  };
}

/**
 * Solicita a exportação ou exclusão dos dados do aluno (`data_requests`), com
 * `status = 'requested'`. Carimba `tenant_id`/`user_id` do aluno. O
 * PROCESSAMENTO efetivo (gerar export / excluir) NÃO é feito nesta fase — fica
 * registrado como pendência (ADR 0012); aqui apenas abrimos a solicitação.
 */
export async function solicitarDados(requestType: DataRequestType): Promise<EstadoAcao> {
  const aluno = await getSessionUser();
  if (!aluno) {
    return { ok: false, message: 'Sessão expirada. Entre novamente.' };
  }

  const parsed = solicitarDadosSchema.safeParse({ request_type: requestType });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('data_requests')
    .insert({
      tenant_id: aluno.tenantId,
      user_id: aluno.userId,
      request_type: parsed.data.request_type,
      status: 'requested',
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: `Não foi possível registrar a solicitação: ${error?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/aluno/perfil');

  return {
    ok: true,
    message:
      parsed.data.request_type === 'export'
        ? 'Solicitação de exportação registrada.'
        : 'Solicitação de exclusão registrada.',
    id: data.id,
  };
}
