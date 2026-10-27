/**
 * Montagem SERVER-SIDE do resumo pós-treino e do histórico de sessões.
 *
 * Extrai, VERBATIM, a lógica antes embutida no `page.tsx` de resumo do aluno
 * (`app/(aluno)/aluno/execucao/[planId]/resumo/[sessionId]/page.tsx`) para um
 * módulo reutilizável por DUAS rotas (resumo do aluno e rota-espelho do
 * professor) e pela(s) tela(s) de histórico — sem recálculo divergente.
 *
 * Usa `createClient()` (RLS ativo): nenhuma consulta refiltra posse à mão; a
 * visibilidade (aluno dono OU trainer conforme o gate de módulo da Fase 3) é
 * responsabilidade exclusiva da RLS. Nunca usa `service_role`. É server-side por
 * construção: só é importado por RSCs (`createClient()` depende de `cookies()`).
 */
import { createClient } from '@/lib/supabase/server';
import type { IntervaloPagina } from '@/lib/paginacao';
import {
  seriesPorItem,
  volumeConcluido,
  type SerieLog,
} from '@/lib/treino/progresso';
import {
  compararSessoes,
  selecionarSessaoComparavel,
  type MetricasSessao,
} from '@/lib/treino/resumo';
import type {
  ComparacaoEstado,
  ConquistaResumo,
  ExercicioResumo,
} from '@/components/aluno/execucao/resumo-sessao';

/** Teto de salvaguarda ao varrer sessões anteriores (documentado no design). */
const TETO_SESSOES_ANTERIORES = 50;

/** Normaliza o join `exercises` (array ou objeto) para o nome do exercício. */
function nomeDoExercicio(exercises: unknown): string {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const nome = (e as { name: string | null } | null)?.name;
  return nome?.trim() || 'Exercício';
}

/** Normaliza o join `workout_plan_items` (array ou objeto). */
function itemDoJoin(join: unknown): {
  order_index: number;
  exercises: unknown;
} | null {
  const i = Array.isArray(join) ? join[0] : join;
  return (i as { order_index: number; exercises: unknown } | null) ?? null;
}

/** Linha de set log com o join do item prescrito (para nome/ordem). */
interface SetLogComItem {
  set_number: number;
  reps_done: number | null;
  load_done: number | null;
  completed: boolean;
  plan_item_id: string | null;
  workout_plan_items: unknown;
}

/** Converte uma linha de set log em `SerieLog` (lógica pura de volume/progresso). */
function paraSerieLog(l: SetLogComItem): SerieLog {
  return {
    completed: l.completed,
    reps_done: l.reps_done,
    load_done: l.load_done,
    plan_item_id: l.plan_item_id,
    set_number: l.set_number,
  };
}

/** Duração em segundos (floor) entre dois instantes ISO; 0 se inválido. */
function duracaoEmSegundos(
  inicioISO: string | null,
  fimISO: string | null
): number {
  if (!inicioISO || !fimISO) return 0;
  const i = Date.parse(inicioISO);
  const f = Date.parse(fimISO);
  if (Number.isNaN(i) || Number.isNaN(f)) return 0;
  return Math.max(0, Math.floor((f - i) / 1000));
}

/** Dados prontos para o componente apresentacional `ResumoSessao`. */
export interface DadosResumo {
  fichaNome: string;
  grupoLabel: string | null;
  inicioISO: string | null;
  fimISO: string | null;
  volumeKg: number;
  seriesConcluidas: number;
  /** Exercícios executados, ordenados por `order_index` asc e SEM `order`. */
  exercicios: ExercicioResumo[];
  comparacao: ComparacaoEstado;
  conquistas: ConquistaResumo[];
  /** `student_id` da sessão — base do guard de posse na rota do professor. */
  studentId: string;
}

/**
 * Resultado da montagem do resumo, delegando à ROTA a decisão de fluxo:
 * - `nao-encontrada` → a rota responde `notFound()` (RLS vazio/alheia);
 * - `em-andamento`   → a rota `redirect`a à execução (sessão não finalizada);
 * - `ok`             → a rota renderiza `ResumoSessao` com `dados`.
 */
