// components/my-workouts/types/index.ts

// Tipos unificados que funcionam com ambas as estruturas (API nova e componentes existentes)
export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  // Estrutura original (para componentes existentes)
  start_date: string;
  end_date: string | null;
  status?: string;
  // Estrutura nova da API (mapeada automaticamente)
  startDate?: string;
  endDate?: string | null;
  workouts?: Workout[];
  workout_plan_items?: WorkoutPlanItem[];
}

export interface WorkoutPlanItem {
  id: string;
  workout_id: string;
  day_of_week: number;
  workout: WorkoutFromPlan;
}

export interface WorkoutFromPlan {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  workout_exercises: WorkoutExercise[];
}

// Nova estrutura de Workout da API
export interface Workout {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  planId: string;
  planName: string;
  dayOfWeek: number;
  exercises: ExerciseFromWorkout[];
  duration: number;
}

export interface WorkoutExercise {
  id: string;
  sets: number;
  reps: number;
  duration?: number;
  rest: number;
  notes?: string;
  order: number;
  exercise: Exercise;
}

// Nova estrutura de Exercise da API
export interface ExerciseFromWorkout {
  id: string;
  exerciseId: string;
  name: string;
  description: string;
  videoUrl: string | null;
  audioUrl: string | null;
  muscleGroup: string[];
  equipment: string[];
  sets: number;
  reps: number | null;
  duration: number | null;
  rest: number;
  notes: string | null;
  order: number;
  tips: string[];
  commonErrors: string[];
  completed: boolean;
  completedSets: number;
  weight: number | null;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string[];
  equipment: string[];
  video_url?: string;
  audio_url?: string;
  variations?: string[];
  tips?: string[];
  common_errors?: string[];
}

export interface StudentStats {
  totalWorkouts: number;
  totalWeight: number;
  totalExercises: number;
  streak: number;
  weeklyWorkouts?: number;
  averageDuration?: number;
  thisWeekProgress?: number;
}

// Tipo unificado para WorkoutHistory (compatível com ambas estruturas)
export interface WorkoutHistory {
  id: string;
  workout_id: string;
  completed_at: string;
  duration: number;
  exercises_completed: number;
  total_weight: number;
  notes?: string | null; // Aceita tanto undefined quanto null
  workout: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface ExerciseProgress {
  exercise_id: string;
  sets_completed: number;
  weights: number[];
  reps: number[];
  difficulty_rating?: number;
  notes?: string;
  rest_time?: number;
}

export interface WorkoutSession {
  workout_id: string;
  plan_id: string;
  started_at: string;
  exercises: ExerciseProgress[];
  current_exercise_index: number;
  is_paused: boolean;
  total_duration: number;
}