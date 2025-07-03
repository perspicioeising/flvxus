// components/workouts/detail/types/index.ts

import { Exercise, Workout } from "@/components/workouts/types";

export interface WorkoutDetailData extends Workout {
  notes?: string;
  workout_exercises: WorkoutExerciseDetail[];
}

export interface ExerciseProgress {
  id: string;
  student_id: string;
  workout_id: string;
  exercise_id: string;
  completed_sets: CompletedSet[];
  notes?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

// Série completada pelo aluno
export interface CompletedSet {
  set_number: number;
  actual_reps: number;
  actual_weight?: number;
  completed: boolean;
  notes?: string;
}
export interface CreateWorkoutRequest {
  name: string;
  description: string;
  level: string;
  goal: string;
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number;
    rest: number;
    sets_config: SetConfig[]; // Nova configuração
    general_notes?: string; // Novas observações
    order: number;
  }[];
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  workout_id: string;
  sets: number;
  reps: number;
  duration?: number;
  rest: number;
  notes?: string; // Mantido para compatibilidade
  general_notes?: string; // Novas observações gerais
  sets_config?: SetConfig[]; // Nova configuração de séries
  order: number;
  exercise: Exercise;
}

export interface SetConfig {
  set_number: number;
  target_reps: number;
  suggested_weight?: number;
  notes?: string;
}

// Interface atualizada para exercício selecionado
export interface SelectedExercise extends Exercise {
  sets: number; // Número total de séries
  reps: number; // Repetições padrão (para referência/compatibilidade)
  rest: number; // Tempo de descanso
  sets_config: SetConfig[]; // Configuração detalhada de cada série
  general_notes: string; // Observações gerais do exercício
  order: number;
}


export interface WorkoutExerciseDetail {
  sets_config?: SetConfig[];
  general_notes: any;
  id: string;
  exercise_id: string;
  workout_id: string;
  sets: number;
  reps: number;
  duration?: number;
  rest: number;
  notes?: string;
  order: number;
  exercise: Exercise;
}

export interface WorkoutStats {
  hasAdvancedConfiguration: boolean;
  totalReps: number;
  totalExercises: number;
  totalSets: number;
  estimatedDuration: number;
  averageRest: number;
  muscleGroups: string[];
  equipmentNeeded: string[];
}

// Component Props
export interface WorkoutDetailHeaderProps {
  workout: WorkoutDetailData;
  stats: WorkoutStats;
  userRole: string;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onStartWorkout?: () => void;
  isLoading?: boolean;
}

export interface WorkoutExerciseListProps {
  exercises: WorkoutExerciseDetail[];
  onExerciseView: (exercise: Exercise) => void;
  userRole: string;
}

export interface WorkoutExerciseCardProps {
  exercise: WorkoutExerciseDetail;
  index: number;
  onView: (exercise: Exercise) => void;
  userRole: string;
}

export interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface WorkoutStatsCardProps {
  stats: WorkoutStats;
  level: string;
  goal: string;
}

export interface WorkoutActionsProps {
  workout: WorkoutDetailData;
  userRole: string;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onStartWorkout?: () => void;
  isLoading?: boolean;
}

// Hook types
export interface UseWorkoutDetailReturn {
  workout: WorkoutDetailData | null;
  stats: WorkoutStats | null;
  isLoading: boolean;
  error: string | null;
  refreshWorkout: () => Promise<void>;
}

export interface UseWorkoutActionsReturn {
  isCloning: boolean;
  isDeleting: boolean;
  cloneWorkout: (workout: WorkoutDetailData) => Promise<void>;
  deleteWorkout: (workout: WorkoutDetailData) => Promise<void>;
}