import { describe, expect, it } from 'vitest';

import {
  calcularComposicao,
  densidadeDurnin,
  durnin,
  guedes,
  imc,
  massaGordaKg,
  massaMagraKg,
  pollock3,
  pollock7,
  siri,
} from '@/lib/assessment';

/**
 * Valores de referência conferidos contra as fórmulas publicadas (ver cabeçalho
 * de lib/assessment/index.ts) e calculados independentemente. Tolerância:
 * - %gordura: ±0.1 ponto percentual (toBeCloseTo(…, 1)).
 * - densidade: ±0.0005 g/cm³.
 * - IMC/massas: ±0.01.
 */

describe('imc', () => {
  it('80 kg / 180 cm ≈ 24.69', () => {
    expect(imc(80, 180)).toBeCloseTo(24.69, 2);
  });

  it('rejeita peso/altura não positivos', () => {
    expect(() => imc(0, 180)).toThrow();
    expect(() => imc(80, 0)).toThrow();
  });
});

describe('siri', () => {
  it('converte densidade em %gordura', () => {
    // Db = 1.05 → %gordura = 495/1.05 − 450 ≈ 21.43
    expect(siri(1.05)).toBeCloseTo(21.43, 1);
  });
});

describe('pollock3', () => {
  it('homem (peitoral+abdominal+coxa = 45 mm, 30 anos) ≈ 13.6%', () => {
    expect(pollock3({ chest: 10, abdominal: 20, thigh: 15 }, 30, 'male')).toBeCloseTo(13.61, 1);
  });

  it('mulher (tríceps+suprailíaca+coxa = 60 mm, 25 anos) ≈ 23.8%', () => {
    expect(pollock3({ triceps: 18, suprailiac: 16, thigh: 26 }, 25, 'female')).toBeCloseTo(
      23.81,
      1
    );
  });

  it('usa só as dobras do gênero (ignora dobras não exigidas)', () => {
    const comExtras = pollock3(
      { chest: 10, abdominal: 20, thigh: 15, triceps: 99, suprailiac: 99 },
      30,
      'male'
    );
    expect(comExtras).toBeCloseTo(13.61, 1);
  });
});

describe('pollock7', () => {
  it('homem (Σ = 105 mm, 30 anos) ≈ 15.3%', () => {
    expect(
      pollock7(
        {
          chest: 15,
          midaxillary: 15,
          triceps: 15,
          subscapular: 15,
          abdominal: 15,
          suprailiac: 15,
          thigh: 15,
        },
        30,
        'male'
      )
    ).toBeCloseTo(15.34, 1);
  });

  it('mulher (Σ = 120 mm, 45 anos) ≈ 24.6% (caso de referência)', () => {
    expect(
      pollock7(
        {
          chest: 10,
          midaxillary: 15,
          triceps: 20,
          subscapular: 20,
          abdominal: 20,
          suprailiac: 20,
          thigh: 15,
        },
        45,
        'female'
      )
    ).toBeCloseTo(24.63, 1);
  });
});

describe('guedes', () => {
  it('homem (tríceps+suprailíaca+abdominal = 40 mm) ≈ 15.3%', () => {
    expect(guedes({ triceps: 10, suprailiac: 12, abdominal: 18 }, 'male')).toBeCloseTo(15.26, 1);
  });

  it('mulher (coxa+suprailíaca+subescapular = 48 mm) ≈ 22.4%', () => {
    expect(guedes({ thigh: 20, suprailiac: 15, subscapular: 13 }, 'female')).toBeCloseTo(22.44, 1);
  });

  it('exige soma positiva de dobras', () => {
    expect(() => guedes({ triceps: 0, suprailiac: 0, abdominal: 0 }, 'male')).toThrow();
  });
});

