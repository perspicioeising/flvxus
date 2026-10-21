import { describe, expect, it } from 'vitest';

import {
  detectarEstagnacao,
  montarSerieCarga,
  resumoFrequencia,
  temSerieCarga,
  type LogCarga,
  type SessaoCarga,
} from '@/lib/treino/evolucao-carga';

function log(parcial: Partial<LogCarga> & { session_id: string }): LogCarga {
  return {
    plan_item_id: 'item-1',
    exercicioNome: 'Supino',
    set_number: 1,
    reps_done: 10,
    load_done: 50,
    completed: true,
    ...parcial,
  };
}

function sessao(parcial: Partial<SessaoCarga> & { id: string; started_at: string }): SessaoCarga {
  return {
    finished_at: parcial.started_at,
    ...parcial,
  };
}

describe('montarSerieCarga', () => {
  it('agrupa por exercício e ordena pontos por started_at asc', () => {
    const sessoes = [
      sessao({ id: 's2', started_at: '2024-03-10T10:00:00Z' }),
      sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' }),
    ];
    const logs = [
      log({ session_id: 's2', exercicioNome: 'Supino', load_done: 60 }),
      log({ session_id: 's1', exercicioNome: 'Supino', load_done: 50 }),
      log({ session_id: 's1', exercicioNome: 'Agachamento', load_done: 80 }),
    ];
    const series = montarSerieCarga(logs, sessoes);
    expect(series.map((s) => s.exercicio)).toEqual(['Agachamento', 'Supino']);
    const supino = series.find((s) => s.exercicio === 'Supino')!;
    expect(supino.pontos.map((p) => p.cargaMax)).toEqual([50, 60]);
    expect(supino.pontos[0].rotulo).toBe('03/03');
    expect(supino.pontos[1].rotulo).toBe('10/03');
  });

  it('calcula cargaMax, cargaMedia e volume por sessão/exercício', () => {
    const sessoes = [sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' })];
    const logs = [
      log({ session_id: 's1', set_number: 1, load_done: 40, reps_done: 10 }),
      log({ session_id: 's1', set_number: 2, load_done: 60, reps_done: 8 }),
    ];
    const [supino] = montarSerieCarga(logs, sessoes);
    expect(supino.pontos[0].cargaMax).toBe(60);
    expect(supino.pontos[0].cargaMedia).toBe(50);
    expect(supino.pontos[0].volume).toBe(40 * 10 + 60 * 8);
  });

  it('tolera load_done null parcial e todo-null', () => {
    const sessoes = [
      sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' }),
      sessao({ id: 's2', started_at: '2024-03-10T10:00:00Z' }),
    ];
    const logs = [
      log({ session_id: 's1', set_number: 1, load_done: 50, reps_done: 10 }),
      log({ session_id: 's1', set_number: 2, load_done: null, reps_done: 10 }),
      log({ session_id: 's2', set_number: 1, load_done: null, reps_done: null }),
    ];
    const [supino] = montarSerieCarga(logs, sessoes);
    // Sessão 1: só uma carga válida (50)
    expect(supino.pontos[0].cargaMax).toBe(50);
    expect(supino.pontos[0].cargaMedia).toBe(50);
    expect(supino.pontos[0].volume).toBe(50 * 10); // null reps/carga → 0
    // Sessão 2: nenhuma carga → null
    expect(supino.pontos[1].cargaMax).toBeNull();
    expect(supino.pontos[1].cargaMedia).toBeNull();
    expect(supino.pontos[1].volume).toBe(0);
  });

  it('conta seriesFeitas e seriesTotais', () => {
    const sessoes = [sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' })];
    const logs = [
      log({ session_id: 's1', set_number: 1, completed: true }),
      log({ session_id: 's1', set_number: 2, completed: false }),
      log({ session_id: 's1', set_number: 3, completed: true }),
    ];
    const [supino] = montarSerieCarga(logs, sessoes);
    expect(supino.pontos[0].seriesFeitas).toBe(2);
    expect(supino.pontos[0].seriesTotais).toBe(3);
  });

  it('ignora logs órfãos (exercicioNome null)', () => {
    const sessoes = [sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' })];
    const logs = [
      log({ session_id: 's1', exercicioNome: 'Supino', load_done: 50 }),
      log({ session_id: 's1', exercicioNome: null, load_done: 99 }),
    ];
    const series = montarSerieCarga(logs, sessoes);
    expect(series).toHaveLength(1);
    expect(series[0].exercicio).toBe('Supino');
    expect(series[0].pontos[0].cargaMax).toBe(50);
  });

  it('desambigua duas sessões do mesmo dia com a hora', () => {
    const sessoes = [
      sessao({ id: 's1', started_at: '2024-03-03T08:00:00Z' }),
      sessao({ id: 's2', started_at: '2024-03-03T18:00:00Z' }),
    ];
    const logs = [
      log({ session_id: 's1', load_done: 50 }),
      log({ session_id: 's2', load_done: 55 }),
    ];
    const [supino] = montarSerieCarga(logs, sessoes);
    expect(supino.pontos.map((p) => p.rotulo)).toEqual(['03/03 08:00', '03/03 18:00']);
  });

  it('descarta sessões com started_at inválido ou desconhecidas', () => {
    const sessoes = [sessao({ id: 's1', started_at: 'data-invalida' })];
    const logs = [
      log({ session_id: 's1', load_done: 50 }),
      log({ session_id: 'inexistente', load_done: 99 }),
    ];
    const series = montarSerieCarga(logs, sessoes);
    expect(series).toHaveLength(0);
  });
});

describe('temSerieCarga', () => {
  it('true só com ≥2 pontos com cargaMax não nulo', () => {
    const sessoes = [
      sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' }),
      sessao({ id: 's2', started_at: '2024-03-10T10:00:00Z' }),
    ];
    const [supino] = montarSerieCarga(
      [log({ session_id: 's1', load_done: 50 }), log({ session_id: 's2', load_done: 55 })],
      sessoes
    );
    expect(temSerieCarga(supino)).toBe(true);
  });

  it('false com apenas um ponto', () => {
    const sessoes = [sessao({ id: 's1', started_at: '2024-03-03T10:00:00Z' })];
    const [supino] = montarSerieCarga([log({ session_id: 's1', load_done: 50 })], sessoes);
    expect(temSerieCarga(supino)).toBe(false);
  });
});

describe('detectarEstagnacao', () => {
  function serieDeCargas(cargas: (number | null)[]) {
    const sessoes = cargas.map((_, i) =>
      sessao({ id: `s${i}`, started_at: `2024-03-0${i + 1}T10:00:00Z` })
    );
    const logs = cargas.map((c, i) => log({ session_id: `s${i}`, load_done: c }));
    return montarSerieCarga(logs, sessoes)[0];
  }

  it('true quando a carga não sobe nas últimas 3 sessões', () => {
    expect(detectarEstagnacao(serieDeCargas([40, 50, 50, 50]))).toBe(true);
  });

  it('false quando a carga sobe', () => {
    expect(detectarEstagnacao(serieDeCargas([40, 50, 55]))).toBe(false);
  });

  it('false com menos de n pontos com carga', () => {
    expect(detectarEstagnacao(serieDeCargas([50, 50]))).toBe(false);
  });

  it('respeita n custom', () => {
    expect(detectarEstagnacao(serieDeCargas([50, 50]), 2)).toBe(true);
  });
});

describe('resumoFrequencia', () => {
  const REFERENCIA = new Date('2024-03-31T12:00:00Z');

  it('totais batem com resumoAderencia e agrupa por semana', () => {
    const resumo = resumoFrequencia(
      [
        sessao({ id: 's1', started_at: '2024-03-04T10:00:00Z', finished_at: '2024-03-04T11:00:00Z' }),
        sessao({ id: 's2', started_at: '2024-03-06T10:00:00Z', finished_at: '2024-03-06T11:00:00Z' }),
        sessao({ id: 's3', started_at: '2024-03-18T10:00:00Z', finished_at: '2024-03-18T11:00:00Z' }),
      ],
      30,
      REFERENCIA
    );
    expect(resumo.concluidasPeriodo).toBe(3);
    expect(resumo.concluidasTotal).toBe(3);
    // Semanas: 04 e 06/03 caem na mesma semana (seg 04/03); 18/03 é outra (seg 18/03).
    expect(resumo.porSemana).toEqual([
      { semana: '04/03', total: 2 },
      { semana: '18/03', total: 1 },
    ]);
    expect(resumo.semanasComTreino).toBe(2);
  });

  it('ignora sessões sem finished_at', () => {
    const resumo = resumoFrequencia(
      [
        sessao({ id: 's1', started_at: '2024-03-04T10:00:00Z', finished_at: null }),
        sessao({ id: 's2', started_at: '2024-03-06T10:00:00Z', finished_at: '2024-03-06T11:00:00Z' }),
      ],
      30,
      REFERENCIA
    );
    expect(resumo.concluidasPeriodo).toBe(1);
    expect(resumo.porSemana).toEqual([{ semana: '04/03', total: 1 }]);
  });

  it('lista vazia → zeros', () => {
    const resumo = resumoFrequencia([], 30, REFERENCIA);
    expect(resumo.concluidasPeriodo).toBe(0);
    expect(resumo.concluidasTotal).toBe(0);
    expect(resumo.porSemana).toEqual([]);
    expect(resumo.semanasComTreino).toBe(0);
  });
});
