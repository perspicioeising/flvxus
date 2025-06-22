// components/diets/hooks/form-types.ts

import type { DietFormData, DietStep, Student, PhysicalAssessment, GeneratedDiet, DietParams, CreateDietParams } from '../types';

export interface DietFormErrors {
  student_id?: string;
  age?: string;
  weight?: string;
  height?: string;
  goal?: string;
  activity_level?: string;
  budget_profile?: string;
  [key: string]: string | undefined;
}

export interface UseDietFormState {
  // Form data
  formData: DietFormData;
  
  // UI state
  activeStep: DietStep;
  isGenerating: boolean;
  isSaving: boolean;
  isLoading: boolean;
  
  // Data
  students: Student[];
  physicalAssessment: PhysicalAssessment | null;
  generatedDiet: GeneratedDiet | null;
  userProfile: any;
  
  // Validation
  errors: DietFormErrors;
  
  // Notes
  dietNotes: string;
}

export interface UseDietFormActions {
  // Navigation
  setActiveStep: (step: DietStep) => void;
  
  // Form updates
  updateFormField: <K extends keyof DietFormData>(field: K, value: DietFormData[K]) => void;
  
  // Student selection
  handleStudentChange: (studentId: string) => void;
  
  // Array field updates
  toggleDietaryStyle: (style: string) => void;
  toggleFoodPreference: (preference: string) => void;
  toggleRestriction: (restriction: string) => void;
  
  // Physical assessment
  togglePhysicalAssessment: (use: boolean) => void;
  
  // Diet operations
  generateDiet: () => Promise<void>;
  saveDiet: () => Promise<void>;
  
  // Validation
  validateStep: (step: DietStep) => boolean;
  canAdvanceStep: () => boolean;
  isFormValid: () => boolean;
  
  // Notes
  setDietNotes: (notes: string) => void;
}

export interface UseDietFormReturn extends UseDietFormState, UseDietFormActions {}

export interface DietFormConfig {
  mode: 'create' | 'edit';
  dietId?: string;
  studentId?: string;
  onSuccess?: () => void;
}