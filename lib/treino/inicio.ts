/**
 * Lógica PURA do "próximo treino" de uma ficha para a tela de início do aluno
 * (sem UI, sem Supabase). Deriva, para cada ficha liberada, qual treino aparece
 * no cartão: a primeira divisão (ficha por divisão) ou o treino do dia de hoje
 * (ficha legada por dia). Testável em tests/unit/treino-inicio.test.ts.
 */

import { agruparPorDivisao, DIVISAO_SEM } from '@/lib/divisao';
import { weekdayAtual } from '@/lib/semana';

/** Exercício resumido para o cartão de "próximo treino". */
export interface ExercicioHojeDados {
  id: string;
  nome: string;
  sets: number | null;
  reps: string | null;
}

/** Item de ficha com os campos usados pela derivação. */
export interface ItemFichaInicio {
  id: string;
  weekday: number | null;
  division: string | null;
  order_index: number;
  sets: number | null;
  reps: string | null;
  /** Join `exercises` (array ou objeto), do qual extraímos nome e grupos. */
  exercises: unknown;
}

/** Uma ficha liberada com seus itens. */
export interface FichaInicio {
  id: string;
  name: string;
  workout_plan_items: ItemFichaInicio[] | null;
}

/** "Próximo treino" derivado de uma ficha. */
export interface ProximoTreino {
  /** Letra da divisão (ex.: 'A') ou `null` (balde sem divisão / legado). */
  divisionLabel: string | null;
  /** Grupos musculares (união dos grupos dos exercícios do treino). */
  grupos: string[];
  /** Exercícios prescritos do treino, ordenados por `order_index`. */
  exercicios: ExercicioHojeDados[];
  /** Deep-link do CTA, com o eixo explícito (`?divisao=`/`?dia=`). */
  href: string;
}

/**
 * Decide a PRÓXIMA divisão na rotação a partir dos rótulos da ficha (na ordem
 * em que `agruparPorDivisao` já os entrega: pt-BR) e do rótulo da ÚLTIMA divisão
 * CONCLUÍDA (`division` da última `workout_sessions` finalizada, ou `null` se não
 * houver histórico). Função PURA (sem I/O) para ser testável.
 *
 * Regra:
 * - lista vazia → `null` (sem divisões para rodar);
 * - sem histórico (`ultimaConcluida === null`) → a primeira divisão (preserva o
 *   comportamento de aluno novo: começa no A);
 * - com histórico → a divisão SEGUINTE à última concluída, com wrap-around
 *   (`(idx + 1) % n`), caindo na primeira depois da última (ciclo A→B→C→A);
 * - se a última concluída NÃO existe mais na ficha (ficha reeditada) → fallback
 *   na primeira divisão.
 *
 * Observação: com uma única divisão, `(0 + 1) % 1 === 0` → sempre ela mesma.
 * A ordem usada é a REAL dos rótulos da ficha; não assume alfabeto fixo A/B/C.
 */
export function proximaDivisaoNaRotacao(
  divisoes: string[],
  ultimaConcluida: string | null
): string | null {
  if (divisoes.length === 0) return null;
  if (ultimaConcluida === null) return divisoes[0];
  const idx = divisoes.indexOf(ultimaConcluida);
  // Última divisão não existe mais na ficha → fallback na primeira.
  if (idx === -1) return divisoes[0];
  return divisoes[(idx + 1) % divisoes.length];
}

/** Extrai nome e grupos musculares de um join `exercises` (array ou objeto). */
function infoExercicio(exercises: unknown): { nome: string; grupos: string[] } {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const nome = (e as { name: string | null } | null)?.name;
  const grupos = (e as { muscle_groups: string[] | null } | null)?.muscle_groups;
  return {
    nome: nome?.trim() || 'Exercício',
    grupos: Array.isArray(grupos) ? grupos : [],
  };
}

