import { describe, expect, it } from 'vitest';

import {
  mapearDietaParaLinhas,
  mapearTreinoParaItens,
  mapearAnaliseParaAvaliacao,
  nomesDeExerciciosDoTreino,
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

const treinoDraft: SuggestWorkoutOutput = {
  days: [
    {
      weekday: 3,
      label: 'Treino B',
      exercises: [
        { name: 'Agachamento', sets: 4, reps: '8-12', rest_seconds: 90, notes: null },
      ],
    },
    {
      weekday: 1,
      label: 'Treino A',
      exercises: [
        { name: 'Supino', sets: 3, reps: '10', rest_seconds: 60, notes: 'cadência lenta' },
        { name: 'Supino', sets: 2, reps: '12', rest_seconds: 45, notes: null },
      ],
    },
  ],
  disclaimer: 'Rascunho gerado por IA.',
};

describe('nomesDeExerciciosDoTreino', () => {
  it('retorna nomes únicos (case-insensitive, 1ª grafia)', () => {
    expect(nomesDeExerciciosDoTreino(treinoDraft)).toEqual(['Agachamento', 'Supino']);
  });
});

describe('mapearTreinoParaItens', () => {
  const resolver = (nome: string) =>
    ({ agachamento: 'ex-agacha', supino: 'ex-supino' })[nome.trim().toLowerCase()] ?? null;

  it('ordena por weekday e numera order_index globalmente', () => {
    const itens = mapearTreinoParaItens(treinoDraft, resolver);
    expect(itens.map((i) => i.weekday)).toEqual([1, 1, 3]);
    expect(itens.map((i) => i.order_index)).toEqual([0, 1, 2]);
  });

  it('resolve o exercise_id pelo nome', () => {
    const itens = mapearTreinoParaItens(treinoDraft, resolver);
    expect(itens[0].exercise_id).toBe('ex-supino');
    expect(itens[2].exercise_id).toBe('ex-agacha');
  });

  it('copia sets/reps/rest/notes', () => {
    const itens = mapearTreinoParaItens(treinoDraft, resolver);
    expect(itens[0]).toMatchObject({ sets: 3, reps: '10', rest_seconds: 60, notes: 'cadência lenta' });
    expect(itens[1].notes).toBeNull();
  });

  it('lança quando um nome não resolve', () => {
    expect(() => mapearTreinoParaItens(treinoDraft, () => null)).toThrow(/não resolvido/i);
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
