/**
 * Detecção PURA de PR / progressão de carga — testável em
 * `tests/unit/arena-pr.test.ts`. Espelha o SQL
 * `gamification_check_prs_for_session(p_session_id)`.
 *
 * Definição (decisão HIGH-4): compara a MELHOR série `completed` da sessão
 * corrente, para um exercício, contra o HISTÓRICO do próprio aluno (séries
 * `completed` de sessões já finalizadas, EXCLUINDO a sessão corrente). Há PR
 * quando ocorre QUALQUER um:
 *   - PR de carga: maior `load_done` da sessão > maior `load_done` histórico.
 *   - PR de volume: maior `load_done * reps_done` da sessão > maior histórico.
 *
 * Antifraude (fecho da sessão, nunca bloqueia o registro da série):
 *   - só séries `completed = true` entram na comparação;
 *   - `load_done > 0`;
 *   - `reps_done` inteiro em `1..100`;
 *   - carga implausível (`load_done > 3x` o recorde de carga anterior) NÃO
 *     premia (série inválida descartada).
 */

/** Uma série de treino (linha mínima de `workout_set_logs`). */
export interface SeriePR {
  /** Carga executada (kg). Série inválida/antifraude se `<= 0`. */
  load_done: number | null;
  /** Repetições executadas. Válida se inteiro `1..100`. */
  reps_done: number | null;
  /** `true` quando a série foi efetivamente concluída. */
  completed: boolean;
}

/** Resultado da avaliação de PR para um exercício numa sessão. */
export interface ResultadoPR {
  /** `true` quando qualquer tipo de PR foi detectado e premiável. */
  premia: boolean;
  /** `true` quando a maior carga da sessão supera o recorde histórico. */
  prCarga: boolean;
  /** `true` quando o maior volume (carga*reps) supera o recorde histórico. */
  prVolume: boolean;
}

const SEM_PR: ResultadoPR = { premia: false, prCarga: false, prVolume: false };

/** Multiplicador máximo de carga plausível sobre o recorde anterior. */
const FATOR_IMPLAUSIVEL = 3;

/** Uma série é válida para comparação (completed, carga>0, reps inteiro 1..100). */
function serieValida(s: SeriePR): s is SeriePR & { load_done: number; reps_done: number } {
  if (!s.completed) {
    return false;
  }
  const carga = s.load_done;
  const reps = s.reps_done;
  if (carga === null || reps === null) {
    return false;
  }
  if (!(carga > 0)) {
    return false;
  }
  if (!Number.isInteger(reps) || reps < 1 || reps > 100) {
    return false;
  }
  return true;
}

/**
 * Avalia se a sessão corrente bate um PR de carga e/ou volume para um exercício,
 * comparando suas séries `completed` contra o histórico do próprio aluno.
 *
 * @param seriesSessao Séries do exercício NA sessão corrente.
 * @param seriesHistorico Séries do exercício no histórico (sessões anteriores
 *   finalizadas, já EXCLUINDO a sessão corrente).
 */
export function detectarPR(
  seriesSessao: SeriePR[],
  seriesHistorico: SeriePR[]
): ResultadoPR {
  const atuais = seriesSessao.filter(serieValida);
  if (atuais.length === 0) {
    return SEM_PR;
  }

  const historicas = seriesHistorico.filter(serieValida);

  const maiorCargaHist = historicas.reduce(
    (max, s) => Math.max(max, s.load_done),
    0
  );
  const maiorVolumeHist = historicas.reduce(
    (max, s) => Math.max(max, s.load_done * s.reps_done),
    0
  );

  // Antifraude: carga implausível (> 3x o recorde anterior) descarta a série.
  // Só aplica quando já existe recorde de carga (há histórico).
  const plausiveis =
    maiorCargaHist > 0
      ? atuais.filter((s) => s.load_done <= maiorCargaHist * FATOR_IMPLAUSIVEL)
      : atuais;

  if (plausiveis.length === 0) {
    return SEM_PR;
  }

  const maiorCargaSessao = plausiveis.reduce(
    (max, s) => Math.max(max, s.load_done),
    0
  );
  const maiorVolumeSessao = plausiveis.reduce(
    (max, s) => Math.max(max, s.load_done * s.reps_done),
    0
  );

  const prCarga = maiorCargaSessao > maiorCargaHist;
  const prVolume = maiorVolumeSessao > maiorVolumeHist;

  return { premia: prCarga || prVolume, prCarga, prVolume };
}
