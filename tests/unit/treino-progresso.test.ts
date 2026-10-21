import { describe, expect, it } from 'vitest';

import {
  exercicioConcluido,
  progressoSessao,
  seriesPorItem,
  volumeSessao,
  type SerieLog,
} from '@/lib/treino/progresso';

const ITEM_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ITEM_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

function serie(parcial: Partial<SerieLog> & { set_number: number }): SerieLog {
  return {
    completed: false,
    reps_done: null,
    load_done: null,
    plan_item_id: ITEM_A,
    ...parcial,
  };
}

describe('progressoSessao', () => {
  it('reporta 0 de N quando nada foi concluído', () => {
    const logs = [
      serie({ set_number: 1 }),
      serie({ set_number: 2 }),
      serie({ set_number: 3 }),
    ];
    expect(progressoSessao(logs)).toEqual({ feitas: 0, total: 3, pct: 0 });
  });

  it('reporta progresso parcial com pct arredondado', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2 }),
      serie({ set_number: 3 }),
    ];
    // 1/3 = 33,33% -> 33
    expect(progressoSessao(logs)).toEqual({ feitas: 1, total: 3, pct: 33 });
  });

  it('reporta 100% quando todas as séries foram concluídas', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2, completed: true }),
    ];
    expect(progressoSessao(logs)).toEqual({ feitas: 2, total: 2, pct: 100 });
  });

  it('não quebra com lista vazia', () => {
    expect(progressoSessao([])).toEqual({ feitas: 0, total: 0, pct: 0 });
  });
});

describe('volumeSessao', () => {
  it('soma reps × carga de cada série', () => {
    const logs = [
      serie({ set_number: 1, reps_done: 10, load_done: 20 }),
      serie({ set_number: 2, reps_done: 8, load_done: 25 }),
    ];
    // 10*20 + 8*25 = 200 + 200
    expect(volumeSessao(logs)).toBe(400);
  });

  it('trata reps/carga nulos como zero', () => {
    const logs = [
      serie({ set_number: 1, reps_done: null, load_done: 30 }),
      serie({ set_number: 2, reps_done: 12, load_done: null }),
      serie({ set_number: 3, reps_done: 10, load_done: 15 }),
    ];
    expect(volumeSessao(logs)).toBe(150);
  });

  it('é 0 para lista vazia', () => {
    expect(volumeSessao([])).toBe(0);
  });
});

describe('exercicioConcluido', () => {
  it('é false para lista vazia', () => {
    expect(exercicioConcluido([])).toBe(false);
  });

  it('é false quando apenas parte das séries foi concluída', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2, completed: false }),
    ];
    expect(exercicioConcluido(logs)).toBe(false);
  });

  it('é true quando todas as séries foram concluídas', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2, completed: true }),
    ];
    expect(exercicioConcluido(logs)).toBe(true);
  });
});

describe('seriesPorItem', () => {
  it('agrupa séries por plan_item_id', () => {
    const logs = [
      serie({ set_number: 1, plan_item_id: ITEM_A }),
      serie({ set_number: 2, plan_item_id: ITEM_A }),
      serie({ set_number: 1, plan_item_id: ITEM_B }),
    ];
    const grupos = seriesPorItem(logs);
    expect(grupos.size).toBe(2);
    expect(grupos.get(ITEM_A)).toHaveLength(2);
    expect(grupos.get(ITEM_B)).toHaveLength(1);
  });

  it('coloca séries sem item vinculado em "sem-item"', () => {
    const logs = [
      serie({ set_number: 1, plan_item_id: null }),
      serie({ set_number: 1, plan_item_id: ITEM_A }),
    ];
    const grupos = seriesPorItem(logs);
    expect(grupos.get('sem-item')).toHaveLength(1);
    expect(grupos.get(ITEM_A)).toHaveLength(1);
  });
});
