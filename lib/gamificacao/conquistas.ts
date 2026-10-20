/**
 * Lógica PURA de gamificação para a tela do aluno (sem React/UI) — testável em
 * `tests/unit/gamificacao-conquistas.test.ts`.
 *
 * Importante: estas funções apenas RESUMEM o estado para exibição. A concessão
 * de conquistas acontece no banco, via trigger SECURITY DEFINER (ADR 0013) — a
 * app nunca insere em `user_achievements`.
 */

/** Conquista disponível no tenant (linha mínima de `achievements`). */
export interface ConquistaDisponivel {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  points: number;
}

/** Conquista já concedida ao aluno (linha mínima de `user_achievements`). */
export interface ConquistaObtida {
  achievement_id: string;
  earned_at: string;
}

/** Conquista com o estado de obtenção resolvido, para render na tela. */
export interface ConquistaResolvida extends ConquistaDisponivel {
  /** `true` quando o aluno já recebeu esta conquista. */
  obtida: boolean;
  /** Data de obtenção (ISO) ou `null` quando ainda não obtida. */
  earnedAt: string | null;
}

/** Agregação de conquistas obtidas vs disponíveis para a tela do aluno. */
export interface AgregacaoConquistas {
  /** Todas as conquistas do tenant com `obtida`/`earnedAt` resolvidos. */
  conquistas: ConquistaResolvida[];
  /** Quantidade de conquistas obtidas. */
  obtidas: number;
  /** Total de conquistas disponíveis no tenant. */
  total: number;
}

/**
 * Cruza as conquistas disponíveis do tenant com as obtidas pelo aluno,
 * resolvendo `obtida`/`earnedAt`. Mantém a ordem recebida em `disponiveis`.
 */
export function agregarConquistas(
  disponiveis: ConquistaDisponivel[],
  obtidas: ConquistaObtida[]
): AgregacaoConquistas {
  const porId = new Map<string, string>();
  for (const o of obtidas) {
    porId.set(o.achievement_id, o.earned_at);
  }

  const conquistas: ConquistaResolvida[] = disponiveis.map((c) => {
    const earnedAt = porId.get(c.id) ?? null;
    return { ...c, obtida: earnedAt !== null, earnedAt };
  });

  return {
    conquistas,
    obtidas: conquistas.filter((c) => c.obtida).length,
    total: conquistas.length,
  };
}

const MS_POR_DIA = 1000 * 60 * 60 * 24;

/** Converte um valor de data (ISO/Date) para o dia (meia-noite UTC) em ms. */
function diaEmMs(valor: string | Date): number | null {
  const data = valor instanceof Date ? valor : new Date(valor);
  const tempo = data.getTime();
  if (Number.isNaN(tempo)) {
    return null;
  }
  // Normaliza para o início do dia em UTC (coerente com o trigger, que usa
  // a data UTC de finished_at).
  return Math.floor(tempo / MS_POR_DIA) * MS_POR_DIA;
}

/**
 * Calcula a sequência atual de dias consecutivos de treino a partir das datas
 * de sessões concluídas (`finished_at`). A sequência termina HOJE ou ONTEM
 * (relativo a `referencia`): se o aluno não treinou hoje nem ontem, o streak é
 * 0. Datas inválidas/ausentes são ignoradas; dias repetidos contam uma vez.
 *
 * Espelha a semântica do trigger `award_points_on_session_finish` (dias em UTC),
 * mas aqui é só para exibir "sequência atual" na tela do aluno.
 */
export function calcularStreak(
  finishedAts: Array<string | null | undefined>,
  referencia: Date = new Date()
): number {
  const dias = new Set<number>();
  for (const f of finishedAts) {
    if (!f) {
      continue;
    }
    const dia = diaEmMs(f);
    if (dia !== null) {
      dias.add(dia);
    }
  }

  if (dias.size === 0) {
    return 0;
  }

  const hoje = diaEmMs(referencia);
  if (hoje === null) {
    return 0;
  }
  const ontem = hoje - MS_POR_DIA;

  // A sequência "atual" só vale se o último treino foi hoje ou ontem.
  let cursor: number;
  if (dias.has(hoje)) {
    cursor = hoje;
  } else if (dias.has(ontem)) {
    cursor = ontem;
  } else {
    return 0;
  }

  let streak = 0;
  while (dias.has(cursor)) {
    streak += 1;
    cursor -= MS_POR_DIA;
  }
  return streak;
}
