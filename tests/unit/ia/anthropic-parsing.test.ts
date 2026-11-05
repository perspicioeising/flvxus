import { describe, expect, it } from 'vitest';

import { generateDietOutputSchema } from '@/schemas/ia';
import {
  parseStructuredOutput,
  type AnthropicMessageResponse,
} from '@/supabase/functions/_shared/structured-output';

// Entrada válida que a IA "retornaria" no bloco de texto (JSON serializado).
const dietInput = {
  meals: [
    {
      name: 'Almoço',
      time: '12:00',
      order_index: 0,
      foods: [
        {
          food_name: 'Frango grelhado',
          quantity: 150,
          unit: 'g',
          kcal: 240,
          protein_g: 45,
          carbs_g: 0,
          fat_g: 6,
        },
      ],
    },
  ],
  totals: { target_kcal: 1800, protein_g: 140, carbs_g: 150, fat_g: 55 },
  shopping_list: ['Frango', 'Arroz'],
  disclaimer: 'Rascunho gerado por IA; não substitui nutricionista/médico.',
};

// Resposta FAKE da Messages API com a saída em bloco(s) de texto JSON
// (output_config.format).
function fakeResponse(input: unknown): AnthropicMessageResponse {
  return {
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: JSON.stringify(input) }],
  };
}

describe('structured-output: parseStructuredOutput', () => {
  it('saída BOA -> objeto validado pelo Zod', () => {
    const result = parseStructuredOutput(fakeResponse(dietInput), generateDietOutputSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.totals.target_kcal).toBe(1800);
    }
  });

  it('saída MALFORMADA (macro negativo) -> erro, nada validado', () => {
    const ruim = structuredClone(dietInput);
    ruim.meals[0].foods[0].protein_g = -10;
    const result = parseStructuredOutput(fakeResponse(ruim), generateDietOutputSchema);
    expect(result.ok).toBe(false);
  });

  it('texto não-JSON -> erro de saída estruturada', () => {
    const resp: AnthropicMessageResponse = {
      content: [{ type: 'text', text: 'isto não é JSON' }],
    };
    const result = parseStructuredOutput(resp, generateDietOutputSchema);
    expect(result.ok).toBe(false);
  });

  it('sem bloco de texto -> erro de saída estruturada', () => {
    const resp: AnthropicMessageResponse = { content: [], stop_reason: 'max_tokens' };
    const result = parseStructuredOutput(resp, generateDietOutputSchema);
    expect(result.ok).toBe(false);
  });
});
