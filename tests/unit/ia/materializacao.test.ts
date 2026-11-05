import { describe, expect, it } from 'vitest';

import {
  mapearDietaParaLinhas,
  mapearTreinoV2ParaLinhas,
  mapearAnaliseParaAvaliacao,
  idsFaltantes,
  normalizarGoalRestrictions,
} from '@/lib/ia/materializacao';
import type { GenerateDietOutput } from '@/schemas/ia/generate-diet';
import type { SuggestWorkoutOutput } from '@/schemas/ia/suggest-workout';
import type { AnalyzeAssessmentOutput } from '@/schemas/ia/analyze-assessment';

const dietaDraft: GenerateDietOutput = {
  meals: [
    {
      name: 'Almoço',
      time: '12:00',
      order_index: 1,
      foods: [
        { food_name: 'Arroz', quantity: 100, unit: 'g', kcal: 130, protein_g: 2, carbs_g: 28, fat_g: 0 },
      ],
    },
    {
      name: 'Café da manhã',
      time: '08:00',
      order_index: 0,
      foods: [
        { food_name: 'Ovo', quantity: 2, unit: 'un', kcal: 140, protein_g: 12, carbs_g: 1, fat_g: 10 },
      ],
    },
  ],
  totals: { target_kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 },
  shopping_list: ['Arroz', 'Ovos'],
  disclaimer: 'Rascunho gerado por IA.',
};

describe('mapearDietaParaLinhas', () => {
  it('mapeia totais, refeições e lista de compras', () => {
    const r = mapearDietaParaLinhas(dietaDraft);
    expect(r.diet).toEqual({ target_kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 });
    expect(r.shopping_list).toEqual(['Arroz', 'Ovos']);
    expect(r.refeicoes).toHaveLength(2);
  });

  it('ordena as refeições por order_index', () => {
    const r = mapearDietaParaLinhas(dietaDraft);
    expect(r.refeicoes.map((x) => x.refeicao.name)).toEqual(['Café da manhã', 'Almoço']);
  });

  it('preserva os alimentos de cada refeição', () => {
    const r = mapearDietaParaLinhas(dietaDraft);
    expect(r.refeicoes[0].alimentos[0]).toMatchObject({ food_name: 'Ovo', quantity: 2, unit: 'un' });
  });
});

const EX_A = '00000000-0000-4000-8000-0000000000a1';
const EX_B = '00000000-0000-4000-8000-0000000000b2';

/** Draft v2 POR DIA (divisões com weekday, sem rotation_steps). */
const treinoPorDia: SuggestWorkoutOutput = {
  divisions: [
    {
      label: 'Treino A',
      weekday: 1,
      exercises: [
        {
          exercise_id: EX_A,
          order_index: 0,
          sets: 3,
          reps: '10',
          rest_seconds: 60,
          target_load: 40,
          notes: 'cadência lenta',
          series: [
            { set_number: 1, kind: 'work', target_reps: '10', rest_seconds: 60, target_load: 40, note: null },
            { set_number: 2, kind: 'work', target_reps: '8', rest_seconds: null, target_load: null, note: 'última' },
          ],
        },
      ],
    },
    {
      label: 'Treino B',
      weekday: 3,
      exercises: [
        {
          // Gerais ausentes ⇒ herdam null nas linhas do item.
          exercise_id: EX_B,
          order_index: 0,
          series: [
            { set_number: 1, kind: 'warmup', target_reps: '12', rest_seconds: 90, target_load: null, note: null },
          ],
        },
      ],
    },
  ],
  disclaimer: 'Rascunho gerado por IA.',
};

/** Draft v2 POR DIVISÃO (weekday null + rotation_steps). */
const treinoPorDivisao: SuggestWorkoutOutput = {
  divisions: [
    {
      label: 'A',
      weekday: null,
      exercises: [
        {
          exercise_id: EX_A,
          order_index: 0,
          series: [{ set_number: 1, kind: 'work', target_reps: '10', rest_seconds: 60, target_load: null, note: null }],
        },
      ],
    },
    {
      label: 'B',
      weekday: null,
      exercises: [
        {
          exercise_id: EX_B,
          order_index: 0,
          series: [{ set_number: 1, kind: 'work', target_reps: '10', rest_seconds: 60, target_load: null, note: null }],
        },
      ],
    },
  ],
  rotation_steps: [
    { type: 'division', label: 'A' },
    { type: 'division', label: 'B' },
    { type: 'rest' },
  ],
  disclaimer: 'Rascunho gerado por IA.',
};

