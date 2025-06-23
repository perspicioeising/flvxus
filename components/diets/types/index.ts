// components/diets/types/index.ts

export interface Student {
  id: string;
  full_name: string;
  avatar_url?: string;
  birth_date?: string;
  weight?: number;
  height?: number;
  gender?: string;
}

export interface PhysicalAssessment {
  id: string;
  student_id: string;
  weight: number;
  height: number;
  date: string;
  fat_percentage?: number;
  lean_mass?: number;
  body_density?: number;
  fat_mass?: number;
  bmi?: number;
  created_at: string;
}

export interface DietGoal {
  value: string;
  label: string;
  icon: any;
  color: string;
}

export interface ActivityLevel {
  value: string;
  label: string;
  description: string;
}

export interface DietaryStyle {
  value: string;
  label: string;
  icon: any;
}

export interface FoodPreference {
  value: string;
  label: string;
}

export interface BudgetProfile {
  value: string;
  label: string;
  description: string;
  color: string;
}

export interface DietFormData {
  student_id: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  activity_level: string;
  goal: string;
  goal_description: string;
  budget_profile: string;
  meals_per_day: number;
  dietary_style: string[];
  food_preferences: string[];
  restrictions: string[];
  custom_restrictions: string;
  use_physical_assessment: boolean;
  physical_assessment_id: string;
}

export interface GeneratedMeal {
  meal_type: string;
  meal_time: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: GeneratedFood[];
}

export interface GeneratedFood {
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GeneratedShoppingItem {
  category: string;
  item_name: string;
  quantity: string;
  notes: string;
  order_index: number;
  weekly_quantity?: string;
}

export interface GeneratedDiet {
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  meals: GeneratedMeal[];
  shopping_list: GeneratedShoppingItem[];
  recommendations: string[];
}

export interface DietParams {
  student_id: string;
  age: number;
  weight: number;
  height?: number;
  gender: string;
  activity_level: string;
  goal: string;
  goal_description: string;
  budget_profile: string;
  meals_per_day: number;
  dietary_style: string[];
  food_preferences: string[];
  restrictions: string[];
  custom_restrictions: string;
  physical_assessment?: PhysicalAssessment;
}

export interface CreateDietParams extends DietParams {
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  used_physical_assessment: boolean;
  physical_assessment_id?: string;
  generatedMeals: GeneratedMeal[];
  generatedShoppingList: GeneratedShoppingItem[];
  generatedRecommendations: string[];
}

export type DietStep = 'basic' | 'goals' | 'preferences' | 'review';

export interface DietStepData {
  id: DietStep;
  title: string;
  description: string;
  icon: string;
  color: string;
  shortTitle: string;
}

// /components/diets/types/index.ts

export interface Diet {
  id: string;
  name: string;
  description?: string;
  goal: 'muscle_gain' | 'fat_loss' | 'reeducation' | 'performance' | 'maintenance';
  meals_per_day: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete';
  budget_profile: 'economic' | 'intermediate' | 'free';
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  status: 'draft' | 'active' | 'completed';
  used_physical_assessment: boolean;
  student_id: string;
  trainer_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface DietFilters {
  searchQuery: string;
  statusFilter: 'all' | 'draft' | 'active' | 'completed';
  goalFilter: 'all' | 'muscle_gain' | 'fat_loss' | 'reeducation' | 'performance' | 'maintenance';
}

export interface DietFiltersProps {
  filters: DietFilters;
  onFiltersChange: (filters: DietFilters) => void;
}

export interface DietCardProps {
  diet: Diet;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onClone: (diet: Diet) => void;
  onDelete: (diet: Diet) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
}

export interface DietsListProps {
  userRole: 'trainer' | 'student';
  viewMode?: 'grid' | 'list';
  onCreateNew: () => void;
  onViewDiet: (id: string) => void;
  onEditDiet: (id: string) => void;
  onCloneDiet: (diet: Diet) => void;
  onDeleteDiet: (diet: Diet) => void;
}

export interface DietsHeaderProps {
  userRole: 'trainer' | 'student';
  stats: {
    total: number;
    active: number;
    students: number;
    aiGenerated: number;
  };
  onCreateNew: () => void;
}

export interface DietsEmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
  onClearFilters: () => void;
}

export interface DietsLoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export interface DietsPaginationInfoProps {
  currentCount: number;
  totalCount: number;
}

export interface DietFormData {
  name: string;
  description: string;
  goal: string;
  meals_per_day: number;
  activity_level: string;
  budget_profile: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  student_id: string;
  used_physical_assessment: boolean;
}

export interface DietStatistics {
  total: number;
  active: number;
  completed: number;
  draft: number;
  students: number;
  aiGenerated: number;
}
