import { describe, expect, it } from 'vitest';

import {
  exercicioConcluido,
  hidratarSerie,
  progressoSessao,
  serieAtualDeLogs,
  seriesPorItem,
  volumeConcluido,
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

describe('volumeConcluido', () => {
  it('soma reps × carga apenas das séries concluídas', () => {
    const logs = [
      serie({ set_number: 1, completed: true, reps_done: 10, load_done: 20 }),
      serie({ set_number: 2, completed: false, reps_done: 8, load_done: 25 }),
      serie({ set_number: 3, completed: true, reps_done: 8, load_done: 25 }),
    ];
    // Só as concluídas: 10*20 + 8*25 = 200 + 200
    expect(volumeConcluido(logs)).toBe(400);
  });

  it('trata reps/carga nulos como zero via Number(x ?? 0)', () => {
    const logs = [
      serie({ set_number: 1, completed: true, reps_done: null, load_done: 30 }),
      serie({ set_number: 2, completed: true, reps_done: 12, load_done: null }),
      serie({ set_number: 3, completed: true, reps_done: 10, load_done: 15 }),
    ];
    expect(volumeConcluido(logs)).toBe(150);
  });

  it('coage reps/carga vindos como STRING (numeric do Postgres)', () => {
    const logs = [
      serie({
        set_number: 1,
        completed: true,
        reps_done: '12' as unknown as number,
        load_done: '2.5' as unknown as number,
      }),
    ];
    // Number('12') * Number('2.5') = 30
    expect(volumeConcluido(logs)).toBe(30);
  });

  it('é 0 quando nenhuma série foi concluída', () => {
    const logs = [
      serie({ set_number: 1, completed: false, reps_done: 10, load_done: 20 }),
    ];
    expect(volumeConcluido(logs)).toBe(0);
  });

  it('é 0 para lista vazia', () => {
    expect(volumeConcluido([])).toBe(0);
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

describe('serieAtualDeLogs', () => {
  it('lista vazia → 1', () => {
    expect(serieAtualDeLogs([], 3)).toBe(1);
  });

  it('posiciona no primeiro set sem log (séries à frente ainda não iniciadas)', () => {
    const logs = [serie({ set_number: 1, completed: true })];
    expect(serieAtualDeLogs(logs, 3)).toBe(2);
  });

  it('completed=false conta como NÃO concluído e posiciona ali', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2, completed: false }),
      serie({ set_number: 3, completed: true }),
    ];
    // Apesar da 3 estar concluída, a 2 (destocada) é a série atual.
    expect(serieAtualDeLogs(logs, 3)).toBe(2);
  });

  it('todas concluídas → sets (permanece na última)', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2, completed: true }),
      serie({ set_number: 3, completed: true }),
    ];
    expect(serieAtualDeLogs(logs, 3)).toBe(3);
  });

  it('respeita sets como teto mesmo com logs além do prescrito', () => {
    const logs = [
      serie({ set_number: 1, completed: true }),
      serie({ set_number: 2, completed: true }),
    ];
    // sets=2 e ambas concluídas → 2 (não extrapola).
    expect(serieAtualDeLogs(logs, 2)).toBe(2);
  });
});

describe('hidratarSerie', () => {
  it('reps_done null → reps vazio', () => {
    const r = hidratarSerie(serie({ set_number: 1, reps_done: null }));
    expect(r.reps).toBe('');
  });

  it('reps_done numérico → string', () => {
    const r = hidratarSerie(serie({ set_number: 1, reps_done: 12 }));
    expect(r.reps).toBe('12');
  });

  it('carga "30.00" (zeros de escala do numeric) → "30"', () => {
    const r = hidratarSerie(
      serie({ set_number: 1, load_done: '30.00' as unknown as number })
    );
    expect(r.carga).toBe('30');
  });

  it('carga "27.50" → "27.5"', () => {
    const r = hidratarSerie(
      serie({ set_number: 1, load_done: '27.50' as unknown as number })
    );
    expect(r.carga).toBe('27.5');
  });

  it('load_done null → carga vazia', () => {
    const r = hidratarSerie(serie({ set_number: 1, load_done: null }));
    expect(r.carga).toBe('');
  });

  it('propaga completed', () => {
    expect(hidratarSerie(serie({ set_number: 1, completed: true })).completed).toBe(
      true
    );
    expect(
      hidratarSerie(serie({ set_number: 1, completed: false })).completed
    ).toBe(false);
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
