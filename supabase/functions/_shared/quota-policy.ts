/**
 * Política de franquia de IA — réplica MÍNIMA, Deno-compatível, do que vive em
 * `lib/billing/entitlement.ts` e `lib/billing/entitlements.ts`.
 *
 * As Edge Functions não podem importar de `lib/` (alias `@/`, só resolvido pelo
 * bundler do Next). Para não acoplar o runtime Deno a esse alias, replicamos
 * aqui APENAS o necessário para o gate de franquia:
 *  - `STATUSES_COM_DIREITO` / `statusComDireito` (quais status dão direito);
 *  - `aiFeatureForTier` (se o tier libera IA — `features.ai` de ENTITLEMENTS_BY_TIER).
 *
 * Mantenha em sincronia com `lib/billing/entitlements.ts`.
 *
 * Tipos locais (não importar de `@/types` por causa do alias): espelham
 * `SubscriptionStatus` e `PlanTier` de `types/database.types.ts`.
 */

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export type PlanTier =
  | 'solo'
  | 'team'
  | 'gym'
  | 'individual'
  | 'personal'
  | 'assessoria';

/** Statuses de assinatura que dão direito (espelha `lib/billing/entitlement.ts`). */
export const STATUSES_COM_DIREITO: readonly SubscriptionStatus[] = ['active', 'trialing'];

/** TRUE se o status dá direito ao uso (active/trialing). */
export function statusComDireito(status: SubscriptionStatus | null | undefined): boolean {
  return status != null && STATUSES_COM_DIREITO.includes(status);
}

/**
 * `features.ai` por tier (réplica de ENTITLEMENTS_BY_TIER). Todos os 6 tiers
 * ofertados liberam IA; tier desconhecido/null => false (lado seguro).
 */
export function aiFeatureForTier(tier: PlanTier | null | undefined): boolean {
  switch (tier) {
    case 'individual':
    case 'personal':
    case 'assessoria':
    case 'solo':
    case 'team':
    case 'gym':
      return true;
    default:
      return false;
  }
}

/**
 * Início do período de franquia como `date` (`YYYY-MM-DD`, UTC). Usa
 * `current_period_start` quando presente (truncado a date); senão o 1º dia do
 * mês corrente. Espelha `resolvePeriodStart` de `lib/ia/quota.ts` (Deno-safe).
 */
export function resolvePeriodStart(
  currentPeriodStart: string | null | undefined,
  now: Date = new Date(),
): string {
  if (typeof currentPeriodStart === 'string' && currentPeriodStart.trim().length > 0) {
    const parsed = new Date(currentPeriodStart);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}
