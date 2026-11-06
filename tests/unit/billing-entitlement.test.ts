import { describe, expect, it } from 'vitest';

import {
  canAddAffiliate,
  moduleIsOpen,
  statusComDireito,
} from '@/lib/billing/entitlement';

/**
 * Testes HEADLESS (sem banco) dos helpers puros que espelham a RPC
 * can_add_affiliate() e app_module_is_open() (design §12). Cobre os casos do
 * §6f/MED #8 e a semântica default-aberta da visibilidade.
 */

describe('statusComDireito', () => {
  it('reconhece active e trialing', () => {
    expect(statusComDireito('active')).toBe(true);
    expect(statusComDireito('trialing')).toBe(true);
  });

  it('nega demais status e ausência de assinatura', () => {
    expect(statusComDireito('past_due')).toBe(false);
    expect(statusComDireito('canceled')).toBe(false);
    expect(statusComDireito('incomplete')).toBe(false);
    expect(statusComDireito('unpaid')).toBe(false);
    expect(statusComDireito(null)).toBe(false);
    expect(statusComDireito(undefined)).toBe(false);
  });
});

describe('canAddAffiliate', () => {
  it('bloqueia quando não há direito de escrita (sem assinatura, trial expirado, inadimplente)', () => {
    expect(canAddAffiliate({ podeEscrever: false, maxAffiliates: 5, usedActive: 0 })).toBe(false);
  });
  it('Solo (max_affiliates = 0) sempre bloqueia, mesmo com direito', () => {
    expect(canAddAffiliate({ podeEscrever: true, maxAffiliates: 0, usedActive: 0 })).toBe(false);
  });
  it('ilimitado (max_affiliates = null) com direito libera', () => {
    expect(canAddAffiliate({ podeEscrever: true, maxAffiliates: null, usedActive: 999 })).toBe(true);
  });
  it('libera enquanto usados < limite e bloqueia ao atingir', () => {
    expect(canAddAffiliate({ podeEscrever: true, maxAffiliates: 5, usedActive: 4 })).toBe(true);
    expect(canAddAffiliate({ podeEscrever: true, maxAffiliates: 5, usedActive: 5 })).toBe(false);
  });
  it('bloqueia quando o plano ainda não foi resolvido (plan_id nulo)', () => {
    expect(
      canAddAffiliate({
        podeEscrever: true,
        maxAffiliates: 5,
        usedActive: 0,
        hasResolvedPlan: false,
      })
    ).toBe(false);
  });
});
describe('moduleIsOpen', () => {
  it('ausência de config => LIBERADO (true)', () => {
    expect(moduleIsOpen(null, 'workouts')).toBe(true);
    expect(moduleIsOpen({}, 'diets')).toBe(true);
    expect(moduleIsOpen({ workouts: false }, 'diets')).toBe(true);
  });

  it('respeita o estado configurado do módulo', () => {
    expect(moduleIsOpen({ workouts: false }, 'workouts')).toBe(false);
    expect(moduleIsOpen({ workouts: true }, 'workouts')).toBe(true);
  });
});
