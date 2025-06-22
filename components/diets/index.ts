// components/diets/index.ts

// Export create components
export { DietForm } from './create/DietForm';
export { DietFormHeader } from './create/DietFormHeader';
export { DietFormSkeleton } from './create/DietFormSkeleton';
export { DietStepNavigation } from './create/DietStepNavigation';

// Export step components
export { StepBasicInfo } from './steps/StepBasicInfo';
export { StepGoals } from './steps/StepGoals';
export { StepPreferences } from './steps/StepPreferences';
export { StepReview } from './steps/StepReview';

// Export hooks
export { useDietForm } from './hooks/useDietForm';
export type { 
  UseDietFormReturn, 
  DietFormConfig, 
  DietFormErrors,
  UseDietFormState,
  UseDietFormActions 
} from './hooks/form-types';

// Export types
export type {
  Student,
  PhysicalAssessment,
  DietGoal,
  ActivityLevel,
  DietaryStyle,
  FoodPreference,
  BudgetProfile,
  DietFormData,
  GeneratedMeal,
  GeneratedFood,
  GeneratedShoppingItem,
  GeneratedDiet,
  DietParams,
  CreateDietParams,
  DietStep,
  DietStepData
} from './types';

// Export constants
export {
  DIET_GOALS,
  ACTIVITY_LEVELS,
  DIETARY_STYLES,
  FOOD_PREFERENCES,
  BUDGET_PROFILES,
  RESTRICTIONS,
  DIET_STEPS,
  STEP_ICONS
} from './constants';