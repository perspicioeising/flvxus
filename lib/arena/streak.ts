/**
 * Streak de consistência (aderência ao plano) — função PURA (sem I/O),
 * testável em `tests/unit/arena-streak.test.ts`. Espelha o SQL de
 * `gamification_recalc_streak(p_user)`.
 *
 * Modelo (decisão HIGH-2): a streak NÃO decide "treino vs. descanso" por dia;
 * ela é derivada da SEQUÊNCIA de EVENTOS DE ADERÊNCIA. Um evento de aderência
 * num dia-SP é:
 *   - uma `workout_sessions` finalizada com >=1 série `completed = true`
 *     (treino cumprido), OU
 *   - um `workout_plan_rest_completions` (descanso programado cumprido).
 *
 * Algoritmo:
 *   1. Coleta os dias-SP (via `diaSP`) com ao menos um evento de aderência.
 *   2. Caminhando de hoje-SP para trás, conta dias consecutivos com evento.
 *      Como o próprio descanso é evento de aderência, um dia de descanso
 *      cumprido MANTÉM a streak (RF9.2).
 *   3. Quebra no primeiro GAP (dia-SP sem nenhum evento de aderência) — faltar
 *      a um dia de treino sem registrar descanso quebra (RF9.3).
 *   4. O dia CORRENTE sem evento NÃO quebra: a streak "congela" e começa a
 *      contagem a partir de ontem.
 *
 * Bordas: múltiplas sessões ou descanso+sessão no mesmo dia-SP contam como UM
 * dia; o fuso SP (via `diaSP`) evita que um treino às 23h30 "pule" para o dia
 * UTC seguinte (critério de aceite 17).
 */

import { diaSP } from '@/lib/arena/datas';

/** Um evento de aderência bruto (instante da sessão concluída ou do descanso). */
export type EventoAderencia = Date | string;

/** Resultado da streak de aderência para leitura barata na Arena/resumo. */
export interface ResultadoStreak {
  /** Sequência atual de dias-SP consecutivos com aderência. */
  current_streak: number;
  /** Maior sequência de dias-SP consecutivos já observada no histórico. */
  longest_streak: number;
}

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/** Avança/retrocede um dia-SP (`YYYY-MM-DD`) por `delta` dias de calendário. */
function somarDias(dia: string, delta: number): string {
  // Interpretar como meio-dia UTC evita que o ajuste de DST empurre a data
  // para o dia anterior/seguinte; só precisamos do calendário, não do fuso.
  const base = new Date(`${dia}T12:00:00.000Z`).getTime() + delta * UM_DIA_MS;
  const resultado = diaSP(new Date(base));
  // `diaSP` de um instante ao meio-dia UTC coincide com o dia de calendário.
  return resultado ?? dia;
}

/**
 * Calcula `current_streak` e `longest_streak` a partir dos eventos de aderência
 * (instantes de sessões concluídas e de descansos cumpridos). Datas inválidas
 * são ignoradas; eventos no mesmo dia-SP contam uma vez. `referencia` é "agora"
 * (hoje-SP); padrão: o momento atual.
 */
export function calcularStreakAderencia(
  eventos: Array<EventoAderencia | null | undefined>,
  referencia: Date | string = new Date()
): ResultadoStreak {
  const dias = new Set<string>();
  for (const evento of eventos) {
    if (!evento) {
      continue;
    }
    const dia = diaSP(evento);
    if (dia !== null) {
      dias.add(dia);
    }
  }

  if (dias.size === 0) {
    return { current_streak: 0, longest_streak: 0 };
  }

  const hoje = diaSP(referencia);
  const current_streak = hoje === null ? 0 : contarStreakAtual(dias, hoje);
  const longest_streak = Math.max(
    maiorSequencia(dias),
    current_streak
  );

  return { current_streak, longest_streak };
}

/**
 * Conta a streak atual: começa em hoje-SP (se tem evento) ou, se hoje não tem,
 * começa em ontem (dia corrente congela, não quebra). Caminha para trás até o
 * primeiro gap.
 */
function contarStreakAtual(dias: Set<string>, hoje: string): number {
  let cursor: string;
  if (dias.has(hoje)) {
    cursor = hoje;
  } else {
    // Dia corrente sem evento não quebra: tenta a partir de ontem.
    cursor = somarDias(hoje, -1);
    if (!dias.has(cursor)) {
      return 0;
    }
  }

  let streak = 0;
  while (dias.has(cursor)) {
    streak += 1;
    cursor = somarDias(cursor, -1);
  }
  return streak;
}

/** Maior sequência de dias-SP consecutivos presente no conjunto. */
function maiorSequencia(dias: Set<string>): number {
  let maior = 0;
  for (const dia of dias) {
    // Só começa a contar em inícios de sequência (sem o dia anterior).
    if (dias.has(somarDias(dia, -1))) {
      continue;
    }
    let comprimento = 0;
    let cursor = dia;
    while (dias.has(cursor)) {
      comprimento += 1;
      cursor = somarDias(cursor, 1);
    }
    if (comprimento > maior) {
      maior = comprimento;
    }
  }
  return maior;
}
