import { describe, expect, it } from 'vitest';

import { META_AGUA_DEFAULT_ML, metaSugeridaMl } from '@/lib/habitos/meta-agua';

describe('metaSugeridaMl — meta de água sugerida por peso', () => {
  it('80 kg → 2800 ml (35 ml/kg)', () => {
    expect(metaSugeridaMl(80)).toBe(2800);
  });

  it('sem peso (null) → META_AGUA_DEFAULT_ML', () => {
    expect(metaSugeridaMl(null)).toBe(META_AGUA_DEFAULT_ML);
    expect(META_AGUA_DEFAULT_ML).toBe(2000);
  });

  it('peso zero/NaN cai no default', () => {
    expect(metaSugeridaMl(0)).toBe(META_AGUA_DEFAULT_ML);
    expect(metaSugeridaMl(Number.NaN)).toBe(META_AGUA_DEFAULT_ML);
  });

  it('respeita o default customizado quando não há peso', () => {
    expect(metaSugeridaMl(null, 3000)).toBe(3000);
  });

  it('arredonda a heurística (36,5 kg → 1278 ml)', () => {
    expect(metaSugeridaMl(36.5)).toBe(Math.round(36.5 * 35));
  });

  it('prende ao mínimo do banco (peso minúsculo → 250 ml)', () => {
    // 1 kg * 35 = 35 ml, abaixo do mínimo 250.
    expect(metaSugeridaMl(1)).toBe(250);
  });

  it('prende ao máximo do banco (peso enorme → 20000 ml)', () => {
    // 1000 kg * 35 = 35000 ml, acima do máximo 20000.
    expect(metaSugeridaMl(1000)).toBe(20000);
  });
});