export type ResumoResultado =
  | { tipo: 'nao-encontrada' }
  | { tipo: 'em-andamento'; planId: string | null; division: string | null }
  | { tipo: 'ok'; dados: DadosResumo };

/**
 * Monta o resumo de UMA sessão finalizada reproduzindo VERBATIM o cálculo que
 * antes vivia no `page.tsx` do aluno: mesma leitura da sessão, mesmas queries de
 * logs com join do item prescrito (`order_index`/`exercises(name)`), mesmo
 * `TETO_SESSOES_ANTERIORES`, mesmo `volumeConcluido`, `selecionarSessaoComparavel`,
 * `compararSessoes` e conquistas por `earned_at = finished_at`.
 *
 * `planId` é o contexto da rota, preservando o fallback original
 * `sessao.plan_id ?? planId` (uma sessão só fica com `plan_id = null` após a
 * ficha ser apagada). Todas as leituras são sob RLS.
 */
export async function montarResumoSessao(
  sessionId: string,
  planId: string
): Promise<ResumoResultado> {
  const supabase = await createClient();

  const { data: sessao } = await supabase
    .from('workout_sessions')
    .select(
      'id, plan_id, division, student_id, started_at, finished_at, perceived_intensity'
    )
    .eq('id', sessionId)
    .maybeSingle();

  // Inexistente/alheia (RLS retorna vazio) → a rota responde 404.
  if (!sessao) {
    return { tipo: 'nao-encontrada' };
  }

  // Ainda em andamento → a rota decide o destino do redirect (eixo preservado).
  if (sessao.finished_at === null) {
    return {
      tipo: 'em-andamento',
      planId: sessao.plan_id ?? planId,
      division: sessao.division,
    };
  }

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('name')
    .eq('id', sessao.plan_id ?? planId)
    .maybeSingle();

  // Séries desta sessão + join do item prescrito (nome e ordem do exercício).
  const { data: logsData } = await supabase
    .from('workout_set_logs')
    .select(
      'set_number, reps_done, load_done, completed, plan_item_id, workout_plan_items(order_index, exercises(name))'
    )
    .eq('session_id', sessionId);

  const logs = (logsData ?? []) as SetLogComItem[];
  const serieLogs = logs.map(paraSerieLog);

  const volumeAtual = volumeConcluido(serieLogs);
  const seriesConcluidasAtual = serieLogs.filter((l) => l.completed).length;

  // Lista de exercícios EXECUTADOS (com ≥ 1 série concluída), por item.
  const porItem = seriesPorItem(serieLogs);
  const metaPorItem = new Map<string, { nome: string; order: number }>();
  for (const l of logs) {
    if (!l.plan_item_id) continue;
    if (!metaPorItem.has(l.plan_item_id)) {
      const item = itemDoJoin(l.workout_plan_items);
      metaPorItem.set(l.plan_item_id, {
        nome: nomeDoExercicio(item?.exercises),
        order: item?.order_index ?? 0,
      });
    }
  }

  const exercicios: ExercicioResumo[] = Array.from(porItem.entries())
    .map(([itemId, series]) => {
      const concluidas = series.filter((s) => s.completed).length;
      const meta = metaPorItem.get(itemId);
      return {
        id: itemId,
        nome: meta?.nome ?? 'Exercício',
        order: meta?.order ?? 0,
        seriesConcluidas: concluidas,
      };
    })
    .filter((e) => e.seriesConcluidas > 0)
    .sort((a, b) => a.order - b.order)
    .map(({ id, nome, seriesConcluidas }) => ({ id, nome, seriesConcluidas }));

  // --- Comparação com a última sessão comparável do mesmo (plan_id, division).
  let candidatasQuery = supabase
    .from('workout_sessions')
    .select('id, started_at, finished_at')
    .eq('plan_id', sessao.plan_id ?? planId)
    .not('finished_at', 'is', null)
    .neq('id', sessionId)
    .order('finished_at', { ascending: false })
    .limit(TETO_SESSOES_ANTERIORES);

  candidatasQuery =
    sessao.division !== null
      ? candidatasQuery.eq('division', sessao.division)
      : candidatasQuery.is('division', null);

  const { data: candidatasData } = await candidatasQuery;
  const candidatas = candidatasData ?? [];

  // Séries concluídas por sessão candidata (uma query para todas).
  const contagemPorSessao = new Map<string, number>();
  const logsPorSessao = new Map<string, SerieLog[]>();
  if (candidatas.length > 0) {
    const { data: logsAntData } = await supabase
      .from('workout_set_logs')
      .select('set_number, reps_done, load_done, completed, plan_item_id, session_id')
      .in(
        'session_id',
        candidatas.map((c) => c.id)
      );
    for (const l of (logsAntData ?? []) as Array<
      SerieLog & { session_id: string }
    >) {
      const lista = logsPorSessao.get(l.session_id) ?? [];
      lista.push({
        completed: l.completed,
        reps_done: l.reps_done,
        load_done: l.load_done,
        plan_item_id: l.plan_item_id,
        set_number: l.set_number,
      });
      logsPorSessao.set(l.session_id, lista);
      if (l.completed) {
        contagemPorSessao.set(
          l.session_id,
          (contagemPorSessao.get(l.session_id) ?? 0) + 1
        );
      }
    }
  }

  const selecao = selecionarSessaoComparavel(
    candidatas.map((c) => ({
      id: c.id,
      seriesConcluidas: contagemPorSessao.get(c.id) ?? 0,
    }))
  );

  let comparacao: ComparacaoEstado;
  if (selecao.tipo === 'comparavel') {
    const anteriorSessao = candidatas.find((c) => c.id === selecao.id)!;
    const anteriorLogs = logsPorSessao.get(selecao.id) ?? [];
    const metricasAtual: MetricasSessao = {
      duracaoSegundos: duracaoEmSegundos(
        sessao.started_at,
        sessao.finished_at
      ),
      volumeKg: volumeAtual,
      seriesConcluidas: seriesConcluidasAtual,
    };
    const metricasAnterior: MetricasSessao = {
      duracaoSegundos: duracaoEmSegundos(
        anteriorSessao.started_at,
        anteriorSessao.finished_at
      ),
      volumeKg: volumeConcluido(anteriorLogs),
      seriesConcluidas: anteriorLogs.filter((l) => l.completed).length,
    };
    comparacao = {
      tipo: 'comparavel',
      deltas: compararSessoes(metricasAtual, metricasAnterior),
    };
  } else {
    comparacao = { tipo: selecao.tipo };
  }

  // --- Conquistas desbloqueadas NESTA sessão: earned_at = finished_at (igualdade).
  const { data: conquistasData } = await supabase
    .from('user_achievements')
    .select('achievement_id, earned_at, achievements(name, description, icon, points)')
    .eq('student_id', sessao.student_id)
    .eq('earned_at', sessao.finished_at);

  const conquistas: ConquistaResumo[] = (conquistasData ?? []).map((c) => {
    const a = Array.isArray(c.achievements) ? c.achievements[0] : c.achievements;
    const reg = a as {
      name: string | null;
      description: string | null;
      icon: string | null;
      points: number | null;
    } | null;
    return {
      id: c.achievement_id,
      name: reg?.name ?? 'Conquista',
      description: reg?.description ?? null,
      icon: reg?.icon ?? null,
      points: reg?.points ?? 0,
    };
  });

  return {
    tipo: 'ok',
    dados: {
      fichaNome: ficha?.name ?? 'Treino',
      grupoLabel: sessao.division,
      inicioISO: sessao.started_at,
      fimISO: sessao.finished_at,
      volumeKg: volumeAtual,
      seriesConcluidas: seriesConcluidasAtual,
      exercicios,
      comparacao,
      conquistas,
      studentId: sessao.student_id,
    },
  };
}

