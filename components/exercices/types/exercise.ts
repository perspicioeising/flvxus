// /types/exercise.ts

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string[];
  equipment: string[];
  variations?: string[];
  video_url?: string;
  audio_url?: string;
  tips?: string[];
  common_errors?: string[];
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export interface ExerciseFormData {
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  variations: string;
  videoUrl: string;
  audioUrl: string;
  tips: string;
  commonErrors: string;
}

export interface ExerciseFilters {
  searchQuery: string;
  muscleFilter: string;
  equipmentFilter: string;
}

export interface ExercisePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ExerciseStats {
  total: number;
  thisMonth: number;
  byMuscleGroup: Record<string, number>;
  byEquipment: Record<string, number>;
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  pagination: ExercisePagination;
}

// Props dos componentes
export interface ExerciseListPageProps {
  userRole?: string | null;
}

export interface ExerciseCardProps {
  exercise: Exercise;
  viewMode: 'grid' | 'list';
  onView: (id: string) => void;
}

export interface ExerciseFiltersProps {
  filters: ExerciseFilters;
  viewMode: 'grid' | 'list';
  onFiltersChange: (filters: Partial<ExerciseFilters>) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onClearFilters: () => void;
}

export interface ExerciseHeaderProps {
  exerciseCount: number;
  onCreateNew: () => void;
}

export interface ExerciseEmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
  onClearFilters: () => void;
}

export interface ExerciseLoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export interface ExercisePaginationInfoProps {
  currentCount: number;
  totalCount: number;
}

export interface MuscleGroupIcon {
  group: string;
  icon: string;
  color: string;
  gradient: string;
}