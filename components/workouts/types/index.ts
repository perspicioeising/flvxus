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

export interface WorkoutExercise {
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

export interface SelectedExercise extends Exercise {
  sets: number;
  reps: number;
  rest: number;
  notes: string;
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

export interface WorkoutFormData {
  name: string;
  description: string;
  level: string;
  goal: string;
  exercises: SelectedExercise[];
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WorkoutListResponse {
  workouts: Workout[];
  pagination: PaginationData;
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
    notes?: string;
    order: number;
  }[];
}

export interface WorkoutCardProps {
  workout: Workout;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onClone: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
}

export interface WorkoutHeaderProps {
  userRole: string;
  stats: WorkoutStats;
  onCreateNew: () => void;
}

export interface WorkoutFiltersProps {
  filters: WorkoutFilters;
  onFiltersChange: (filters: Partial<WorkoutFilters>) => void;
  onClearFilters: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

// Components props interfaces
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

export interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  enabled?: boolean;
}

export interface WorkoutEmptyStateProps {
  userRole: string;
  hasFilters: boolean;
  onCreateNew: () => void;
}

export interface ExerciseSelectionProps {
  selectedExercises: SelectedExercise[];
  onExerciseSelect: (exercise: Exercise) => void;
  onExerciseRemove: (exerciseId: string) => void;
  onExerciseUpdate: (exerciseId: string, field: keyof SelectedExercise, value: any) => void;
}

export interface WorkoutFormProps {
  initialData?: Partial<WorkoutFormData>;
  isCloning?: boolean;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Exercise filter types
export interface ExerciseFilters {
  search: string;
  muscleGroup: string;
  equipment: string;
}

// API Error type
export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

// Hook return types
export interface UseWorkoutListReturn {
  workouts: Workout[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  stats: WorkoutStats;
  filters: WorkoutFilters;
  pagination: PaginationData & { hasMore?: boolean };
  updateFilters: (filters: Partial<WorkoutFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  refreshWorkouts: () => Promise<void>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  viewMode?: 'grid' | 'list';
  setViewMode?: (mode: 'grid' | 'list') => void;
  loadMore?: () => Promise<void>;
}

export interface UseWorkoutFormReturn {
  formData: WorkoutFormData;
  selectedExercises: SelectedExercise[];
  isSubmitting: boolean;
  errors: Record<string, string>;
  updateFormData: (data: Partial<WorkoutFormData>) => void;
  handleExerciseSelect: (exercise: Exercise) => void;
  handleExerciseRemove: (exerciseId: string) => void;
  handleExerciseUpdate: (exerciseId: string, field: keyof SelectedExercise, value: any) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
  validateForm: () => boolean;
}

export interface UseExerciseSelectionReturn {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  filters: ExerciseFilters;
  isLoading: boolean;
  updateFilters: (filters: Partial<ExerciseFilters>) => void;
  refreshExercises: () => Promise<void>;
}