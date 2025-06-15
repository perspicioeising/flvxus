import { ReactNode } from "react";

// types/physical-assessment-details.ts
export interface AssessmentDetails {
  id: string;
  student_id: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  protocol: string;
  bmi: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  body_density: number;
  notes?: string;
  ai_analysis?: any;
  ai_recommendations?: any;
  measurements: Record<string, number>;
  created_at: string;
  calculations_used: string;
  accuracy_estimate: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    email: string;
    goals?: string[];
  };
}

export interface AssessmentClassification {
  classification: string;
  colorClass: string;
}

export interface MetricCard {
  description: ReactNode;
  value: number;
  label: string;
  color: string;
  icon: any;
  progress: number;
  suffix?: string;
  decimals?: number;
}

export interface AssessmentDetailsPageProps {
  assessmentId: string;
}

export interface AssessmentHeaderProps {
  assessment: AssessmentDetails;
  userRole: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDownload: () => void;
}

export interface AssessmentOverviewProps {
  assessment: AssessmentDetails;
  classification: AssessmentClassification;
}

export interface AssessmentMeasurementsProps {
  measurements: Record<string, number>;
}

export interface AssessmentTabsProps {
  assessment: AssessmentDetails;
  activeTab: string;
  onTabChange: (tab: string) => void;
  classification: AssessmentClassification;
}

export const PROTOCOLS = {
  'jackson_pollock_3': 'Jackson & Pollock (3 dobras)',
  'jackson_pollock_7': 'Jackson & Pollock (7 dobras)',
  'durnin_womersley': 'Durnin & Womersley',
  'slaughter': 'Slaughter et al.',
  'boileau': 'Boileau et al.',
  'guedes_1994': 'Guedes 1994'
} as const;

export const MEASUREMENT_LABELS = {
  // Circunferências
  neck: 'Pescoço',
  shoulders: 'Ombros',
  chest: 'Tórax',
  chest_circ: 'Circunf. Tórax',
  waist: 'Cintura',
  abdomen: 'Abdômen',
  hips: 'Quadril',
  left_arm: 'Braço Esquerdo',
  right_arm: 'Braço Direito',
  left_thigh: 'Coxa Esquerda',
  right_thigh: 'Coxa Direita',
  left_calf: 'Panturrilha Esq.',
  right_calf: 'Panturrilha Dir.',
  // Dobras cutâneas
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  subscapular: 'Subescapular',
  abdominal: 'Abdominal',
  suprailiac: 'Supra-ilíaca',
  midaxillary: 'Axilar Média',
  thigh: 'Coxa'
} as const;