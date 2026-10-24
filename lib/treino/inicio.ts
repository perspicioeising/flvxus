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
 * Resolve o "próximo treino" de UMA ficha. Ficha por divisão → primeira divisão
 * (pt-BR), com `?divisao=` (sentinela `__sem__` no balde sem divisão). Ficha
 * legada por dia → itens do weekday atual, com `?dia=N`. Retorna `null` quando
 * a ficha é legada e NÃO tem treino para hoje — a UI então mostra o cartão
 * "sem treino para hoje", nunca ocultando a ficha (MEDIUM #2).
 *
 * `referencia` permite testar o dia de hoje de forma determinística.
 */
export function proximoTreinoDaFicha(
  ficha: FichaInicio,
  referencia: Date = new Date()
): ProximoTreino | null {
  const itens = ficha.workout_plan_items ?? [];
  const porDivisao = itens.some((item) => (item.division ?? null) !== null);

  let itensTreino: ItemFichaInicio[] = [];
  let divisionLabel: string | null = null;

  if (porDivisao) {
    const grupos = agruparPorDivisao(itens, (item) => item.division ?? null);
    const primeiro = grupos[0];
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
