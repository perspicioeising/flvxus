import { describe, expect, it } from 'vitest';

import {
  montarSerieEvolucao,
  temEvolucao,
  type AvaliacaoSerie,
} from '@/components/professor/avaliacoes/evolucao-series';

function avaliacao(parcial: Partial<AvaliacaoSerie> & { assessed_at: string }): AvaliacaoSerie {
  return {
    weight_kg: null,
    body_fat_pct: null,
    lean_mass_kg: null,
    waist_cm: null,
    hip_cm: null,
    abdomen_cm: null,
    ...parcial,
  };
}

describe('montarSerieEvolucao', () => {
  it('ordena do mais antigo ao mais recente', () => {
    const serie = montarSerieEvolucao([
      avaliacao({ assessed_at: '2024-03-10T00:00:00Z', weight_kg: 78 }),
      avaliacao({ assessed_at: '2024-01-05T00:00:00Z', weight_kg: 82 }),
      avaliacao({ assessed_at: '2024-02-20T00:00:00Z', weight_kg: 80 }),
    ]);
    expect(serie.map((p) => p.peso)).toEqual([82, 80, 78]);
    expect(serie[0].rotulo).toBe('05/01');
    expect(serie[2].rotulo).toBe('10/03');
  });

  it('preserva valores nulos sem quebrar', () => {
    const serie = montarSerieEvolucao([
      avaliacao({ assessed_at: '2024-01-05T00:00:00Z', body_fat_pct: null, waist_cm: 90 }),
    ]);
    expect(serie[0].gordura).toBeNull();
    expect(serie[0].cintura).toBe(90);
  });

  it('descarta datas inválidas', () => {
    const serie = montarSerieEvolucao([
      avaliacao({ assessed_at: 'data-invalida', weight_kg: 70 }),
      avaliacao({ assessed_at: '2024-01-05T00:00:00Z', weight_kg: 72 }),
    ]);
    expect(serie).toHaveLength(1);
    expect(serie[0].peso).toBe(72);
  });
});

describe('temEvolucao', () => {
  it('exige ao menos 2 pontos com valor', () => {
    const serie = montarSerieEvolucao([
      avaliacao({ assessed_at: '2024-01-05T00:00:00Z', body_fat_pct: 20 }),
      avaliacao({ assessed_at: '2024-02-05T00:00:00Z', body_fat_pct: 18 }),
    ]);
    expect(temEvolucao(serie, 'gordura')).toBe(true);
    expect(temEvolucao(serie, 'peso')).toBe(false);
  });
});
