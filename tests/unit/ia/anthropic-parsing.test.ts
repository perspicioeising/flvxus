import { describe, expect, it } from 'vitest';

import { generateDietOutputSchema } from '@/schemas/ia';
import {
  buildTool,
  extractToolInput,
  parseToolOutput,
  type AnthropicMessageResponse,
} from '@/supabase/functions/_shared/structured-output';

// Entrada válida que a IA "retornaria" no bloco tool_use.
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

// Resposta FAKE da Messages API chamando a tool "generate_diet".
function fakeResponse(input: unknown): AnthropicMessageResponse {
  return {
    stop_reason: 'tool_use',
    content: [{ type: 'tool_use', name: 'generate_diet', input }],
  };
}

describe('structured-output: buildTool', () => {
  it('monta a tool a partir de um JSON Schema', () => {
    const tool = buildTool('generate_diet', 'Gera dieta', { type: 'object' });
    expect(tool.name).toBe('generate_diet');
    expect(tool.input_schema).toEqual({ type: 'object' });
  });
});

describe('structured-output: extractToolInput', () => {
  it('extrai o input do bloco tool_use correto', () => {
    expect(extractToolInput(fakeResponse(dietInput), 'generate_diet')).toEqual(dietInput);
  });

  it('retorna undefined quando a tool esperada não foi chamada', () => {
    const resp: AnthropicMessageResponse = {
      content: [{ type: 'text' }],
    };
    expect(extractToolInput(resp, 'generate_diet')).toBeUndefined();
  });
});

describe('structured-output: parseToolOutput', () => {
  it('saída BOA -> objeto validado pelo Zod', () => {
    const result = parseToolOutput(fakeResponse(dietInput), 'generate_diet', generateDietOutputSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.totals.target_kcal).toBe(1800);
    }
  });

  it('saída MALFORMADA (macro negativo) -> erro, nada validado', () => {
    const ruim = structuredClone(dietInput);
    ruim.meals[0].foods[0].protein_g = -10;
    const result = parseToolOutput(fakeResponse(ruim), 'generate_diet', generateDietOutputSchema);
    expect(result.ok).toBe(false);
  });

  it('tool ausente -> erro de saída estruturada', () => {
    const resp: AnthropicMessageResponse = { content: [{ type: 'text' }] };
    const result = parseToolOutput(resp, 'generate_diet', generateDietOutputSchema);
    expect(result.ok).toBe(false);
  });
});
