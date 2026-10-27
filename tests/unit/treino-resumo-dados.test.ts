import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Testes de `lib/treino/resumo-dados.ts` (`montarResumoSessao` e
 * `listarHistorico`) com o server client mockado — mesmo estilo de
 * `tests/unit/treino-inicio.test.ts`/`execucao-sessao-aberta.test.ts`.
 *
 * O foco é a LÓGICA de montagem/derivação (reuso de `volumeConcluido`,
 * ordenação por `order_index` asc antes de descartar `order`, filtro de
 * concluídas, aplicação de `studentId`, exposição de `inicioISO`/`fimISO` crus
 * para `formatarDuracao`). A posse real (RLS) é verificada à parte (sem Docker).
 */

// ---- Estado configurável das respostas do Supabase por "cenário" ----
interface Respostas {
  sessao: unknown; // workout_sessions .eq('id').maybeSingle()
  ficha: unknown; // workout_plans .eq('id').maybeSingle()
  logsSessao: unknown[]; // workout_set_logs .eq('session_id')
  candidatas: unknown[]; // workout_sessions comparação
  logsCandidatas: unknown[]; // workout_set_logs .in('session_id')
  conquistas: unknown[]; // user_achievements
  // Histórico:
  historicoData: unknown[]; // workout_sessions listagem
  historicoCount: number; // count: 'exact'
  historicoError: unknown; // erro da listagem
  logsHistorico: unknown[]; // workout_set_logs do histórico
}

let r: Respostas;

/** Marca a última coluna selecionada para distinguir a query de set_logs. */
let ultimaSelectLogs = '';
/** Registra se a listagem aplicou `.eq('student_id', ...)`. */
let historicoStudentIdAplicado: string | null = null;

/**
 * Builder encadeável e "thenável": todo método de filtro retorna o próprio
 * builder; o `await` resolve com o resultado configurado para aquela tabela.
 */
function makeBuilder(tabela: string) {
  // Distingue a 1ª leitura (sessão/ficha via maybeSingle) das listas.
  const builder: Record<string, unknown> = {};

  const resolverLista = () => {
    if (tabela === 'workout_set_logs') {
      // A listagem de histórico seleciona 'session_id, set_number...'; a
      // comparação do resumo seleciona com 'plan_item_id, session_id'. Ambas
      // retornam arrays; usamos a flag para servir a lista certa.
      if (ultimaSelectLogs.includes('workout_plan_items')) {
        return { data: r.logsSessao, error: null };
      }
      // `.in('session_id')` — comparação OU histórico. Servimos conforme o que
      // o cenário preencheu (histórico tem prioridade quando há dados).
      return {
        data: r.logsHistorico.length > 0 ? r.logsHistorico : r.logsCandidatas,
        error: null,
      };
    }
    if (tabela === 'workout_sessions') {
      // Listagem de histórico (tem count) vs. comparação (array só).
      return {
        data: r.historicoData.length > 0 ? r.historicoData : r.candidatas,
        count: r.historicoCount,
        error: r.historicoError,
      };
    }
    if (tabela === 'user_achievements') {
      return { data: r.conquistas, error: null };
    }
    return { data: [], error: null };
  };

  const chain = (fn?: (col: unknown, val: unknown) => void) => (
    col?: unknown,
    val?: unknown
  ) => {
    if (fn) fn(col, val);
    return builder;
  };

  builder.select = (cols: string) => {
    if (tabela === 'workout_set_logs') ultimaSelectLogs = cols;
    return builder;
  };
  builder.eq = chain((col, val) => {
    // A listagem de histórico chama `.eq('student_id', studentId)` — registra
    // o VALOR quando a coluna é student_id (fluxo do professor).
    if (tabela === 'workout_sessions' && col === 'student_id') {
      historicoStudentIdAplicado = val as string;
    }
  });
  builder.is = chain();
  builder.not = chain();
  builder.neq = chain();
  builder.order = chain();
  builder.limit = chain();
  builder.range = chain();
  builder.in = chain();

  builder.maybeSingle = () => {
    if (tabela === 'workout_plans') {
      return Promise.resolve({ data: r.ficha, error: null });
    }
    // workout_sessions .eq('id').maybeSingle()
    return Promise.resolve({ data: r.sessao, error: null });
  };

  // Torna o builder "awaitable" (resolve a lista configurada).
  builder.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(resolverLista()).then(resolve);

  return builder;
}