describe('mapearTreinoV2ParaLinhas — modo POR DIA', () => {
  it('resolve modo por_dia: weekday nos itens e rotation_steps null', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDia);
    expect(r.modo).toBe('por_dia');
    expect(r.rotation_steps).toBeNull();
    expect(r.itens.map((i) => i.item.weekday)).toEqual([1, 3]);
  });

  it('numera order_index global e contíguo na ordem (divisão, exercício)', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDia);
    expect(r.itens.map((i) => i.item.order_index)).toEqual([0, 1]);
  });

  it('grava division=label e target_load do item', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDia);
    expect(r.itens[0].item.division).toBe('Treino A');
    expect(r.itens[0].item.target_load).toBe(40);
    expect(r.itens[1].item.division).toBe('Treino B');
  });

  it('herda null nos gerais ausentes do item', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDia);
    expect(r.itens[1].item).toMatchObject({
      sets: null,
      reps: null,
      rest_seconds: null,
      target_load: null,
      notes: null,
    });
  });

  it('achata as séries preservando set_number/kind/note/target_reps/rest/target_load', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDia);
    expect(r.itens[0].series).toEqual([
      { set_number: 1, kind: 'work', note: null, target_reps: '10', rest_seconds: 60, target_load: 40 },
      { set_number: 2, kind: 'work', note: 'última', target_reps: '8', rest_seconds: null, target_load: null },
    ]);
  });
});

describe('mapearTreinoV2ParaLinhas — modo POR DIVISÃO', () => {
  it('resolve modo por_divisao: weekday null nos itens e rotation_steps preservado', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDivisao);
    expect(r.modo).toBe('por_divisao');
    expect(r.itens.map((i) => i.item.weekday)).toEqual([null, null]);
    expect(r.rotation_steps).toEqual([
      { type: 'division', label: 'A' },
      { type: 'division', label: 'B' },
      { type: 'rest' },
    ]);
  });

  it('division=label contínuo em ordem', () => {
    const r = mapearTreinoV2ParaLinhas(treinoPorDivisao);
    expect(r.itens.map((i) => i.item.division)).toEqual(['A', 'B']);
    expect(r.itens.map((i) => i.item.order_index)).toEqual([0, 1]);
  });
});

describe('idsFaltantes', () => {
  it('não acusa faltantes quando todos os ids foram encontrados', () => {
    expect(idsFaltantes([EX_A, EX_B], [EX_A, EX_B])).toEqual([]);
  });

  it('deduplica: id repetido em 2 divisões conta uma vez', () => {
    expect(idsFaltantes([EX_A, EX_A], [EX_A])).toEqual([]);
  });

  it('acusa 1 faltante quando um id não foi encontrado', () => {
    expect(idsFaltantes([EX_A, EX_B], [EX_A])).toEqual([EX_B]);
  });
});

describe('normalizarGoalRestrictions', () => {
  it('descarta goal de texto livre que não é membro do enum', () => {
    const r = normalizarGoalRestrictions({ goal: 'perda de gordura mantendo massa' });
    expect(r.goal).toBeNull();
  });

  it('preserva goal quando é um membro válido do enum', () => {
    const r = normalizarGoalRestrictions({ goal: 'muscle_gain' });
    expect(r.goal).toBe('muscle_gain');
  });

  it('filtra/preserva restrictions quando é um array de strings', () => {
    const r = normalizarGoalRestrictions({
      restrictions: ['lactose', 42, 'glúten', null],
    });
    expect(r.restrictions).toEqual(['lactose', 'glúten']);
  });

  it('retorna [] quando restrictions está ausente ou não é array', () => {
    expect(normalizarGoalRestrictions({}).restrictions).toEqual([]);
    expect(normalizarGoalRestrictions({ restrictions: 'lactose' }).restrictions).toEqual([]);
  });
});

describe('mapearAnaliseParaAvaliacao', () => {
  const analiseDraft: AnalyzeAssessmentOutput = {
    analysis: 'Composição corporal dentro do esperado.',
    recommendations: [{ category: 'treino', text: 'Aumentar volume de pernas.', priority: 'alta' }],
    disclaimer: 'Rascunho gerado por IA.',
  };

  it('mapeia ai_analysis (com disclaimer) e ai_recommendations', () => {
    const r = mapearAnaliseParaAvaliacao(analiseDraft);
    expect(r.ai_analysis).toEqual({
      analysis: 'Composição corporal dentro do esperado.',
      disclaimer: 'Rascunho gerado por IA.',
    });
    expect(r.ai_recommendations).toEqual(analiseDraft.recommendations);
  });
});
