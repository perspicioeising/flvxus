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
 * o fallback READONLY (a graça pré-trial infinita do autônomo foi removida).
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
  it('resolve os 6 tiers quando há direito de escrita', () => {
    for (const tier of ['individual', 'personal', 'assessoria', 'solo', 'team', 'gym'] as PlanTier[]) {
      const ent = effectiveEntitlements({ tier, podeEscrever: true });
      expect(ent).toBe(ENTITLEMENTS_BY_TIER[tier]);
      expect(ent).not.toBe(ENTITLEMENTS_READONLY);
    }
  });
  it('sem direito de escrita => READONLY, qualquer que seja o tier', () => {
    for (const tier of ['individual', 'personal', 'assessoria', 'solo', 'team', 'gym'] as PlanTier[]) {
      expect(effectiveEntitlements({ tier, podeEscrever: false })).toBe(ENTITLEMENTS_READONLY);
    }
  });
  it('tier nulo/desconhecido => READONLY (lado seguro)', () => {
    expect(effectiveEntitlements({ tier: null, podeEscrever: true })).toBe(ENTITLEMENTS_READONLY);
    expect(effectiveEntitlements({ tier: undefined, podeEscrever: true })).toBe(
      ENTITLEMENTS_READONLY
    );
  });
  it('READONLY não libera nenhuma feature', () => {
    expect(Object.values(ENTITLEMENTS_READONLY.features).some(Boolean)).toBe(false);
  });
});