function makeSupabase() {
  return {
    from: (tabela: string) => makeBuilder(tabela),
  };
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => makeSupabase()),
}));

import { listarHistorico, montarResumoSessao } from '@/lib/treino/resumo-dados';

const SESSAO_OK = {
  id: 'sess-1',
  plan_id: 'plan-1',
  division: 'A',
  student_id: 'aluno-1',
  started_at: '2024-01-01T10:00:00Z',
  finished_at: '2024-01-01T11:00:00Z',
  perceived_intensity: 7,
};

beforeEach(() => {
  vi.clearAllMocks();
  ultimaSelectLogs = '';
  historicoStudentIdAplicado = null;
  r = {
    sessao: SESSAO_OK,
    ficha: { name: 'Ficha X' },
    logsSessao: [],
    candidatas: [],
    logsCandidatas: [],
    conquistas: [],
    historicoData: [],
    historicoCount: 0,
    historicoError: null,
    logsHistorico: [],
  };
});

describe('montarResumoSessao', () => {
  it('retorna nao-encontrada quando a sessão não vem (RLS vazio)', async () => {
    r.sessao = null;
    const res = await montarResumoSessao('sess-1', 'plan-1');
    expect(res.tipo).toBe('nao-encontrada');
  });

  it('retorna em-andamento quando finished_at é null, expondo planId/division', async () => {
    r.sessao = { ...SESSAO_OK, finished_at: null };
    const res = await montarResumoSessao('sess-1', 'plan-1');
    expect(res).toEqual({
      tipo: 'em-andamento',
      planId: 'plan-1',
      division: 'A',
    });
  });

  it('em-andamento com plan_id null cai no fallback do planId da rota', async () => {
    r.sessao = { ...SESSAO_OK, plan_id: null, finished_at: null };
    const res = await montarResumoSessao('sess-1', 'plan-rota');
    expect(res).toMatchObject({ tipo: 'em-andamento', planId: 'plan-rota' });
  });

  it('ok: usa volumeConcluido (só séries concluídas) e expõe os instantes crus', async () => {
    r.logsSessao = [
      // Concluída: conta no volume (10 × 20 = 200).
      {
        set_number: 1,
        reps_done: 10,
        load_done: 20,
        completed: true,
        plan_item_id: 'item-1',
        workout_plan_items: { order_index: 0, exercises: { name: 'Supino' } },
      },
      // NÃO concluída: ignorada pelo volume.
      {
        set_number: 2,
        reps_done: 10,
        load_done: 50,
        completed: false,
        plan_item_id: 'item-1',
        workout_plan_items: { order_index: 0, exercises: { name: 'Supino' } },
      },
    ];

    const res = await montarResumoSessao('sess-1', 'plan-1');
    expect(res.tipo).toBe('ok');
    if (res.tipo !== 'ok') return;
    expect(res.dados.volumeKg).toBe(200);
    expect(res.dados.seriesConcluidas).toBe(1);
    expect(res.dados.inicioISO).toBe('2024-01-01T10:00:00Z');
    expect(res.dados.fimISO).toBe('2024-01-01T11:00:00Z');
    expect(res.dados.studentId).toBe('aluno-1');
    expect(res.dados.fichaNome).toBe('Ficha X');
  });

  it('ok: ordena exercícios por order_index asc e NÃO expõe `order`', async () => {
    r.logsSessao = [
      // item-b tem order_index 1 (deveria vir DEPOIS de item-a, order 0).
      {
        set_number: 1,
        reps_done: 8,
        load_done: 30,
        completed: true,
        plan_item_id: 'item-b',
        workout_plan_items: { order_index: 1, exercises: { name: 'Agacho' } },
      },
      {
        set_number: 1,
        reps_done: 12,
        load_done: 10,
        completed: true,
        plan_item_id: 'item-a',
        workout_plan_items: { order_index: 0, exercises: { name: 'Supino' } },
      },
    ];

    const res = await montarResumoSessao('sess-1', 'plan-1');
    if (res.tipo !== 'ok') throw new Error('esperava ok');

    // Ordenado por order_index asc: item-a (0) antes de item-b (1).
    expect(res.dados.exercicios.map((e) => e.id)).toEqual(['item-a', 'item-b']);
    // Shape final SEM `order`.
    for (const ex of res.dados.exercicios) {
      expect(ex).not.toHaveProperty('order');
      expect(Object.keys(ex).sort()).toEqual(
        ['id', 'nome', 'seriesConcluidas'].sort()
      );
    }
  });

  it('ok: primeira sessão (sem candidatas) → comparacao tipo primeira', async () => {
    r.logsSessao = [
      {
        set_number: 1,
        reps_done: 10,
        load_done: 20,
        completed: true,
        plan_item_id: 'item-1',
        workout_plan_items: { order_index: 0, exercises: { name: 'Supino' } },
      },
    ];
    r.candidatas = [];
    const res = await montarResumoSessao('sess-1', 'plan-1');
    if (res.tipo !== 'ok') throw new Error('esperava ok');
    expect(res.dados.comparacao.tipo).toBe('primeira');
  });
});

