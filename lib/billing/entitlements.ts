import type { PlanTier } from '@/types/database.types';

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
  /** `EstadoAcesso.podeEscrever`: trial vigente ou assinatura com direito. */
  podeEscrever: boolean;
}

/**
 * Resolve os direitos EFETIVOS de um tenant a partir do estado de acesso
 * (`lib/billing/acesso.ts`). Sem direito de escrita => READONLY; tier
 * desconhecido => READONLY (lado seguro); senão, os direitos do tier.
 * A antiga "graça pré-trial" infinita do autônomo foi removida: o trial agora
 * tem prazo (`subscriptions.trial_ends_at`).
 */
export function effectiveEntitlements(input: EffectiveEntitlementsInput): Entitlements {
  if (!input.podeEscrever || input.tier == null) {
    return ENTITLEMENTS_READONLY;
  }
  return ENTITLEMENTS_BY_TIER[input.tier] ?? ENTITLEMENTS_READONLY;
}
