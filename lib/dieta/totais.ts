/**
 * Cálculos PUROS de totais de uma dieta (sem React/UI) — testáveis em
 * `tests/unit/dieta-totais.test.ts`. Usados pela tela de dieta do aluno para
 * somar calorias e macros de uma refeição a partir dos seus alimentos.
 *
 * Todos os valores de alimento podem ser `null` (coluna opcional em
 * `diet_meal_foods`); somas tratam `null` como 0 e preservam 0 real.
 */

/** Linha mínima de alimento necessária para somar uma refeição. */
export interface AlimentoTotalizavel {
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

/** Totais de calorias e macros (g) de um conjunto de alimentos. */
export interface TotaisRefeicao {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Soma `kcal`/macros de uma lista de alimentos, tratando `null` como 0. */
export function totaisRefeicao(alimentos: AlimentoTotalizavel[]): TotaisRefeicao {
  return alimentos.reduce<TotaisRefeicao>(
    (acc, alimento) => ({
      kcal: acc.kcal + (alimento.kcal ?? 0),
      protein_g: acc.protein_g + (alimento.protein_g ?? 0),
      carbs_g: acc.carbs_g + (alimento.carbs_g ?? 0),
      fat_g: acc.fat_g + (alimento.fat_g ?? 0),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

/** Soma os totais de várias refeições (total da dieta). */
export function totaisDieta(refeicoes: TotaisRefeicao[]): TotaisRefeicao {
  return refeicoes.reduce<TotaisRefeicao>(
    (acc, r) => ({
      kcal: acc.kcal + r.kcal,
      protein_g: acc.protein_g + r.protein_g,
      carbs_g: acc.carbs_g + r.carbs_g,
      fat_g: acc.fat_g + r.fat_g,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}