describe('durnin', () => {
  it('homem 20-29 anos (Σ = 40 mm, 25 anos) ≈ 16.2%', () => {
    expect(
      durnin({ biceps: 5, triceps: 10, subscapular: 12, suprailiac: 13 }, 25, 'male')
    ).toBeCloseTo(16.17, 1);
  });

  it('mulher 30-39 anos (Σ = 50 mm, 35 anos) ≈ 28.3%', () => {
    expect(
      durnin({ biceps: 10, triceps: 12, subscapular: 13, suprailiac: 15 }, 35, 'female')
    ).toBeCloseTo(28.3, 1);
  });

  it('seleciona coeficientes por faixa etária (densidade varia com a idade)', () => {
    const dobras = { biceps: 10, triceps: 10, subscapular: 10, suprailiac: 10 };
    const jovem = densidadeDurnin(dobras, 25, 'male');
    const maisVelho = densidadeDurnin(dobras, 55, 'male');
    // Mesmas dobras, faixas etárias diferentes → densidades diferentes.
    expect(jovem).not.toBeCloseTo(maisVelho, 4);
  });
});

describe('massas', () => {
  it('massa gorda = peso × %gordura', () => {
    expect(massaGordaKg(80, 15)).toBeCloseTo(12, 2);
  });

  it('massa magra = peso − massa gorda', () => {
    expect(massaMagraKg(80, 15)).toBeCloseTo(68, 2);
  });
});

describe('faixa plausível de %gordura', () => {
  it('protocolos devolvem valores em faixa fisiológica (3%–60%)', () => {
    const casos = [
      pollock3({ chest: 10, abdominal: 20, thigh: 15 }, 30, 'male'),
      pollock3({ triceps: 18, suprailiac: 16, thigh: 26 }, 25, 'female'),
      pollock7(
        { chest: 15, midaxillary: 15, triceps: 15, subscapular: 15, abdominal: 15, suprailiac: 15, thigh: 15 },
        30,
        'male'
      ),
      guedes({ triceps: 10, suprailiac: 12, abdominal: 18 }, 'male'),
      durnin({ biceps: 5, triceps: 10, subscapular: 12, suprailiac: 13 }, 25, 'male'),
    ];
    for (const pct of casos) {
      expect(pct).toBeGreaterThan(3);
      expect(pct).toBeLessThan(60);
    }
  });
});

describe('calcularComposicao', () => {
  it('consolida IMC, %gordura, massa gorda e magra (Pollock 3 homem)', () => {
    const r = calcularComposicao({
      protocol: 'pollock_3',
      genero: 'male',
      idade: 30,
      pesoKg: 80,
      alturaCm: 180,
      dobras: { chest: 10, abdominal: 20, thigh: 15 },
    });
    expect(r.bmi).toBeCloseTo(24.69, 2);
    expect(r.bodyFatPct).toBeCloseTo(13.61, 1);
    expect(r.fatMassKg).toBeCloseTo((80 * (r.bodyFatPct as number)) / 100, 4);
    expect(r.leanMassKg).toBeCloseTo(80 - (r.fatMassKg as number), 4);
  });

  it('protocolo manual usa o %gordura informado', () => {
    const r = calcularComposicao({
      protocol: 'manual',
      genero: 'female',
      pesoKg: 60,
      alturaCm: 165,
      bodyFatPctManual: 22,
      dobras: {},
    });
    expect(r.bodyFatPct).toBe(22);
    expect(r.fatMassKg).toBeCloseTo(13.2, 2);
    expect(r.leanMassKg).toBeCloseTo(46.8, 2);
  });

  it('sem peso/altura não calcula IMC nem massas (campos null)', () => {
    const r = calcularComposicao({
      protocol: 'guedes',
      genero: 'male',
      dobras: { triceps: 10, suprailiac: 12, abdominal: 18 },
    });
    expect(r.bmi).toBeNull();
    expect(r.bodyFatPct).toBeCloseTo(15.26, 1);
    expect(r.fatMassKg).toBeNull();
    expect(r.leanMassKg).toBeNull();
  });
});
