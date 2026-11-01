import { describe, expect, it } from 'vitest';

import {
  ASSESSORIA,
  ENTITLEMENTS_BY_TIER,
  ENTITLEMENTS_READONLY,
  INDIVIDUAL,
  PERSONAL,
  effectiveEntitlements,
} from '@/lib/billing/entitlements';
import type { PlanTier } from '@/types/database.types';

/**
 * Testes HEADLESS (sem banco) do mapa de entitlements por tier e da função pura
 * `effectiveEntitlements` (design §B2). Cobre os 6 tiers (legados normalizados),
 * a graça pré-trial do autônomo e o fallback READONLY.
 */

describe('ENTITLEMENTS_BY_TIER', () => {
  it('cobre exaustivamente os 6 tiers', () => {
    const tiers: PlanTier[] = ['individual', 'personal', 'assessoria', 'solo', 'team', 'gym'];
    for (const tier of tiers) {
      expect(ENTITLEMENTS_BY_TIER[tier]).toBeDefined();
    }
  });

  it('normaliza os legados para os equivalentes da Fase B (DA-3)', () => {
    expect(ENTITLEMENTS_BY_TIER.solo).toBe(INDIVIDUAL);
    expect(ENTITLEMENTS_BY_TIER.team).toBe(PERSONAL);
    expect(ENTITLEMENTS_BY_TIER.gym).toBe(ASSESSORIA);
  });

  it('individual não gerencia filiados nem alunos; assessoria é ilimitado', () => {
    expect(INDIVIDUAL.canManageAffiliates).toBe(false);
    expect(INDIVIDUAL.canInviteStudents).toBe(false);
    expect(INDIVIDUAL.maxAffiliates).toBe(0);
    expect(PERSONAL.maxAffiliates).toBe(5);
    expect(ASSESSORIA.maxAffiliates).toBeNull();
    expect(ASSESSORIA.aiQuotaMonthly).toBeNull();
  });
});

describe('effectiveEntitlements', () => {
  it('resolve os 6 tiers quando o status dá direito', () => {
    for (const tier of ['individual', 'personal', 'assessoria', 'solo', 'team', 'gym'] as PlanTier[]) {
      const ent = effectiveEntitlements({
        tier,
        status: 'active',
        accountType: 'professional',
        hasSubscriptionRow: true,
        hasStripeSubscriptionId: true,
      });
      expect(ent).toBe(ENTITLEMENTS_BY_TIER[tier]);
    }
  });

  it('(i) autônomo sem linha/status null => individual trialing (graça)', () => {
    const ent = effectiveEntitlements({
      tier: null,
      status: null,
      accountType: 'self_managed',
      hasSubscriptionRow: false,
      hasStripeSubscriptionId: false,
    });
    expect(ent).toBe(INDIVIDUAL);
  });

  it('(ii NEW-2) autônomo incomplete, linha só-customer => individual, não READONLY', () => {
    const ent = effectiveEntitlements({
      tier: null,
      status: 'incomplete',
      accountType: 'self_managed',
      hasSubscriptionRow: true,
      hasStripeSubscriptionId: false,
    });
    expect(ent).toBe(INDIVIDUAL);
    expect(ent).not.toBe(ENTITLEMENTS_READONLY);
  });

  it('(iii) autônomo trialing com subscription real => resolve pela linha real', () => {
    const ent = effectiveEntitlements({
      tier: 'personal',
      status: 'trialing',
      accountType: 'self_managed',
      hasSubscriptionRow: true,
      hasStripeSubscriptionId: true,
    });
    // A graça NÃO se aplica (já há subscription real); resolve pelo tier da linha.
    expect(ent).toBe(PERSONAL);
  });

  it('(iv) professional incomplete => READONLY', () => {
    const ent = effectiveEntitlements({
      tier: 'personal',
      status: 'incomplete',
      accountType: 'professional',
      hasSubscriptionRow: true,
      hasStripeSubscriptionId: false,
    });
    expect(ent).toBe(ENTITLEMENTS_READONLY);
  });

  it('professional sem direito (canceled/past_due) => READONLY', () => {
    expect(
      effectiveEntitlements({
        tier: 'individual',
        status: 'canceled',
        accountType: 'professional',
        hasSubscriptionRow: true,
        hasStripeSubscriptionId: true,
      })
    ).toBe(ENTITLEMENTS_READONLY);
  });

  it('tier desconhecido com status com direito => READONLY', () => {
    const ent = effectiveEntitlements({
      tier: 'inexistente' as PlanTier,
      status: 'active',
      accountType: 'professional',
      hasSubscriptionRow: true,
      hasStripeSubscriptionId: true,
    });
    expect(ent).toBe(ENTITLEMENTS_READONLY);
  });
});
