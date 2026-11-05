/**
 * Mapeamento PURO rascunho-de-IA → linhas do banco (sem React/Supabase) —
 * testável em `tests/unit/ia/materializacao.test.ts`.
 *
 * Só na APROVAÇÃO (ver `actions/ia.ts`) estes mapeamentos são usados para
 * materializar o rascunho nas tabelas reais. A geração NUNCA materializa.
 *
 * As entradas aqui já são os drafts VALIDADOS pelos Zod de `schemas/ia/*`
 * (`GenerateDietOutput`, `SuggestWorkoutOutput`, `AnalyzeAssessmentOutput`).
 */

import type { GenerateDietOutput, DietMealFood } from '@/schemas/ia/generate-diet';
import type { SuggestWorkoutOutput } from '@/schemas/ia/suggest-workout';
import type { AnalyzeAssessmentOutput } from '@/schemas/ia/analyze-assessment';
import type { RotationStepInput } from '@/schemas/treino';
import type { GoalType } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Dieta
// -----------------------------------------------------------------------------

/** Membros válidos do enum `goal_type` (espelha `types/database.types.ts`). */
const GOAL_TYPES = [
  'weight_loss',
  'muscle_gain',
  'maintenance',
  'conditioning',
  'rehabilitation',
  'performance',
] as const satisfies readonly GoalType[];

/**
 * Normaliza `goal`/`restrictions` vindos de `ai_generations.input` para o que
 * cabe na linha `diets`:
 *   - `goal`: só preserva quando o valor é EXATAMENTE um membro de `goal_type`
 *     (o input costuma ser texto livre, que não bate com o enum → `null`);
 *   - `restrictions`: mantém apenas as strings de um array; qualquer outra
 *     coisa (ausente/não-array) vira `[]` (coluna `text[] not null default '{}'`).
 *
 * PURO — sem Supabase/React — para ficar coberto por teste sem mocks.
 */
export function normalizarGoalRestrictions(input: {
  goal?: unknown;
  restrictions?: unknown;
}): { goal: GoalType | null; restrictions: string[] } {
  const goal =
    typeof input.goal === 'string' && (GOAL_TYPES as readonly string[]).includes(input.goal)
      ? (input.goal as GoalType)
      : null;

  const restrictions = Array.isArray(input.restrictions)
    ? (input.restrictions as unknown[]).filter((r): r is string => typeof r === 'string')
    : [];

  return { goal, restrictions };
}