// ---------------------------------------------------------------------------
// Histórico de sessões (aluno e professor)
// ---------------------------------------------------------------------------

/** Um item da lista de histórico de sessões CONCLUÍDAS. */
export interface ItemHistorico {
  sessionId: string;
  planId: string | null;
  fichaNome: string;
  division: string | null;
  /** `started_at` cru — para `formatarDuracao(inicioISO, fimISO)`. */
  inicioISO: string | null;
  /** `finished_at` cru — data exibida E fim da duração. */
  fimISO: string | null;
  /** Volume (kg) das séries concluídas (`volumeConcluido`). */
  volumeKg: number;
  seriesConcluidas: number;
  perceivedIntensity: number | null;
  temNota: boolean;
}

/** Linha de sessão retornada pela listagem de histórico (com join da ficha). */
interface SessaoHistoricoRow {
  id: string;
  plan_id: string | null;
  division: string | null;
  started_at: string | null;
  finished_at: string | null;
  perceived_intensity: number | null;
  notes: string | null;
  workout_plans: unknown;
}

/** Normaliza o join `workout_plans` (array ou objeto) para o nome da ficha. */
function nomeDaFicha(join: unknown): string {
  const p = Array.isArray(join) ? join[0] : join;
  const nome = (p as { name: string | null } | null)?.name;
  return nome?.trim() || 'Treino';
}

