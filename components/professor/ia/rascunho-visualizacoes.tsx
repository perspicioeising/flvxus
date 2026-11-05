'use client';

import type { GenerateDietOutput, DietMeal, DietMealFood } from '@/schemas/ia/generate-diet';
import type {
  SuggestWorkoutOutput,
  WorkoutDivision,
  WorkoutExerciseV2,
  WorkoutSeries,
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

/** Rótulo pt-BR do tipo de série (warmup/adaptation/work são as únicas saídas da IA). */
const KIND_LABEL: Record<string, string> = {
  warmup: 'Aquecimento',
  adaptation: 'Adaptação',
  work: 'Trabalho',
};

/** Descreve a prescrição de uma série individual, pulando os campos vazios. */
function descricaoSerie(serie: WorkoutSeries): string {
  const partes: string[] = [];
  partes.push(KIND_LABEL[serie.kind] ?? serie.kind);
  if (serie.target_reps) partes.push(`${serie.target_reps} reps`);
  if (serie.target_load !== null) partes.push(`${serie.target_load} kg`);
  if (serie.rest_seconds !== null) partes.push(`descanso ${serie.rest_seconds}s`);
  if (serie.note) partes.push(serie.note);
  return partes.join(' · ');
}

export function RascunhoTreino({ draft }: { draft: SuggestWorkoutOutput }) {
  // Dias de descanso: usa `rest_days` quando informado; senão, no modo POR DIA
  // (todas as divisões com weekday), deriva os 0..6 não cobertos por divisão.
  const diasComTreino = new Set(
    draft.divisions
      .map((d) => d.weekday)
      .filter((w): w is number => w !== null)
  );
  const porDia = draft.divisions.length > 0 && draft.divisions.every((d) => d.weekday !== null);
  const diasDescanso =
    draft.rest_days && draft.rest_days.length > 0
      ? [...new Set(draft.rest_days)].sort((a, b) => a - b)
      : porDia
        ? [0, 1, 2, 3, 4, 5, 6].filter((w) => !diasComTreino.has(w))
        : [];

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {draft.divisions.map((divisao: WorkoutDivision, i: number) => (
          <li key={`${divisao.label}-${i}`} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{divisao.label}</span>
              {divisao.weekday !== null ? (
                <span className="text-xs text-muted-foreground">
                  {WEEKDAY_LABEL[divisao.weekday] ?? ''}
                </span>
              ) : null}
            </div>
            <ul className="mt-2 space-y-2">
              {divisao.exercises.map((ex: WorkoutExerciseV2, j: number) => (
                <li key={`${ex.exercise_id}-${j}`} className="text-sm">
                  <span className="font-medium text-foreground">
                    {ex.exercise_name ?? ex.exercise_id}
                  </span>
                  <ol className="mt-1 space-y-0.5 pl-4">
                    {ex.series.map((serie: WorkoutSeries) => (
                      <li
                        key={serie.set_number}
                        className="list-decimal text-xs text-muted-foreground"
                      >
                        Série {serie.set_number} — {descricaoSerie(serie)}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {diasDescanso.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dias de descanso:</span>{' '}
          {diasDescanso.map((w) => WEEKDAY_LABEL[w]).join(', ')}
        </p>
      ) : null}

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
