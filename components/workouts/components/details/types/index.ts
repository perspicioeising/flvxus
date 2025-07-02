// components/workouts/detail/types/index.ts

import { Exercise, Workout } from "@/components/workouts/types";

export interface WorkoutDetailData extends Workout {
  notes: any;
  workout_exercises: WorkoutExerciseDetail[];
}

export interface WorkoutExerciseDetail {
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