/**
 * Lista paginada de sessões CONCLUÍDAS (`finished_at` não-nulo), ordenadas por
 * `finished_at desc`. Quando `studentId` vem, fixa o aluno (fluxo do professor);
 * quando omitido, a RLS restringe ao próprio aluno (fluxo do aluno). O volume e
 * as séries concluídas são derivados de UMA query de logs via a MESMA lógica
 * pura do resumo (`volumeConcluido`), sem fórmula paralela. A duração NÃO é
 * pré-computada: `inicioISO`/`fimISO` crus alimentam `formatarDuracao`.
 *
 * Erro de query → `{ itens: [], total: 0 }` (degrada para EmptyState), logado
 * no servidor. Isolamento de tenant garantido pela RLS mesmo em erro.
 */
export async function listarHistorico(opts: {
  studentId?: string;
  intervalo: IntervaloPagina;
}): Promise<{ itens: ItemHistorico[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('workout_sessions')
    .select(
      'id, plan_id, division, started_at, finished_at, perceived_intensity, notes, workout_plans(name)',
      { count: 'exact' }
    )
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .range(opts.intervalo.from, opts.intervalo.to);

  if (opts.studentId) {
    query = query.eq('student_id', opts.studentId);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[listarHistorico] erro ao listar sessões:', error.message);
    return { itens: [], total: 0 };
  }

  const linhas = (data ?? []) as unknown as SessaoHistoricoRow[];
  const ids = linhas.map((l) => l.id);

  // Volume + séries concluídas por sessão numa única query de logs.
  const volumePorSessao = new Map<string, number>();
  const seriesPorSessao = new Map<string, number>();
  if (ids.length > 0) {
    const { data: logsData } = await supabase
      .from('workout_set_logs')
      .select('session_id, set_number, reps_done, load_done, completed, plan_item_id')
      .in('session_id', ids);

    const logsPorSessao = new Map<string, SerieLog[]>();
    for (const l of (logsData ?? []) as Array<
      SerieLog & { session_id: string }
    >) {
      const lista = logsPorSessao.get(l.session_id) ?? [];
      lista.push({
        completed: l.completed,
        reps_done: l.reps_done,
        load_done: l.load_done,
        plan_item_id: l.plan_item_id,
        set_number: l.set_number,
      });
      logsPorSessao.set(l.session_id, lista);
    }
    for (const [sessionId, lista] of logsPorSessao) {
      volumePorSessao.set(sessionId, volumeConcluido(lista));
      seriesPorSessao.set(
        sessionId,
        lista.filter((l) => l.completed).length
      );
    }
  }

  const itens: ItemHistorico[] = linhas.map((l) => ({
    sessionId: l.id,
    planId: l.plan_id,
    fichaNome: nomeDaFicha(l.workout_plans),
    division: l.division,
    inicioISO: l.started_at,
    fimISO: l.finished_at,
    volumeKg: volumePorSessao.get(l.id) ?? 0,
    seriesConcluidas: seriesPorSessao.get(l.id) ?? 0,
    perceivedIntensity: l.perceived_intensity,
    temNota: (l.notes ?? '').trim().length > 0,
  }));

  return { itens, total: count ?? 0 };
}
