import { statusComDireito } from '@/lib/billing/entitlement';
import type { AccountType, PlanTier, SubscriptionStatus } from '@/types/database.types';

/**
 * Mapa de ENTITLEMENTS por tier (Fase B2 / design.md §B2). Função PURA e
 * testável sem banco: dado o tier/status/accountType do tenant, decide o que o
 * plano libera. É a fonte ÚNICA da decisão; `lib/billing/guard.ts` lê as linhas
 * reais e chama `effectiveEntitlements` — a UI apenas espelha (NFR-3).
 *
 * NÃO confundir com `lib/billing/entitlement.ts` (singular), que espelha a RPC
 * `can_add_affiliate()` e a visibilidade de módulos.
 */

/** Chaves de feature controladas por plano. */
export type FeatureKey = 'ai' | 'diets' | 'assessments' | 'evolution';

/** Direitos efetivos de um tenant resolvidos a partir do seu plano/status. */
export interface Entitlements {
  /** Pode gerenciar filiados (trainers não-master do tenant). */
  canManageAffiliates: boolean;
  /** Pode convidar/gerenciar alunos. */
  canInviteStudents: boolean;
  /** Limite de filiados: null = ilimitado; 0 = nenhum. */
  maxAffiliates: number | null;
  /** Cota mensal de gerações de IA: null = ilimitado. */
  aiQuotaMonthly: number | null;
  /** Features liberadas por este plano. */
  features: Record<FeatureKey, boolean>;
}

/** INDIVIDUAL (aluno autônomo): só a própria conta, IA/dietas/avaliações/evolução. */
export const INDIVIDUAL: Entitlements = {
  canManageAffiliates: false,
  canInviteStudents: false,
  maxAffiliates: 0,
  aiQuotaMonthly: 50,
  features: { ai: true, diets: true, assessments: true, evolution: true },
};

/** PERSONAL (personal com time): gerencia alunos e até 5 filiados. */
export const PERSONAL: Entitlements = {
  canManageAffiliates: true,
  canInviteStudents: true,
  maxAffiliates: 5,
  aiQuotaMonthly: 300,
  features: { ai: true, diets: true, assessments: true, evolution: true },
};

/** ASSESSORIA (academia/assessoria): filiados ilimitados, IA ilimitada. */
export const ASSESSORIA: Entitlements = {
  canManageAffiliates: true,
  canInviteStudents: true,
  maxAffiliates: null,
  aiQuotaMonthly: null,
  features: { ai: true, diets: true, assessments: true, evolution: true },
};

/**
 * Fallback READONLY: nenhum direito. Usado para status sem direito
 * (professional vencido/incompleto) e para tier desconhecido.
 */
export const ENTITLEMENTS_READONLY: Entitlements = {
  canManageAffiliates: false,
  canInviteStudents: false,
  maxAffiliates: 0,
  aiQuotaMonthly: 0,
  features: { ai: false, diets: false, assessments: false, evolution: false },
};

/**
 * Mapa EXAUSTIVO dos 6 tiers de `plan_tier`. Os legados (solo/team/gym) são
 * normalizados para os novos equivalentes por DA-3:
 *  - solo  → individual
 *  - team  → personal
 *  - gym   → assessoria
 */
export const ENTITLEMENTS_BY_TIER: Record<PlanTier, Entitlements> = {
  individual: INDIVIDUAL,
  personal: PERSONAL,
  assessoria: ASSESSORIA,
  solo: INDIVIDUAL,
  team: PERSONAL,
  gym: ASSESSORIA,
};

/** Entrada de `effectiveEntitlements` (tudo resolvido fora do banco). */
export interface EffectiveEntitlementsInput {
  /** Tier do plano vigente (null quando não resolvido). */
  tier: PlanTier | null | undefined;
  /** Status da assinatura (null quando não há linha). */
  status: SubscriptionStatus | null | undefined;
  /** Tipo de conta do master do tenant. */
  accountType: AccountType;
  /** TRUE quando existe uma linha em `subscriptions` para o tenant. */
  hasSubscriptionRow: boolean;
  /** TRUE quando a linha já tem `stripe_subscription_id` (assinatura real). */
  hasStripeSubscriptionId: boolean;
}

/** Statuses pré-trial do autônomo que ainda não configuraram assinatura real. */
const STATUS_PRE_TRIAL: readonly (SubscriptionStatus | null)[] = [
  null,
  'incomplete',
  'incomplete_expired',
];

/**
 * Resolve os direitos EFETIVOS de um tenant.
 *
 * Graça pré-trial do aluno autônomo (self_managed): enquanto ainda não houver
 * `stripe_subscription_id` e o status estiver num dos pré-trial (null/incomplete/
 * incomplete_expired), tratamos como `individual` em `trialing` — o autônomo
 * usa o produto antes de configurar o Stripe (uma linha só-customer não derruba
 * essa graça). Resolvida a assinatura real, caímos na regra normal.
 *
 * Para os demais casos: status sem direito (não active/trialing) => READONLY;
 * tier desconhecido => READONLY; senão, os direitos do tier.
 */
export function effectiveEntitlements(input: EffectiveEntitlementsInput): Entitlements {
  const { accountType, status, hasStripeSubscriptionId } = input;

  let tier = input.tier;
  let statusEfetivo = status;

  // Graça pré-trial do autônomo: sem assinatura real e status pré-trial.
  if (
    accountType === 'self_managed' &&
    !hasStripeSubscriptionId &&
    STATUS_PRE_TRIAL.includes(status ?? null)
  ) {
    tier = 'individual';
    statusEfetivo = 'trialing';
  }

  if (!statusComDireito(statusEfetivo)) {
    return ENTITLEMENTS_READONLY;
  }

  if (tier == null) {
    return ENTITLEMENTS_READONLY;
  }

  return ENTITLEMENTS_BY_TIER[tier] ?? ENTITLEMENTS_READONLY;
}
