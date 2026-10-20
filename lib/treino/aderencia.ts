/**
 * Cálculo PURO de aderência de treino (sem React/UI) — testável em
 * `tests/unit/aderencia.test.ts`. Resume as sessões concluídas do aluno
 * (`workout_sessions` com `finished_at`) para a tela de evolução.
 */

/** Linha mínima de sessão para o resumo de aderência. */
export interface SessaoAderencia {
  finished_at: string | null;
}

/** Resumo de sessões concluídas dentro de uma janela de dias. */
export interface ResumoAderencia {
  /** Sessões concluídas (finished_at não nulo) no total recebido. */
  concluidasTotal: number;
  /** Sessões concluídas dentro da janela `dias`. */
  concluidasPeriodo: number;
  /** Janela usada (em dias), para rótulo na UI. */
  dias: number;
}

/**
 * Conta sessões concluídas no total e dentro dos últimos `dias` (padrão 30),
 * relativo a `referencia` (padrão: agora). Sessões sem `finished_at` ou com
 * data inválida são ignoradas.
 */
export function resumoAderencia(
  sessoes: SessaoAderencia[],
  dias: number = 30,
  referencia: Date = new Date()
): ResumoAderencia {
  const limite = referencia.getTime() - dias * 24 * 60 * 60 * 1000;
  let concluidasTotal = 0;
  let concluidasPeriodo = 0;

  for (const sessao of sessoes) {
    if (!sessao.finished_at) {
      continue;
    }
    const tempo = new Date(sessao.finished_at).getTime();
    if (Number.isNaN(tempo)) {
      continue;
    }
    concluidasTotal += 1;
    if (tempo >= limite && tempo <= referencia.getTime()) {
      concluidasPeriodo += 1;
    }
  }

  return { concluidasTotal, concluidasPeriodo, dias };
}
