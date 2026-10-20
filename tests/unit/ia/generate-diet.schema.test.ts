import { describe, expect, it } from 'vitest';

import { generateDietOutputSchema } from '@/schemas/ia';

// Exemplo BOM reutilizável; cada teste RUIM parte dele e estraga um campo.
const bom = {
  meals: [
    {
      name: 'Café da manhã',
      time: '08:00',
      order_index: 0,
      foods: [
        {
          food_name: 'Ovos',
          quantity: 2,
          unit: 'unidades',
          kcal: 150,
          protein_g: 12,
          carbs_g: 1,
          fat_g: 10,
        },
      ],
    },
  ],
  totals: { target_kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 },
  shopping_list: ['Ovos', 'Aveia'],
  disclaimer: 'Rascunho gerado por IA; não substitui nutricionista/médico.',
};

describe('generateDietOutputSchema', () => {
  it('valida um exemplo BOM', () => {
    expect(generateDietOutputSchema.safeParse(bom).success).toBe(true);
  });

  it('rejeita macro negativo em um alimento', () => {
    const ruim = structuredClone(bom);
    ruim.meals[0].foods[0].protein_g = -5;
    expect(generateDietOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita totals com kcal negativo', () => {
    const ruim = structuredClone(bom);
    ruim.totals.target_kcal = -1;
    expect(generateDietOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita refeição sem alimentos', () => {
    const ruim = structuredClone(bom);
    ruim.meals[0].foods = [];
    expect(generateDietOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita campo faltando (disclaimer ausente)', () => {
    const { disclaimer: _omitido, ...semDisclaimer } = bom;
    expect(generateDietOutputSchema.safeParse(semDisclaimer).success).toBe(false);
  });

  it('rejeita tipo errado (quantity como string)', () => {
    const ruim = structuredClone(bom) as unknown as {
      meals: { foods: { quantity: unknown }[] }[];
    };
    ruim.meals[0].foods[0].quantity = '2';
    expect(generateDietOutputSchema.safeParse(ruim).success).toBe(false);
  });

  it('rejeita lista de compras vazia', () => {
    const ruim = structuredClone(bom);
    ruim.shopping_list = [];
    expect(generateDietOutputSchema.safeParse(ruim).success).toBe(false);
  });
});
