'use server';

import type { EstadoAcao } from '@/actions/perfil';
import { resolverRequestMeta } from '@/lib/legal/request-meta';
import { createClient } from '@/lib/supabase/server';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/versions';
import { registrarAceiteSchema, type RegistrarAceiteInput } from '@/schemas/legal';
import type { Database, LegalDocumentType } from '@/types/database.types';

/**
 * Server Action de aceite legal (design.md §2.6).
 *
 * Grava os aceites de Termos e Privacidade do usuário AUTENTICADO atual. É
 * chamada imperativamente logo após `signUp`/`updateUser` terem estabelecido a
 * sessão (não por `useFormState`) e também pelo gancho de materialização do
 * professor. Captura IP/UA do SERVIDOR via `headers()`; nunca confia no cliente
 * (RNF1).
 *
 * Contrato de retorno: adota o shape `EstadoAcao` do repo (actions/perfil.ts,
 * actions/treinos.ts) — MEDIUM #4 do design-review. A sessão é resolvida com
 * `supabase.auth.getUser()` (não `getSessionUser`) porque esta action pode
 * rodar fora do contexto de perfil consolidado e só precisa do id do usuário.
 */

/** Versão corrente por tipo de documento (fonte: lib/legal/versions.ts). */
const VERSAO_CORRENTE: Record<LegalDocumentType, string> = {
  terms: TERMS_VERSION,
  privacy: PRIVACY_VERSION,
};

export async function registrarAceiteLegal(
  input: RegistrarAceiteInput,
): Promise<EstadoAcao> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Recuperável: o aceite é materializado no próximo acesso autenticado.
    console.warn('[registrarAceiteLegal] sem sessão (not_authenticated)');
    return { ok: false, message: 'Sessão expirada. Entre novamente.' };
  }

  const parsed = registrarAceiteSchema.safeParse(input);
  if (!parsed.success) {
    console.warn('[registrarAceiteLegal] entrada inválida (invalid_input)');
    return { ok: false, message: 'Dados de aceite inválidos.' };
  }

  // Cada versão informada deve ser EXATAMENTE a constante corrente — impede
  // registrar aceite de uma versão que o usuário não viu (forjada/obsoleta).
  for (const doc of parsed.data.documents) {
    if (doc.version !== VERSAO_CORRENTE[doc.type]) {
      console.warn('[registrarAceiteLegal] versão divergente (version_mismatch)');
      return {
        ok: false,
        message: 'A versão do documento aceito está desatualizada. Recarregue a página.',
      };
    }
  }

  // tenant_id SEMPRE existe quando há sessão (o trigger handle_new_user cria
  // tenant + profile sincronamente no signUp — HIGH #1 do design-review).
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  const { ipAddress, userAgent } = await resolverRequestMeta();

  const linhas: Database['public']['Tables']['terms_acceptances']['Insert'][] =
    parsed.data.documents.map((doc) => ({
      user_id: user.id,
      tenant_id: profile?.tenant_id ?? null,
      document_type: doc.type,
      document_version: doc.version,
      ip_address: ipAddress,
      user_agent: userAgent,
    }));

  // Idempotente: reenvio da mesma (usuário, tipo, versão) é no-op pelo índice
  // único. A PRIMEIRA gravação é canônica (não "corrigimos" tenant_id em
  // reenvio) — design.md §2.6.
  const { error } = await supabase
    .from('terms_acceptances')
    .upsert(linhas, {
      onConflict: 'user_id,document_type,document_version',
      ignoreDuplicates: true,
    });

  if (error) {
    console.error('[registrarAceiteLegal] falha ao persistir (persist_failed):', error.message);
    return { ok: false, message: 'Não foi possível registrar o aceite. Tente novamente.' };
  }

  return { ok: true };
}
