// /types/physical-assessment.ts

export type AssessmentTab = 'basic' | 'protocol' | 'measurements' | 'results' | 'analysis';

export interface Student {
  id: string;
  full_name: string;
  birthDate: string;
  gender: 'male' | 'female';
  height?: number;
  weight?: number;
  goals?: string[];
}

export interface PhysicalAssessmentFormData {
  student_id: string;
  protocol: string;
  date: string;
  weight: string;
  height: string;
  age: string;
  gender: string;
  measurements: Record<string, string>;
  notes: string;
}

export interface BodyCompositionResult {
  bmi: number;
  bodyDensity: number;
  fatPercentage: number;
  fatMass: number;
  leanMass: number;
}

export interface PhysicalAssessment {
  id: string;
  student_id: string;
  protocol: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  bmi: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  body_density: number;
  measurements: Record<string, number>;
  notes?: string;
  ai_analysis?: any;
  ai_recommendations?: any;
  created_at: string;
  updated_at: string;
}

export interface BodyProtocol {
  value: string;
  label: string;
  gender: 'male' | 'female' | 'both' | 'youth';
  description: string;
  color: string;
}

export interface MeasurementField {
  key: string;
  label: string;
  unit: string;
  icon: string;
  required?: string[];
  color: string;
}

export interface MeasurementFields {
  circumferences: MeasurementField[];
  skinfolds: MeasurementField[];
}

export interface AIAnalysis {
  summary: string;
  bodyComposition: {
    classification: string;
    healthRisk: string;
    comparison: string;
  };
  recommendations: {
    training?: string[];
    nutrition?: string[];
    lifestyle?: string[];
  };
  trends?: {
    progress: string;
    areas_improvement: string[];
  };
}

export interface AssessmentStep {
  id: AssessmentTab;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
}