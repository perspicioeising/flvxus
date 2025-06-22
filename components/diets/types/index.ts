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