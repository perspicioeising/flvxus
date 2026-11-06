import { getSessionUser, type SessionUser } from '@/lib/auth';
import { getAccessFor } from '@/lib/billing/access';
import { effectiveEntitlements, type FeatureKey } from '@/lib/billing/entitlements';
import { MSG_INDISPONIVEL, mensagemBloqueio } from '@/lib/billing/mensagens';
import type { EstadoAcao } from '@/actions/_estado';

/**
 * Gate de ENTITLEMENT / SOMENTE LEITURA no BACKEND. Lê o estado de acesso do
 * tenant (trial/assinatura, via RPC `billing_tenant_state`), resolve os direitos
 * e devolve um `EstadoAcao`. É a fronteira real (não usa RLS): mesmo com a UI
 * burlada, a escrita sem direito retorna `{ ok:false }` com mensagem pt-BR.
 * O aluno vinculado herda o estado do tenant do personal.
 *
 * - `feature` = chave de feature: bloqueia quando o plano não a inclui.
 * - `feature` = null: bloqueia apenas quando o tenant está em somente leitura.
 * - `user` (opcional): evita refazer `getSessionUser` quando a action já o tem.
 */
export const MSG_SEM_DIREITO =
  'Seu plano atual não inclui este recurso. Revise sua assinatura para liberá-lo.';

export async function requireEntitlement(
  feature: FeatureKey | null,
  user?: SessionUser | null
): Promise<EstadoAcao> {
  let acesso;
  if (user) {
    acesso = await getAccessFor(user);
  } else {
    const sessao = await getSessionUser();
    if (!sessao) {
      return { ok: false, message: 'Sessão expirada. Entre novamente.' };
    }
    acesso = await getAccessFor(sessao);
  }
  if (acesso.indisponivel) {
    return { ok: false, message: MSG_INDISPONIVEL };
  }
  if (!acesso.podeEscrever) {
    return { ok: false, message: mensagemBloqueio(acesso.motivo, acesso.perfil) };
  }
  if (feature != null) {
    const entitlements = effectiveEntitlements({ tier: acesso.tier, podeEscrever: true });
    if (!entitlements.features[feature]) {
      return { ok: false, message: MSG_SEM_DIREITO };
    }
  }
  return { ok: true };
}
