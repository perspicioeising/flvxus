import { notFound, redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { DIVISAO_SEM } from '@/lib/divisao';
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
import {
  ResumoSessao,
  type ComparacaoEstado,
  type ConquistaResumo,
  type ExercicioResumo,
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

/**
 * Resumo pós-treino (RSC) de uma sessão finalizada. Lê sob RLS: a sessão
 * (inexistente/alheia → `notFound()`; do aluno mas não finalizada → `redirect`
 * à execução preservando o eixo), as séries (duração, séries concluídas, volume
 * total e lista de exercícios), a última sessão comparável do mesmo
 * `(plan_id, division)` e as conquistas desbloqueadas nesta sessão.
 *
 * Volume = Σ reps_done×load_done das séries CONCLUÍDAS (coerção única em
 * `volumeConcluido`). Conquistas: `earned_at = session.finished_at` por
 * igualdade — o trigger carimba `earned_at` com `finished_at` (relógio único).
 */
export default async function AlunoResumoSessaoPage({
  params,
}: {
  params: Promise<{ planId: string; sessionId: string }>;
}) {
  const { planId, sessionId } = await params;
  const supabase = await createClient();

  const { data: sessao } = await supabase
    .from('workout_sessions')
    .select(
      'id, plan_id, division, student_id, started_at, finished_at, perceived_intensity'
    )
    .eq('id', sessionId)
    .maybeSingle();

  // Inexistente/alheia (RLS retorna vazio) → 404.
  if (!sessao) {
    notFound();
  }

  // Do aluno mas ainda em andamento → volta à execução preservando o eixo.
  if (sessao.finished_at === null) {
    const base = `/aluno/execucao/${sessao.plan_id ?? planId}`;
    const destino =
      sessao.division !== null
        ? `${base}?divisao=${encodeURIComponent(sessao.division)}`
        : `${base}?divisao=${DIVISAO_SEM}`;
    redirect(destino);
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

  return (
    <ResumoSessao
      fichaNome={ficha?.name ?? 'Treino'}
      grupoLabel={sessao.division}
      inicioISO={sessao.started_at}
      fimISO={sessao.finished_at}
      volumeKg={volumeAtual}
      seriesConcluidas={seriesConcluidasAtual}
      exercicios={exercicios}
      comparacao={comparacao}
      conquistas={conquistas}
      href="/aluno/treinos"
    />
  );
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
