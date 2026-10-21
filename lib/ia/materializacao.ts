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

/** Linha de `workout_plan_items` (sem id/plan_id). */
export interface LinhaItemTreino {
  exercise_id: string;
  weekday: number;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
}

/**
 * Resolve o nome de um exercício para um `exercise_id` existente.
 * Deve devolver `null` quando não houver correspondência (o chamador então
 * cria o exercício no tenant e tenta de novo). PURO em relação ao mapeamento:
 * a impureza (lookup no banco) fica na action.
 */
export type ResolverExercicio = (nome: string) => string | null;

/**
 * Converte o draft de treino em linhas de `workout_plan_items`, resolvendo
 * cada exercício pelo nome. `order_index` é global e incremental na ordem
 * (dia, exercício). Lança se algum nome não resolver — o chamador garante que
 * todos os nomes foram resolvidos/criados antes.
 */
export function mapearTreinoParaItens(
  draft: SuggestWorkoutOutput,
  resolver: ResolverExercicio
): LinhaItemTreino[] {
  const itens: LinhaItemTreino[] = [];
  let ordem = 0;

  const dias = [...draft.days].sort((a, b) => a.weekday - b.weekday);
  for (const dia of dias) {
    for (const ex of dia.exercises) {
      const exerciseId = resolver(ex.name);
      if (!exerciseId) {
        throw new Error(`Exercício não resolvido: ${ex.name}`);
      }
      itens.push({
        exercise_id: exerciseId,
        weekday: dia.weekday,
        order_index: ordem,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes ?? null,
      });
      ordem += 1;
    }
  }

  return itens;
}

/** Lista única (case-insensitive, preservando a 1ª grafia) de nomes de exercícios do draft. */
export function nomesDeExerciciosDoTreino(draft: SuggestWorkoutOutput): string[] {
  const vistos = new Map<string, string>();
  for (const dia of draft.days) {
    for (const ex of dia.exercises) {
      const chave = ex.name.trim().toLowerCase();
      if (!vistos.has(chave)) {
        vistos.set(chave, ex.name.trim());
      }
    }
  }
  return [...vistos.values()];
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
