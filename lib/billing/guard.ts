import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { effectiveEntitlements, type FeatureKey } from '@/lib/billing/entitlements';
import type { EstadoAcao } from '@/actions/_estado';
import type { PlanTier } from '@/types/database.types';

/**
 * Gate de ENTITLEMENT no BACKEND (Fase B2 / NFR-3). Lê a assinatura do tenant
 * e o `accountType` do usuário, resolve os direitos efetivos via
 * `effectiveEntitlements` (puro) e devolve um `EstadoAcao`. É a fronteira real:
 * mesmo com a UI burlada, uma feature bloqueada por plano retorna
 * `{ ok:false }`. A UI apenas espelha a mesma decisão.
 *
 * - `feature` = chave de feature: bloqueia quando o plano não a inclui.
 * - `feature` = null: bloqueia apenas quando o status não dá direito (ex.:
 *   criação de treinos, que todo plano com direito permite).
 */
const MSG_SEM_DIREITO =
  'Seu plano atual não inclui este recurso. Revise sua assinatura para liberá-lo.';

export async function requireEntitlement(feature: FeatureKey | null): Promise<EstadoAcao> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, message: 'Sessão expirada. Entre novamente.' };
  }

  const supabase = await createClient();

  // Linha de assinatura do tenant (via RLS). O tier vem do join a `plans`.
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, stripe_subscription_id, plans ( tier )')
    .eq('tenant_id', user.tenantId)
    .maybeSingle();

  const planos = (sub as { plans?: { tier: PlanTier } | { tier: PlanTier }[] } | null)?.plans;
  const tier = Array.isArray(planos) ? (planos[0]?.tier ?? null) : (planos?.tier ?? null);

  const entitlements = effectiveEntitlements({
    tier,
    status: sub?.status ?? null,
    accountType: user.accountType,
    hasSubscriptionRow: sub != null,
    hasStripeSubscriptionId: sub?.stripe_subscription_id != null,
  });

  if (feature != null) {
    if (!entitlements.features[feature]) {
      return { ok: false, message: MSG_SEM_DIREITO };
    }
    return { ok: true };
  }

  // feature === null: basta ter QUALQUER direito (status com direito). READONLY
  // (todas as features falsas) indica status sem direito.
  const temAlgumDireito = Object.values(entitlements.features).some(Boolean);
  if (!temAlgumDireito) {
    return { ok: false, message: MSG_SEM_DIREITO };
  }
  return { ok: true };
}
