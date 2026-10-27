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
 * Um exercício está concluído quando tem ao menos uma série registrada e todas
 * elas estão com `completed === true`. Lista vazia ⇒ `false`.
 */
export function exercicioConcluido(logsDoItem: SerieLog[]): boolean {
  return logsDoItem.length > 0 && logsDoItem.every((log) => log.completed);
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

/**
 * Reconstrói a "série atual" de um exercício a partir dos seus logs: o primeiro
 * `set_number` (1..sets) ainda NÃO concluído (sem log OU com `completed !==
 * true`). Se TODOS os `sets` já estão concluídos, retorna `sets` (permanece na
 * última). Lista vazia ⇒ 1. O resultado é sempre limitado ao teto `sets`.
 *
 * Só `completed === true` conta como concluído: uma série tocada e destocada
 * (`completed === false`) volta a ser a "série atual", preservando o
 * comportamento de edição. Puro e testável (sem UI, sem I/O).
 */
export function serieAtualDeLogs(logsDoItem: SerieLog[], sets: number): number {
  const teto = Math.max(sets, 1);
  const concluidas = new Set(
    logsDoItem
      .filter((log) => log.completed === true)
      .map((log) => log.set_number)
  );
  for (let n = 1; n <= teto; n += 1) {
    if (!concluidas.has(n)) return n;
  }
  return teto;
}

/** Valores reidratados de UMA série para o estado da UI de execução. */
export interface SerieHidratada {
  reps: string;
  carga: string;
  completed: boolean;
}

/**
 * Reconstrói o valor de UMA série (reps/carga/completed) a partir de um
 * `SerieLog`, aplicando a coerção numérica INVERSA da escrita. `reps_done` e
 * `load_done` são `integer`/`numeric(6,2)` nullable que podem chegar como STRING
 * em runtime; normalizamos para a string que a UI exibe:
 *
 * - `reps`  = `''` quando nulo; senão `String(reps_done)`.
 * - `carga` = `''` quando nulo; senão `String(Number(load_done))` — o
 *   `Number(...)` descarta zeros de escala do `numeric` (`"30.00" → "30"`,
 *   `"27.50" → "27.5"`), ficando compatível com o default da prescrição e com
 *   `passoCarga` (1 casa decimal, sem `.0` supérfluo).
 * - `completed` propagado como veio (logs `completed === false` reidratam
 *   reps/carga mas NÃO contam como concluídos no posicionamento).
 *
 * Puro e testável — ponto único de coerção de reidratação.
 */
export function hidratarSerie(log: SerieLog): SerieHidratada {
  return {
    reps: log.reps_done == null ? '' : String(log.reps_done),
    carga: log.load_done == null ? '' : String(Number(log.load_done)),
    completed: log.completed,
  };
}

/**
 * Volume total das séries CONCLUÍDAS (`completed === true`): Σ reps×carga.
 *
 * Diferente de `volumeSessao` (que soma todas as séries registradas), este é o
 * volume "efetivamente levantado" exibido no resumo pós-treino. `reps_done` e
 * `load_done` são `numeric(6,2)` no Postgres e podem chegar como STRING em
 * runtime (apesar do tipo `number`), então coagimos cada fator com
 * `Number(x ?? 0)` — ponto único de coerção numérica do volume.
 */
export function volumeConcluido(logs: SerieLog[]): number {
  return logs.reduce((acc, log) => {
    if (!log.completed) return acc;
    return acc + Number(log.reps_done ?? 0) * Number(log.load_done ?? 0);
  }, 0);
}
