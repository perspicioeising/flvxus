import { z } from 'zod';

/**
 * Schema de saída da IA para `suggest_workout` (Edge Function `suggest-workout`).
 *
 * PURO: só `zod`. Nenhuma API só-Deno.
 *
 * Campos alinhados a architecture.md §6.2 (`workout_plan_items`):
 * `weekday`, `order_index`, `sets`, `reps` (string, ex.: "8-12"),
 * `rest_seconds`, `notes`.
 */

// Dia da semana: inteiro 0 (domingo) .. 6 (sábado), como em workout_plan_items.weekday.
const weekday = z
  .number({ invalid_type_error: 'weekday deve ser numérico.' })
  .int('weekday deve ser inteiro.')
  .min(0, 'weekday mínimo é 0 (domingo).')
  .max(6, 'weekday máximo é 6 (sábado).');

/** Um exercício prescrito num dia (`workout_plan_items`). */
export const workoutExerciseSchema = z.object({
  name: z.string().min(1, 'Nome do exercício é obrigatório.'),
  sets: z.number().int('sets deve ser inteiro.').positive('sets deve ser positivo.'),
  // `workout_plan_items.reps` é texto (ex.: "8-12", "até a falha").
  reps: z.string().min(1, 'reps é obrigatório.'),
  rest_seconds: z
    .number({ invalid_type_error: 'rest_seconds deve ser numérico.' })
    .int('rest_seconds deve ser inteiro.')
    .nonnegative('rest_seconds não pode ser negativo.'),
  notes: z.string().nullable().optional(),
});

/** Um dia de treino com seus exercícios. */
export const workoutDaySchema = z.object({
  weekday,
  // Rótulo do dia/divisão (ex.: "Treino A — Peito e Tríceps"); opcional.
  label: z.string().min(1).nullable().optional(),
  exercises: z.array(workoutExerciseSchema).min(1, 'O dia precisa de ao menos um exercício.'),
});

/** Saída completa da sugestão de treino. */
export const suggestWorkoutOutputSchema = z.object({
  days: z.array(workoutDaySchema).min(1, 'O plano precisa de ao menos um dia.'),
  // Aviso de rascunho / não substitui profissional (ADR 0001 §6).
  disclaimer: z.string().min(1, 'O aviso é obrigatório.'),
});

export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;
export type WorkoutDay = z.infer<typeof workoutDaySchema>;
export type SuggestWorkoutOutput = z.infer<typeof suggestWorkoutOutputSchema>;
