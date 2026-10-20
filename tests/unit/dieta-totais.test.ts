import { describe, expect, it } from 'vitest';

import {
  totaisDieta,
  totaisRefeicao,
  type AlimentoTotalizavel,
} from '@/lib/dieta/totais';

function alimento(parcial: Partial<AlimentoTotalizavel>): AlimentoTotalizavel {
  return {
    kcal: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
    ...parcial,
  };
}

describe('totaisRefeicao', () => {
  it('soma kcal e macros de vários alimentos', () => {
    const total = totaisRefeicao([
      alimento({ kcal: 100, protein_g: 10, carbs_g: 5, fat_g: 2 }),
      alimento({ kcal: 150, protein_g: 20, carbs_g: 0, fat_g: 3 }),
    ]);
    expect(total).toEqual({ kcal: 250, protein_g: 30, carbs_g: 5, fat_g: 5 });
  });

  it('trata null como zero sem quebrar', () => {
    const total = totaisRefeicao([
      alimento({ kcal: 80, protein_g: null, carbs_g: 20, fat_g: null }),
      alimento({ kcal: null, protein_g: 5, carbs_g: null, fat_g: 1 }),
    ]);
    expect(total).toEqual({ kcal: 80, protein_g: 5, carbs_g: 20, fat_g: 1 });
  });

  it('preserva o valor zero real', () => {
    const total = totaisRefeicao([alimento({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })]);
    expect(total).toEqual({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  });

  it('retorna zeros para refeição sem alimentos', () => {
    expect(totaisRefeicao([])).toEqual({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  });
});

describe('totaisDieta', () => {
  it('soma os totais de várias refeições', () => {
    const total = totaisDieta([
      { kcal: 250, protein_g: 30, carbs_g: 5, fat_g: 5 },
      { kcal: 400, protein_g: 10, carbs_g: 50, fat_g: 12 },
    ]);
    expect(total).toEqual({ kcal: 650, protein_g: 40, carbs_g: 55, fat_g: 17 });
  });

  it('retorna zeros quando não há refeições', () => {
    expect(totaisDieta([])).toEqual({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  });
});
