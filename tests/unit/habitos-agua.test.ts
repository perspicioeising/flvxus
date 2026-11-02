import { describe, expect, it } from 'vitest';

import { progressoAgua } from '@/lib/habitos/agua';

const DIA = '2024-03-20';

describe('progressoAgua — soma e progresso por dia-SP', () => {
  it('soma os registros do dia e calcula consumido/pct/metaAtingida', () => {
    const r = progressoAgua(
      [
        { amount_ml: 500, occurred_on: DIA },
        { amount_ml: 250, occurred_on: DIA },
      ],
      2000,
      DIA
    );
    expect(r.consumidoMl).toBe(750);
    expect(r.targetMl).toBe(2000);
    expect(r.pct).toBe(38); // round(750/2000*100)
    expect(r.metaAtingida).toBe(false);
  });

  it('atingir a meta marca metaAtingida e pct 100', () => {
    const r = progressoAgua([{ amount_ml: 2000, occurred_on: DIA }], 2000, DIA);
    expect(r.metaAtingida).toBe(true);
    expect(r.pct).toBe(100);
  });

  it('exceder a meta prende pct em 100 mas conta o consumido real', () => {
    const r = progressoAgua([{ amount_ml: 3000, occurred_on: DIA }], 2000, DIA);
    expect(r.consumidoMl).toBe(3000);
    expect(r.pct).toBe(100);
    expect(r.metaAtingida).toBe(true);
  });

  it('registros de outro dia não entram na soma', () => {
    const r = progressoAgua(
      [
        { amount_ml: 500, occurred_on: '2024-03-19' },
        { amount_ml: 250, occurred_on: DIA },
        { amount_ml: 1000, occurred_on: '2024-03-21' },
      ],
      2000,
      DIA
    );
    expect(r.consumidoMl).toBe(250);
    expect(r.metaAtingida).toBe(false);
  });

  it('sem registros do dia → zero, não atingida', () => {
    const r = progressoAgua([], 2000, DIA);
    expect(r.consumidoMl).toBe(0);
    expect(r.pct).toBe(0);
    expect(r.metaAtingida).toBe(false);
  });

  it('meta zero/negativa não divide por zero (pct 0, não atingida)', () => {
    const r = progressoAgua([{ amount_ml: 500, occurred_on: DIA }], 0, DIA);
    expect(r.pct).toBe(0);
    expect(r.metaAtingida).toBe(false);
  });
});
