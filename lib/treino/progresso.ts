/**
 * Lógica pura de progresso de uma sessão de treino (sem UI, sem Supabase).
 *
 * Opera sobre os registros de série (`workout_set_logs`) de uma sessão. É
 * reutilizada pela tela de execução (FEAT seguinte) e pela visão de progresso.
 */

/** Registro mínimo de uma série para cálculo de progresso. */
export interface SerieLog {
  completed: boolean;
  reps_done: number | null;
  load_done: number | null;
  plan_item_id: string | null;
  set_number: number;
}

/** Resumo do andamento de uma sessão. */
export interface ProgressoSessao {
  /** Quantidade de séries marcadas como concluídas. */
  feitas: number;
  /** Total de séries registradas. */
  total: number;
  /** Percentual concluído (0..100), arredondado. */
  pct: number;
}

/**
 * Progresso de uma sessão: `feitas` (séries concluídas), `total` (séries
 * registradas) e `pct` (percentual arredondado). Sem séries, `pct` é 0.
 */
export function progressoSessao(logs: SerieLog[]): ProgressoSessao {
  const total = logs.length;
  const feitas = logs.reduce((acc, log) => acc + (log.completed ? 1 : 0), 0);
  const pct = total === 0 ? 0 : Math.round((feitas / total) * 100);
  return { feitas, total, pct };
}

/**
 * Agrupa os registros por `plan_item_id` (exercício prescrito). Séries sem
 * item vinculado (`plan_item_id = null`) caem na chave `'sem-item'`.
 */
export function seriesPorItem(logs: SerieLog[]): Map<string, SerieLog[]> {
  const grupos = new Map<string, SerieLog[]>();
  for (const log of logs) {
    const chave = log.plan_item_id ?? 'sem-item';
    const bucket = grupos.get(chave);
    if (bucket) {
      bucket.push(log);
    } else {
      grupos.set(chave, [log]);
    }
  }
  return grupos;
}

/**
 * Volume total da sessão: Σ (reps_done × load_done) sobre as séries. Valores
 * nulos de reps/carga são tratados como 0, sem quebrar.
 */
export function volumeSessao(logs: SerieLog[]): number {
  return logs.reduce(
    (acc, log) => acc + (log.reps_done ?? 0) * (log.load_done ?? 0),
    0
  );
}
