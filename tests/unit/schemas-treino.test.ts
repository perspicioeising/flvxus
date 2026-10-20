import { describe, expect, it } from 'vitest';

import {
  fichaSchema,
  itemFichaSchema,
  itemModeloSchema,
  modeloSchema,
  transicaoPermitida,
  transicaoStatusSchema,
} from '@/schemas/treino';

const EX_ID = '11111111-1111-1111-1111-111111111111';
const ALUNO_ID = '22222222-2222-2222-2222-222222222222';
const MODELO_ID = '33333333-3333-3333-3333-333333333333';

describe('itemModeloSchema', () => {
  it('aceita um item mínimo (só exercise_id)', () => {
    const r = itemModeloSchema.safeParse({ exercise_id: EX_ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.order_index).toBe(0);
      expect(r.data.sets).toBeUndefined();
      expect(r.data.reps).toBeUndefined();
    }
  });

  it('normaliza sets/rest_seconds/target_load vindos como string', () => {
    const r = itemModeloSchema.safeParse({
      exercise_id: EX_ID,
      order_index: '2',
      sets: '4',
      reps: '8-12',
      rest_seconds: '60',
      target_load: '42,5',
      notes: 'cadência lenta',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.order_index).toBe(2);
      expect(r.data.sets).toBe(4);
      expect(r.data.reps).toBe('8-12');
      expect(r.data.rest_seconds).toBe(60);
      expect(r.data.target_load).toBe(42.5);
    }
  });

  it('trata campos vazios de prescrição como ausentes', () => {
    const r = itemModeloSchema.safeParse({
      exercise_id: EX_ID,
      sets: '',
      reps: '',
      rest_seconds: '',
      target_load: '',
      notes: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.sets).toBeUndefined();
      expect(r.data.target_load).toBeUndefined();
      expect(r.data.notes).toBeUndefined();
    }
  });

  it('rejeita exercise_id que não é uuid', () => {
    const r = itemModeloSchema.safeParse({ exercise_id: 'nao-eh-uuid' });
    expect(r.success).toBe(false);
  });

  it('rejeita sets não positivo', () => {
    const r = itemModeloSchema.safeParse({ exercise_id: EX_ID, sets: '0' });
    expect(r.success).toBe(false);
  });
});

describe('itemFichaSchema', () => {
  it('aceita weekday de 0 a 6', () => {
    for (const weekday of [0, 3, 6]) {
      const r = itemFichaSchema.safeParse({ exercise_id: EX_ID, weekday });
      expect(r.success).toBe(true);
    }
  });

  it('aceita weekday ausente', () => {
    const r = itemFichaSchema.safeParse({ exercise_id: EX_ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.weekday).toBeUndefined();
    }
  });

  it('rejeita weekday fora de 0..6', () => {
    expect(itemFichaSchema.safeParse({ exercise_id: EX_ID, weekday: 7 }).success).toBe(false);
    expect(itemFichaSchema.safeParse({ exercise_id: EX_ID, weekday: -1 }).success).toBe(false);
  });
});

describe('modeloSchema', () => {
  it('aceita um modelo válido com itens', () => {
    const r = modeloSchema.safeParse({
      name: 'Treino A - Superiores',
      description: 'Peito e costas',
      itens: [
        { exercise_id: EX_ID, order_index: 0, sets: 4, reps: '10' },
        { exercise_id: EX_ID, order_index: 1 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('rejeita modelo sem itens', () => {
    const r = modeloSchema.safeParse({ name: 'Vazio', itens: [] });
    expect(r.success).toBe(false);
  });

  it('rejeita nome vazio', () => {
    const r = modeloSchema.safeParse({
      name: '',
      itens: [{ exercise_id: EX_ID }],
    });
    expect(r.success).toBe(false);
  });
});

describe('fichaSchema', () => {
  it('aceita uma ficha válida com aluno e itens', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha de hipertrofia',
      itens: [{ exercise_id: EX_ID, weekday: 1, order_index: 0 }],
    });
    expect(r.success).toBe(true);
  });

  it('aceita source_workout_id (ficha criada a partir de modelo)', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha do modelo A',
      source_workout_id: MODELO_ID,
      itens: [{ exercise_id: EX_ID }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.source_workout_id).toBe(MODELO_ID);
    }
  });

  it('rejeita student_id inválido', () => {
    const r = fichaSchema.safeParse({
      student_id: 'x',
      name: 'Ficha',
      itens: [{ exercise_id: EX_ID }],
    });
    expect(r.success).toBe(false);
  });

  it('rejeita ficha sem itens', () => {
    const r = fichaSchema.safeParse({
      student_id: ALUNO_ID,
      name: 'Ficha',
      itens: [],
    });
    expect(r.success).toBe(false);
  });
});

describe('transicaoStatusSchema', () => {
  it('aceita o fluxo normal draft -> pending_review -> approved -> released', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'draft', para: 'pending_review' }).success).toBe(true);
    expect(transicaoStatusSchema.safeParse({ de: 'pending_review', para: 'approved' }).success).toBe(true);
    expect(transicaoStatusSchema.safeParse({ de: 'approved', para: 'released' }).success).toBe(true);
  });

  it('aceita arquivar a partir de qualquer estado ativo', () => {
    for (const de of ['draft', 'pending_review', 'approved', 'released'] as const) {
      expect(transicaoStatusSchema.safeParse({ de, para: 'archived' }).success).toBe(true);
    }
  });

  it('rejeita salto direto de draft para released', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'draft', para: 'released' }).success).toBe(false);
  });

  it('rejeita reabrir uma ficha já liberada (released -> draft)', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'released', para: 'draft' }).success).toBe(false);
  });

  it('rejeita transicao a partir de archived', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'archived', para: 'draft' }).success).toBe(false);
  });

  it('rejeita status fora do enum', () => {
    expect(transicaoStatusSchema.safeParse({ de: 'draft', para: 'publicado' }).success).toBe(false);
  });

  it('transicaoPermitida reflete a mesma tabela', () => {
    expect(transicaoPermitida('approved', 'released')).toBe(true);
    expect(transicaoPermitida('draft', 'released')).toBe(false);
  });
});