/**
 * Resolve o "próximo treino" de UMA ficha. Dois ramos distintos:
 *
 * - Ficha POR DIVISÃO (qualquer item com `division` não-nula) → avança pela
 *   ROTAÇÃO: a divisão SEGUINTE à última concluída (`ultimaConcluida`), com
 *   wrap-around (A→B→C→A). Sem histórico → primeira divisão. Monta `?divisao=`
 *   (sentinela `__sem__` no balde sem divisão). Nunca retorna `null`.
 *
 * - Ficha LEGADA POR DIA (nenhuma divisão) → itens do weekday atual, com
 *   `?dia=N`. `ultimaConcluida` é IGNORADA neste ramo (comportamento por dia
 *   preservado byte-a-byte). Retorna `null` quando NÃO há treino para hoje — a
 *   UI então mostra o cartão "sem treino para hoje", nunca ocultando a ficha
 *   (MEDIUM #2).
 *
 * `ultimaConcluida` identifica a última `workout_sessions` finalizada desta
 * ficha (a page faz a leitura sob RLS e repassa):
 * - `undefined` → NÃO há histórico (ou ficha por dia) → começa na primeira;
 * - `null`      → a última sessão concluída foi o balde SEM divisão;
 * - `'A'`…      → a última divisão concluída foi esse rótulo.
 *
 * `referencia` permite testar o dia de hoje de forma determinística.
 */
export function proximoTreinoDaFicha(
  ficha: FichaInicio,
  referencia: Date = new Date(),
  ultimaConcluida: string | null | undefined = undefined
): ProximoTreino | null {
  const itens = ficha.workout_plan_items ?? [];
  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

  let itensTreino: ItemFichaInicio[] = [];
  let divisionLabel: string | null = null;

  if (porDivisao) {
    // Ramo POR DIVISÃO: rotaciona a partir da última divisão concluída.
    const grupos = agruparPorDivisao(itens, (item) => item.division ?? null);
    // Rótulos na ordem real da ficha (pt-BR + balde sem divisão por último).
    const rotulos = grupos.map((g) => g.division ?? DIVISAO_SEM);
    // Normaliza o histórico para o espaço de rótulos: sem histórico → null
    // (primeira divisão); sessão sem divisão (`null`) → sentinela do balde.
    const referenciaRotacao =
      ultimaConcluida === undefined
        ? null
        : ultimaConcluida === null
          ? DIVISAO_SEM
          : ultimaConcluida;
    const proximoRotulo = proximaDivisaoNaRotacao(rotulos, referenciaRotacao);
    const escolhido =
      proximoRotulo !== null
        ? grupos.find((g) => (g.division ?? DIVISAO_SEM) === proximoRotulo)
        : undefined;
    const primeiro = escolhido ?? grupos[0];
    if (primeiro) {
      itensTreino = primeiro.itens;
      divisionLabel = primeiro.division;
    }
  } else {
    const weekday = weekdayAtual(referencia);
    itensTreino = itens.filter((item) => item.weekday === weekday);
    if (itensTreino.length === 0) return null;
  }

  const itensOrdenados = [...itensTreino].sort(
    (a, b) => a.order_index - b.order_index
  );

  const exercicios: ExercicioHojeDados[] = itensOrdenados.map((item) => ({
    id: item.id,
    nome: infoExercicio(item.exercises).nome,
    sets: item.sets,
    reps: item.reps,
  }));

  const grupos = Array.from(
    new Set(itensOrdenados.flatMap((item) => infoExercicio(item.exercises).grupos))
  );

  let href = `/aluno/treinos/${ficha.id}`;
  if (exercicios.length > 0) {
    if (porDivisao) {
      const eixo = divisionLabel ?? DIVISAO_SEM;
      href = `/aluno/execucao/${ficha.id}?divisao=${encodeURIComponent(eixo)}`;
    } else {
      href = `/aluno/execucao/${ficha.id}?dia=${weekdayAtual(referencia)}`;
    }
  }

  return { divisionLabel, grupos, exercicios, href };
}
