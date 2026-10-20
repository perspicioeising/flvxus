import { describe, expect, it } from 'vitest';

import {
  checkRateLimit,
  decide,
  windowStartIso,
  type RateLimitWindow,
} from '@/supabase/functions/_shared/rate-limit';
import { estimateCostUsd } from '@/supabase/functions/_shared/logging';

const window: RateLimitWindow = { maxCalls: 3, windowMs: 60 * 60 * 1000 };

describe('rate-limit: windowStartIso', () => {
  it('subtrai a janela do instante atual', () => {
    const now = new Date('2026-10-20T12:00:00.000Z');
    expect(windowStartIso(now, 60 * 60 * 1000)).toBe('2026-10-20T11:00:00.000Z');
  });
});

describe('rate-limit: decide', () => {
  it('permite enquanto a contagem é menor que o teto', () => {
    expect(decide(0, window)).toEqual({ allowed: true, remaining: 3 });
    expect(decide(2, window)).toEqual({ allowed: true, remaining: 1 });
  });

  it('bloqueia quando a contagem atinge o teto', () => {
    expect(decide(3, window)).toEqual({ allowed: false, remaining: 0 });
  });

  it('remaining nunca é negativo', () => {
    expect(decide(10, window).remaining).toBe(0);
  });
});

describe('rate-limit: checkRateLimit', () => {
  it('usa o contador injetável e decide', async () => {
    const now = new Date('2026-10-20T12:00:00.000Z');
    let sinceRecebido = '';
    const counter = async (sinceIso: string) => {
      sinceRecebido = sinceIso;
      return 2;
    };
    const decision = await checkRateLimit(counter, window, now);
    expect(decision.allowed).toBe(true);
    expect(sinceRecebido).toBe('2026-10-20T11:00:00.000Z');
  });

  it('bloqueia quando o contador retorna o teto', async () => {
    const decision = await checkRateLimit(async () => 3, window);
    expect(decision.allowed).toBe(false);
  });
});

describe('logging: estimateCostUsd', () => {
  const pricing = { inputPerMTok: 2, outputPerMTok: 10 };

  it('calcula custo a partir dos tokens', () => {
    // 1M in * $2 + 1M out * $10 = $12
    expect(estimateCostUsd(1_000_000, 1_000_000, pricing)).toBeCloseTo(12, 6);
  });

  it('trata tokens nulos como zero', () => {
    expect(estimateCostUsd(null, null, pricing)).toBe(0);
  });

  it('nunca retorna custo negativo', () => {
    expect(estimateCostUsd(-5, -5, pricing)).toBe(0);
  });
});