describe('listarHistorico', () => {
  const linhaSessao = {
    id: 'sess-1',
    plan_id: 'plan-1',
    division: 'A',
    started_at: '2024-01-01T10:00:00Z',
    finished_at: '2024-01-01T11:00:00Z',
    perceived_intensity: 8,
    notes: 'ótimo treino',
    workout_plans: { name: 'Ficha X' },
  };

  it('deriva volume/séries via volumeConcluido e expõe inicioISO/fimISO crus', async () => {
    r.historicoData = [linhaSessao];
    r.historicoCount = 1;
    r.logsHistorico = [
      { session_id: 'sess-1', set_number: 1, reps_done: 10, load_done: 20, completed: true, plan_item_id: 'i1' },
      { session_id: 'sess-1', set_number: 2, reps_done: 10, load_done: 99, completed: false, plan_item_id: 'i1' },
    ];

    const { itens, total } = await listarHistorico({
      intervalo: { from: 0, to: 9 },
    });

    expect(total).toBe(1);
    expect(itens).toHaveLength(1);
    const item = itens[0];
    expect(item.volumeKg).toBe(200); // só a série concluída
    expect(item.seriesConcluidas).toBe(1);
    expect(item.inicioISO).toBe('2024-01-01T10:00:00Z');
    expect(item.fimISO).toBe('2024-01-01T11:00:00Z');
    expect(item.fichaNome).toBe('Ficha X');
    expect(item.perceivedIntensity).toBe(8);
    expect(item.temNota).toBe(true);
  });

  it('aplica .eq(student_id) quando studentId é informado', async () => {
    r.historicoData = [linhaSessao];
    r.historicoCount = 1;

    await listarHistorico({
      studentId: 'aluno-42',
      intervalo: { from: 0, to: 9 },
    });

    expect(historicoStudentIdAplicado).toBe('aluno-42');
  });

  it('não aplica student_id no fluxo do aluno (RLS própria)', async () => {
    r.historicoData = [linhaSessao];
    r.historicoCount = 1;

    await listarHistorico({ intervalo: { from: 0, to: 9 } });

    expect(historicoStudentIdAplicado).toBeNull();
  });

  it('erro de query → itens vazios e total 0 (degrada para EmptyState)', async () => {
    r.historicoData = [linhaSessao];
    r.historicoCount = 1;
    r.historicoError = { message: 'boom' };

    const { itens, total } = await listarHistorico({
      intervalo: { from: 0, to: 9 },
    });

    expect(itens).toEqual([]);
    expect(total).toBe(0);
  });

  it('temNota=false quando notes é vazio/só espaços', async () => {
    r.historicoData = [{ ...linhaSessao, notes: '   ' }];
    r.historicoCount = 1;

    const { itens } = await listarHistorico({ intervalo: { from: 0, to: 9 } });
    expect(itens[0].temNota).toBe(false);
  });
});
