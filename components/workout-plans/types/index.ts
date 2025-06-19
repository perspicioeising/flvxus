// types/index.ts - Tipos centralizados do módulo de planos de treino

export interface Workout {
  id: string;
  name: string;
  description?: string;
  level?: string;
  goal?: string;
  day_of_week: number;
}

export interface Student {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

export interface WorkoutPlanItem {
  id: string;
  workout_id: string;
  day_of_week: number;
  workout: Workout;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  student_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  workouts: WorkoutPlanItem[];
  student?: Student;
   hasMore: boolean;
}

export interface CreateWorkoutPlanData {
  name: string;
  description: string;
  student_id: string;
  start_date: string;
  end_date: string;
  workouts: {
    workout_id: string;
    day_of_week: number;
  }[];
}

export interface WorkoutPlanFilters {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'completed';
}

export interface WorkoutPlanStats {
  totalPlans: number;
  activePlans: number;
  totalStudents: number;
  avgDuration: number;
}

export interface PaginationData {
  hasMore: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WorkoutPlanResponse {
  error: string;
  plans: WorkoutPlan[];
  pagination: PaginationData;
}

export interface SelectedWorkout extends Workout {
  workout: any;
  day_of_week: number;
}

export type PlanStatus = 'active' | 'completed';

export interface WorkoutPlanFormData {
  name: string;
  description: string;
  student_id: string;
  start_date: string;
  end_date: string;
}

// Props interfaces para componentes
export interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onView: (planId: string) => void;
  onEdit: (planId: string) => void;
  onClone: (plan: WorkoutPlan) => void;
  onDelete: (plan: WorkoutPlan) => void;
  isLoading: boolean;
}

export interface WorkoutPlanFiltersProps {
  filters: WorkoutPlanFilters;
  onFiltersChange: (filters: WorkoutPlanFilters) => void;
}

export interface WorkoutPlanStatsProps {
  stats: WorkoutPlanStats;
  isLoading: boolean;
}

export interface CreatePlanFormProps {
  isOpen: boolean;
  isCloning: boolean;
  formData: WorkoutPlanFormData;
  selectedWorkouts: SelectedWorkout[];
  students: Student[];
  workouts: Workout[];
  isLoading: boolean;
  onFormDataChange: (data: Partial<WorkoutPlanFormData>) => void;
  onWorkoutSelect: (workout: Workout) => void;
  onWorkoutUpdate: (index: number, field: 'day_of_week', value: number) => void;
  onWorkoutRemove: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface WorkoutPlanListProps {
  plans: WorkoutPlan[];
  isLoading: boolean;
  pagination: PaginationData;
   hasMore: boolean;
  hasMorePlans: boolean;
  onLoadMore: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onView: (planId: string) => void;
  onEdit: (planId: string) => void;
  onClone: (plan: WorkoutPlan) => void;
  onDelete: (plan: WorkoutPlan) => void;
}