'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { editarPerfilProfessorSchema, editarPerfilSchema } from '@/schemas/perfil';

/**
 * Server Actions do PERFIL do aluno (architecture.md §6.2).
 *
 * Toda mutação usa `createClient()` (RLS ativo) — nunca filtramos posse
 * manualmente. A policy `profiles_update` permite ao dono
 * (`user_id = auth.uid()`) editar seus dados.
 *
 * Nada de service_role aqui: o aluno opera sempre no próprio contexto.
 *
 * LGPD adiado por decisão de escopo (FEAT-003): as actions de consentimento
 * (`registrarConsentimento`) e de solicitação de export/exclusão
 * (`solicitarDados`) foram removidas junto com a UI de LGPD do aluno. Os
 * schemas em `schemas/perfil.ts` continuam no repo (sem uso na UI). Para
 * reativar, ver docs/pendencias.md.
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
 * Atualiza o perfil do próprio professor. Grava `full_name`/`phone` em
 * `profiles` (policy `profiles_update` libera o dono) e `tenants.name` quando
 * `business_name` é informado — mas só o owner do tenant altera `tenants`: o
 * filtro `.eq('id', tenantId).eq('owner_id', userId)` espelha a policy
 * `tenants_update`, então um não-owner afeta 0 linhas sem gerar erro.
 *
 * Sem service_role: o professor opera sempre no próprio contexto sob RLS.
 */
export async function atualizarPerfilProfessor(
  formData: FormData,
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode editar o perfil.' };
  }

  const parsed = editarPerfilProfessorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { error: erroPerfil } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone ?? null,
    })
    .eq('user_id', professor.userId);

  if (erroPerfil) {
    return { ok: false, message: `Não foi possível salvar: ${erroPerfil.message}` };
  }

  if (parsed.data.business_name) {
    const { error: erroTenant } = await supabase
      .from('tenants')
      .update({ name: parsed.data.business_name })
      .eq('id', professor.tenantId)
      .eq('owner_id', professor.userId);

    if (erroTenant) {
      return {
        ok: false,
        message: `Não foi possível salvar o nome do negócio: ${erroTenant.message}`,
      };
    }
  }

  revalidatePath('/professor/configuracoes');

  return { ok: true, message: 'Dados atualizados.' };
}