/** Linha de `diets` (sem id/tenant_id/student_id/trainer_id, carimbados no insert). */
export interface LinhaDieta {
  target_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Linha de `diet_meals` (sem id/diet_id). */
export interface LinhaRefeicao {
  name: string;
  time: string;
  order_index: number;
}

/** Linha de `diet_meal_foods` (sem id/meal_id). */
export interface LinhaAlimento {
  food_name: string;
  quantity: number;
  unit: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Refeição já pronta para materializar: a linha da refeição + seus alimentos. */
export interface RefeicaoMaterializavel {
  refeicao: LinhaRefeicao;
  alimentos: LinhaAlimento[];
}

/** Resultado do mapeamento de uma dieta: totais da dieta, refeições e lista de compras. */
export interface DietaMaterializavel {
  diet: LinhaDieta;
  refeicoes: RefeicaoMaterializavel[];
  shopping_list: string[];
}

/** Converte o draft de dieta em linhas prontas para inserir. */
export function mapearDietaParaLinhas(draft: GenerateDietOutput): DietaMaterializavel {
  const diet: LinhaDieta = {
    target_kcal: draft.totals.target_kcal,
    protein_g: draft.totals.protein_g,
    carbs_g: draft.totals.carbs_g,
    fat_g: draft.totals.fat_g,
  };

  // Ordena por order_index para garantir a ordem no banco mesmo se vier fora.
  const refeicoes: RefeicaoMaterializavel[] = [...draft.meals]
    .sort((a, b) => a.order_index - b.order_index)
    .map((meal) => ({
      refeicao: {
        name: meal.name,
        time: meal.time,
        order_index: meal.order_index,
      },
      alimentos: meal.foods.map((f: DietMealFood) => ({
        food_name: f.food_name,
        quantity: f.quantity,
        unit: f.unit,
        kcal: f.kcal,
        protein_g: f.protein_g,
        carbs_g: f.carbs_g,
        fat_g: f.fat_g,
      })),
    }));

  return { diet, refeicoes, shopping_list: [...draft.shopping_list] };
}

// -----------------------------------------------------------------------------
// Treino
// -----------------------------------------------------------------------------

/**
 * Linha de `workout_plan_items` (sem id/plan_id) — ESPELHO EXATO de
 * `itemFichaParaLinha` (ver `actions/treinos.ts`). Todos os campos opcionais da
 * prescrição "geral" são `null` quando ausentes (a série individual é a fonte
 * de verdade na execução; o item é apenas fallback).
 */
export interface LinhaItemTreino {
  exercise_id: string;
  weekday: number | null;
  division: string | null;
  order_index: number;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  target_load: number | null;
  notes: string | null;
}

/**
 * Linha de `workout_plan_item_sets` (sem id/plan_item_id) — mesma forma das
 * linhas produzidas por `linhasDeSeries` (ver `actions/treinos.ts`).
 */
export interface LinhaSerie {
  set_number: number;
  kind: string;
  note: string | null;
  target_reps: string | null;
  rest_seconds: number | null;
  target_load: number | null;
}

/** Passo da sequência de rotação (`workout_plans.rotation_steps`). */
export type PassoRotacao = RotationStepInput;

/** Item materializável: a linha do item + suas séries detalhadas. */
export interface ItemTreinoMaterializavel {
  item: LinhaItemTreino;
  series: LinhaSerie[];
}

/** Resultado do mapeamento de um treino v2 em linhas prontas para inserir. */
export interface TreinoMaterializavel {
  modo: 'por_dia' | 'por_divisao';
  rotation_steps: PassoRotacao[] | null;
  itens: ItemTreinoMaterializavel[];
}

/**
 * Converte o draft de treino v2 em linhas de `workout_plan_items` +
 * `workout_plan_item_sets`. PURO (sem Supabase/React).
 *
 * Resolve o modo pelo draft:
 *   - `rotation_steps` presente ⇒ POR DIVISÃO: `weekday = null` em todos os
 *     itens, `division = label`, `rotation_steps` preservado;
 *   - ausente/nulo ⇒ POR DIA: `weekday` = o da divisão, `division = label`,
 *     `rotation_steps = null`.
 * O campo do outro modo é sempre zerado (mutuamente exclusivos — o schema v2 já
 * garante a coerência).
 *
 * `order_index` é GLOBAL e contíguo (0..N-1) na ordem (divisão, exercício).
 * Cada série vira uma linha herdando `null` nos gerais ausentes.
 */
export function mapearTreinoV2ParaLinhas(draft: SuggestWorkoutOutput): TreinoMaterializavel {
  const rotation = draft.rotation_steps ?? null;
  const modo: 'por_dia' | 'por_divisao' = rotation ? 'por_divisao' : 'por_dia';

  const itens: ItemTreinoMaterializavel[] = [];
  let ordem = 0;

  for (const divisao of draft.divisions) {
    for (const ex of divisao.exercises) {
      const item: LinhaItemTreino = {
        exercise_id: ex.exercise_id,
        // POR DIVISÃO zera o weekday; POR DIA usa o da divisão.
        weekday: modo === 'por_divisao' ? null : divisao.weekday,
        division: divisao.label,
        order_index: ordem,
        sets: ex.sets ?? null,
        reps: ex.reps ?? null,
        rest_seconds: ex.rest_seconds ?? null,
        target_load: ex.target_load ?? null,
        notes: ex.notes ?? null,
      };

      const series: LinhaSerie[] = ex.series.map((serie) => ({
        set_number: serie.set_number,
        kind: serie.kind,
        note: serie.note ?? null,
        target_reps: serie.target_reps ?? null,
        rest_seconds: serie.rest_seconds ?? null,
        target_load: serie.target_load ?? null,
      }));

      itens.push({ item, series });
      ordem += 1;
    }
  }

  return {
    modo,
    // Zera o campo do modo oposto.
    rotation_steps: modo === 'por_divisao' ? rotation : null,
    itens,
  };
}

/**
 * Diff PURO de ids de exercício: dado o conjunto de ids exigidos pelo draft
 * (`exigidos`) e o conjunto de ids efetivamente encontrados no catálogo
 * (`encontrados`), devolve os ids FALTANTES (presentes no draft, ausentes do
 * catálogo). Comparação como conjunto: um id repetido em várias divisões conta
 * uma vez só.
 */
export function idsFaltantes(
  exigidos: Iterable<string>,
  encontrados: Iterable<string>
): string[] {
  const setEncontrados = new Set(encontrados);
  const faltantes = new Set<string>();
  for (const id of exigidos) {
    if (!setEncontrados.has(id)) faltantes.add(id);
  }
  return [...faltantes];
}

// -----------------------------------------------------------------------------
// Avaliação
// -----------------------------------------------------------------------------

/** Campos de `physical_assessments` atualizados pela aprovação da análise. */
export interface AtualizacaoAvaliacao {
  ai_analysis: { analysis: string; disclaimer: string };
  ai_recommendations: AnalyzeAssessmentOutput['recommendations'];
}

/** Converte o draft de análise nos campos jsonb da avaliação. */
export function mapearAnaliseParaAvaliacao(
  draft: AnalyzeAssessmentOutput
): AtualizacaoAvaliacao {
  return {
    ai_analysis: { analysis: draft.analysis, disclaimer: draft.disclaimer },
    ai_recommendations: draft.recommendations,
  };
}
