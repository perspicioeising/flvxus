import { describe, expect, it } from 'vitest';

import { contarSeries } from '@/lib/treino/series';

describe('contarSeries', () => {
  it('sets geral NULL + 4 séries individuais -> 4 (caso do print; hoje renderizaria 1)', () => {
    const series = [
      { setNumber: 1 },
      { setNumber: 2 },
      { setNumber: 3 },
      { setNumber: 4 },
    ];
    expect(contarSeries(null, series)).toBe(4);
  });

  it('sets geral 0 + 4 séries individuais -> 4 (0 não colapsa havendo séries)', () => {
    const series = [
      { setNumber: 1 },
      { setNumber: 2 },
      { setNumber: 3 },
      { setNumber: 4 },
    ];
    expect(contarSeries(0, series)).toBe(4);
  });

  it('sem séries individuais (undefined) + sets geral 3 -> 3', () => {
    expect(contarSeries(3, undefined)).toBe(3);
  });

  it('sem séries individuais (undefined) + sets geral null -> 1 (piso legado)', () => {
    expect(contarSeries(null, undefined)).toBe(1);
  });

  it('séries individuais vazias ([]) + sets geral 0 -> 1 (piso legado)', () => {
    expect(contarSeries(0, [])).toBe(1);
  });

  it('sets geral preenchido (2) E 4 séries individuais -> 4 (as individuais vencem a contagem)', () => {
    const series = [
      { setNumber: 1 },
      { setNumber: 2 },
      { setNumber: 3 },
      { setNumber: 4 },
    ];
    expect(contarSeries(2, series)).toBe(4);
  });

  it('sets geral 5 e 4 séries individuais -> 4 (contagem = número de linhas, não max)', () => {
    const series = [
      { setNumber: 1 },
      { setNumber: 2 },
      { setNumber: 3 },
      { setNumber: 4 },
    ];
    expect(contarSeries(5, series)).toBe(4);
  });
});
