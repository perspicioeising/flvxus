// components/workouts/types/index.ts

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string[];
  equipment?: string[];
  variations?: string[];
  tips?: string[];
  common_errors?: string[];
  video_url?: string;
  audio_url?: string;
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

export interface SelectedExercise extends Exercise {
  sets: number;
  reps: number;
  rest: number;
  notes: string;
  order: number;
}

export interface WorkoutFormData {
  name: string;
  description: string;
  level: string;
  goal: string;
  exercises: SelectedExercise[];
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  level: string;
  goal: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  workout_exercises?: WorkoutExercise[];
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

export interface WorkoutStep {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
}

export interface ExerciseFilters {
  search: string;
  muscleGroup: string;
  equipment: string;
}

export interface WorkoutFilters {
  search: string;
  level: string;
  goal: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface WorkoutStats {
  total: number;
  totalExercises: number;
  avgExercisesPerWorkout: number;
  uniqueLevels: number;
  uniqueGoals: number;
  recentWorkouts: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
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

// Component Props Interfaces
export interface WorkoutFormHeaderProps {
  mode: 'create' | 'edit';
  currentStepData?: WorkoutStep;
  progressPercentage: number;
}

export interface WorkoutStepNavigationProps {
  steps: WorkoutStep[];
  activeStep: string;
  onStepChange: (step: string) => void;
  canAdvance: () => boolean;
}

export interface StepBasicInfoProps {
  formData: WorkoutFormData;
  onUpdateField: (field: keyof WorkoutFormData, value: any) => void;
  errors: Record<string, string>;
}

export interface StepGoalProps {
  selectedLevel: string;
  selectedGoal: string;
  onLevelSelect: (level: string) => void;
  onGoalSelect: (goal: string) => void;
}

export interface StepExercisesProps {
  exercises: Exercise[];
  selectedExercises: SelectedExercise[];
  filters: ExerciseFilters;
  onExerciseSelect: (exercise: Exercise) => void;
  onExerciseRemove: (exerciseId: string) => void;
  onExerciseUpdate: (exerciseId: string, field: keyof SelectedExercise, value: any) => void;
  onSetConfigUpdate: (exerciseId: string, setIndex: number, field: keyof SetConfig, value: any) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onFiltersChange: (filters: Partial<ExerciseFilters>) => void;
  isLoading: boolean;
}

export interface StepReviewProps {
  formData: WorkoutFormData;
  selectedExercises: SelectedExercise[];
  onSave: () => Promise<void>;
  isSaving: boolean;
  mode: 'create' | 'edit';
}

// ADICIONANDO AS INTERFACES FALTANTES PARA OS COMPONENTES DE LISTA

export interface WorkoutCardProps {
  workout: Workout;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onClone: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
}

export interface WorkoutEmptyStateProps {
  userRole: 'trainer' | 'student';
  hasFilters: boolean;
  onCreateNew: () => void;
}

export interface WorkoutFiltersProps {
  filters: WorkoutFilters;
  onFiltersChange: (filters: Partial<WorkoutFilters>) => void;
  onClearFilters: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export interface WorkoutHeaderProps {
  userRole: 'trainer' | 'student';
  stats: WorkoutStats;
  onCreateNew: () => void;
}

export interface WorkoutLoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export interface WorkoutPaginationInfoProps {
  currentCount: number;
  totalCount: number;
}

// Hook Return Types
export interface UseWorkoutFormReturn {
  // Form state
  formData: WorkoutFormData;
  selectedExercises: SelectedExercise[];
  activeStep: string;
  errors: Record<string, string>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  setActiveStep: (step: string) => void;
  updateFormField: (field: keyof WorkoutFormData, value: any) => void;
  handleExerciseSelect: (exercise: Exercise) => void;
  handleExerciseRemove: (exerciseId: string) => void;
  handleExerciseUpdate: (exerciseId: string, field: keyof SelectedExercise, value: any) => void;
  saveWorkout: () => Promise<void>;
  
  // Validations
  canAdvanceStep: () => boolean;
  validateStep: (step: string) => boolean;
}

export interface UseExerciseLibraryReturn {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  filters: ExerciseFilters;
  isLoading: boolean;
  updateFilters: (filters: Partial<ExerciseFilters>) => void;
  refreshExercises: () => Promise<void>;
}

export interface UseWorkoutListReturn {
  workouts: Workout[];
  isLoading: boolean;
  isLoadingMore: boolean;
  stats: WorkoutStats;
  filters: WorkoutFilters;
  pagination: PaginationData & { hasMore: boolean };
  viewMode: 'grid' | 'list';
  updateFilters: (filters: Partial<WorkoutFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  refreshWorkouts: () => Promise<void>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  loadMore: () => Promise<void>;
}

export interface UseWorkoutOperationsReturn {
  createWorkout: (data: CreateWorkoutRequest) => Promise<Workout>;
  updateWorkout: (id: string, data: Partial<CreateWorkoutRequest>) => Promise<Workout>;
  deleteWorkout: (id: string, name: string) => Promise<void>;
  cloneWorkout: (workout: Workout) => Promise<Workout>;
  getWorkout: (id: string) => Promise<Workout>;
  isLoading: boolean;
}