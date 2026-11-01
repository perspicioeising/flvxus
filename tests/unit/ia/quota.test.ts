import { describe, expect, it } from 'vitest';

import { quotaExceeded, resolvePeriodStart } from '@/lib/ia/quota';

describe('quota: resolvePeriodStart', () => {
  it('trunca current_period_start a date (YYYY-MM-DD)', () => {
    expect(resolvePeriodStart('2026-10-20T12:34:56.000Z')).toBe('2026-10-20');
  });

  it('usa o 1º dia do mês corrente quando não há período', () => {
    const now = new Date('2026-10-20T12:00:00.000Z');
    expect(resolvePeriodStart(null, now)).toBe('2026-10-01');
    expect(resolvePeriodStart(undefined, now)).toBe('2026-10-01');
    expect(resolvePeriodStart('', now)).toBe('2026-10-01');
  });

  it('cai no fallback quando a data é inválida', () => {
    const now = new Date('2026-03-05T00:00:00.000Z');
    expect(resolvePeriodStart('não-é-data', now)).toBe('2026-03-01');
  });
});

describe('quota: quotaExceeded', () => {
  it('nunca estoura quando o limite é null (ilimitado)', () => {
    expect(quotaExceeded(null, 0)).toBe(false);
    expect(quotaExceeded(null, 9999)).toBe(false);
  });

  it('permite enquanto o uso é menor que o limite', () => {
    expect(quotaExceeded(50, 0)).toBe(false);
    expect(quotaExceeded(50, 49)).toBe(false);
  });

  it('estoura quando o uso atinge/ ultrapassa o limite', () => {
    expect(quotaExceeded(50, 50)).toBe(true);
    expect(quotaExceeded(50, 51)).toBe(true);
  });
});
