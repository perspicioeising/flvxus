'use server';

import { revalidatePath } from 'next/cache';

import { assertMaster } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteUrl } from '@/lib/site-url';
import { erroDeCampo } from '@/actions/_estado';
import {
  atualizarVisibilidadeSchema,
  convidarFiliadoSchema,
  removerFiliadoSchema,
} from '@/schemas/filiado';

export type { EstadoAcao } from '@/actions/_estado';
import type { EstadoAcao } from '@/actions/_estado';

/**
 * Server Actions de FILIADOS e VISIBILIDADE (Fase 3). TODAS são MASTER-ONLY: o
 * gate `assertMaster()` é decidido no servidor (NFR3). O filiado nunca vê nem
 * executa estas actions. O enforcement de limite de filiados é no banco
 * (RPC can_add_affiliate) — nunca só no front (FR8.3).
 */

/**
 * Convida um filiado: cria o usuário em `auth.users` (convite por e-mail) com
 * `is_affiliate:'true'` (faz `handle_new_user` curto-circuitar e NÃO criar um
 * tenant próprio) e insere o `profiles` role='trainer', is_tenant_master=false,
 * no tenant do master. ANTES de inserir, verifica o limite do plano via RPC.
 */
export async function convidarFiliado(
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const master = await assertMaster();
  if (!master) {
    return { ok: false, message: 'Acesso negado. Apenas o personal master pode convidar filiados.' };
  }

  const parsed = convidarFiliadoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const dados = parsed.data;

  // Enforcement de limite no SERVIDOR (ponto único): RPC can_add_affiliate().
  // Mesmo que a UI seja burlada, aqui bloqueia (FR8.3).
  const supabase = await createClient();
  const { data: podeAdicionar, error: erroLimite } = await supabase.rpc('can_add_affiliate');

  if (erroLimite) {
    console.error('[convidarFiliado] Falha em can_add_affiliate:', erroLimite.message);
    return {
      ok: false,
      message: 'Não foi possível verificar o limite do seu plano. Tente novamente.',
    };
  }

  if (!podeAdicionar) {
    return {
      ok: false,
      message:
        'Seu plano atual não permite adicionar mais filiados. Faça upgrade para ' +
        'Equipe ou Academia na tela de Plano.',
    };
  }

  const admin = createAdminClient(master.tenantId);

  // 1) Cria o usuário de auth e dispara o convite por e-mail. `is_affiliate:'true'`
  // é o que faz o trigger handle_new_user NÃO criar um tenant próprio (design §1).
  const { data: convite, error: erroConvite } = await admin.authAdmin.inviteUserByEmail(
    dados.email,
    {
      data: { full_name: dados.full_name, role: 'trainer', is_affiliate: 'true' },
      redirectTo: siteUrl('/callback?next=/set-password'),
    }
  );

  if (erroConvite || !convite?.user) {
    const motivo = (erroConvite?.message ?? '').toLowerCase();
    const jaExiste =
      motivo.includes('already') ||
      motivo.includes('registered') ||
      motivo.includes('exists') ||
      motivo.includes('duplicate');

    if (jaExiste) {
      return {
        ok: false,
        message:
          'Este e-mail já tem uma conta e não pode ser convidado como filiado. ' +
          'Use outro e-mail.',
        fieldErrors: { email: 'E-mail já cadastrado.' },
      };
    }

    console.error('[convidarFiliado] Falha no inviteUserByEmail:', erroConvite?.message);
    return {
      ok: false,
      message: erroConvite?.message
        ? `Não foi possível convidar: ${erroConvite.message}`
        : 'Não foi possível convidar o filiado (resposta vazia do servidor de auth). ' +
          'Verifique SUPABASE_SERVICE_ROLE_KEY e o envio de e-mail (SMTP) no Supabase.',
      fieldErrors: { email: 'Não foi possível convidar este e-mail.' },
    };
  }

  // 2) Insere o perfil do filiado (role='trainer', is_tenant_master=false). O
  // admin client carimba `tenant_id` = tenant do master. trainer_id fica NULL
  // (o vínculo com o master é pelo tenant/owner — design §1).
  const { error: erroPerfil } = (await admin.insert('profiles', {
    user_id: convite.user.id,
    role: 'trainer',
    is_tenant_master: false,
    trainer_id: null,
    full_name: dados.full_name,
    email: dados.email,
  })) as unknown as { error: { message: string } | null };

  if (erroPerfil) {
    return {
      ok: false,
      message: `Convite enviado, mas falhou ao criar o perfil: ${erroPerfil.message}`,
    };
  }

  revalidatePath('/professor/configuracoes');

  return { ok: true, message: 'Convite enviado ao filiado.', id: convite.user.id };
}

/**
 * Desativa um filiado (não deleta — preserva a autoria histórica). Marca
 * `deactivated_at = now()`. O acesso do filiado é cortado em `getSessionUser`.
 * Recusa desativar o próprio master e qualquer um de outro tenant (RLS barra).
 */
export async function removerFiliado(userId: string): Promise<EstadoAcao> {
  const master = await assertMaster();
  if (!master) {
    return { ok: false, message: 'Acesso negado.' };
  }

  const parsed = removerFiliadoSchema.safeParse({ userId });
  if (!parsed.success) {
    return { ok: false, message: 'Filiado inválido.' };
  }

  if (parsed.data.userId === master.userId) {
    return { ok: false, message: 'Você não pode desativar a própria conta master.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ deactivated_at: new Date().toISOString() })
    .eq('user_id', parsed.data.userId)
    .eq('role', 'trainer')
    .eq('is_tenant_master', false)
    .select('user_id');

  if (error) {
    return { ok: false, message: `Não foi possível desativar: ${error.message}` };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: 'Filiado não encontrado neste tenant.' };
  }

  revalidatePath('/professor/configuracoes');

  return { ok: true, message: 'Filiado desativado.', id: parsed.data.userId };
}

/**
 * Atualiza a visibilidade de um módulo do tenant (LIBERADO/BLOQUEADO). Mutação
 * via RLS (`createClient`): a policy `tmv_update` garante master+tenant.
 *
 * Caveat de propagação (NIT #13): `revalidatePath` só revalida a rota do master;
 * a sessão do filiado é outro usuário. Como a RLS lê a config ao vivo, o novo
 * estado vale para o filiado na PRÓXIMA request/navegação dele — não em tempo real.
 */
export async function atualizarVisibilidade(
  _prev: EstadoAcao | undefined,
  formData: FormData
): Promise<EstadoAcao> {
  const master = await assertMaster();
  if (!master) {
    return { ok: false, message: 'Acesso negado.' };
  }

  const parsed = atualizarVisibilidadeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Dados de visibilidade inválidos.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('tenant_module_visibility')
    .update({ is_open: parsed.data.is_open })
    .eq('tenant_id', master.tenantId)
    .eq('module', parsed.data.module);

  if (error) {
    return { ok: false, message: `Não foi possível salvar a visibilidade: ${error.message}` };
  }

  revalidatePath('/professor/configuracoes');

  return {
    ok: true,
    message: parsed.data.is_open
      ? 'Módulo liberado para todos os personais.'
      : 'Módulo restrito: cada filiado vê apenas o que cadastrou.',
  };
}
