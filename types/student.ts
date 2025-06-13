// types/student.ts

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  height: string;
  weight: string;
  goals: string[];
  medicalConditions: string;
  emergencyContact: string;
  preferredTime: string;
  experienceLevel: string;
  notes: string;
}

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive';
  experience_level?: string;
  goals?: string[];
  created_at: string;
  updated_at: string;
}


export interface StudentFormCarouselProps {
  initialData?: Partial<StudentFormData>;
  mode?: 'create' | 'edit';
  studentId?: string;
  onSuccess?: () => void;
}

export interface StepProps {
  data: StudentFormData;
  onChange: (updates: Partial<StudentFormData>) => void;
  errors: Record<string, string>;
}

export interface StepValidation {
  isValid: boolean;
  completedFields: number;
  totalFields: number;
  completionPercentage: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  stepValidation: Record<number, StepValidation>;
}

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}