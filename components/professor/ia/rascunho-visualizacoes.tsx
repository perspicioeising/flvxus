'use client';

import type { GenerateDietOutput, DietMeal, DietMealFood } from '@/schemas/ia/generate-diet';
import type {
  SuggestWorkoutOutput,
  WorkoutDay,
  WorkoutExercise,
} from '@/schemas/ia/suggest-workout';
import type {
  AnalyzeAssessmentOutput,
  AssessmentRecommendation,
} from '@/schemas/ia/analyze-assessment';
import { WEEKDAY_LABEL } from '@/lib/semana';

/**
 * Visualizações (read-only) dos rascunhos de IA para a tela de revisão.
 * São puramente apresentacionais — a aprovação/edição fica em
 * `RevisaoRascunho`.
 */

export function RascunhoDieta({ draft }: { draft: GenerateDietOutput }) {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Total rotulo="Meta kcal" valor={`${draft.totals.target_kcal}`} />
        <Total rotulo="Proteína" valor={`${draft.totals.protein_g} g`} />
        <Total rotulo="Carboidrato" valor={`${draft.totals.carbs_g} g`} />
        <Total rotulo="Gordura" valor={`${draft.totals.fat_g} g`} />
      </dl>

      <ul className="space-y-3">
        {draft.meals.map((meal: DietMeal, i: number) => (
          <li key={`${meal.name}-${i}`} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{meal.name}</span>
              <span className="text-xs text-muted-foreground">{meal.time}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {meal.foods.map((f: DietMealFood, j: number) => (
                <li key={`${f.food_name}-${j}`} className="text-sm text-muted-foreground">
                  {f.food_name} — {f.quantity} {f.unit} · {f.kcal} kcal
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {draft.shopping_list.length > 0 ? (
        <div>
          <h3 className="mb-1 text-sm font-medium text-foreground">Lista de compras</h3>
          <p className="text-sm text-muted-foreground">{draft.shopping_list.join(', ')}</p>
        </div>
      ) : null}

      <p className="text-xs italic text-muted-foreground">{draft.disclaimer}</p>
    </div>
  );
}

export function RascunhoTreino({ draft }: { draft: SuggestWorkoutOutput }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {draft.days.map((dia: WorkoutDay, i: number) => (
          <li key={`${dia.weekday}-${i}`} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {dia.label ?? WEEKDAY_LABEL[dia.weekday] ?? 'Dia'}
              </span>
              <span className="text-xs text-muted-foreground">
                {WEEKDAY_LABEL[dia.weekday] ?? ''}
              </span>
            </div>
            <ul className="mt-2 space-y-1">
              {dia.exercises.map((ex: WorkoutExercise, j: number) => (
                <li key={`${ex.name}-${j}`} className="text-sm text-muted-foreground">
                  {ex.name} — {ex.sets}x{ex.reps} · descanso {ex.rest_seconds}s
                  {ex.notes ? ` · ${ex.notes}` : ''}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="text-xs italic text-muted-foreground">{draft.disclaimer}</p>
    </div>
  );
}

export function RascunhoAnalise({ draft }: { draft: AnalyzeAssessmentOutput }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="mb-1 text-sm font-medium text-foreground">Análise</h3>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{draft.analysis}</p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium text-foreground">Recomendações</h3>
        <ul className="space-y-1">
          {draft.recommendations.map((r: AssessmentRecommendation, i: number) => (
            <li key={`${r.category}-${i}`} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{r.category}</span> ({r.priority}):{' '}
              {r.text}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs italic text-muted-foreground">{draft.disclaimer}</p>
    </div>
  );
}

function Total({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium text-foreground">{valor}</dd>
    </div>
  );
}
