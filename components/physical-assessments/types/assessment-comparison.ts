// types/assessment-comparison.ts
export interface Measurements {
  // Circunferências
  neck?: number | string;
  shoulders?: number | string;
  chest?: number | string;
  chest_circ?: number | string;
  waist?: number | string;
  abdomen?: number | string;
  hips?: number | string;
  left_arm?: number | string;
  right_arm?: number | string;
  left_thigh?: number | string;
  right_thigh?: number | string;
  left_calf?: number | string;
  right_calf?: number | string;
  // Dobras cutâneas
  triceps?: number | string;
  biceps?: number | string;
  subscapular?: number | string;
  abdominal?: number | string;
  suprailiac?: number | string;
  midaxillary?: number | string;
  thigh?: number | string;
  // Index signature para permitir acesso dinâmico
  [key: string]: number | string | undefined;
}

export interface Assessment {
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
  created_at: string;
  measurements?: Measurements;
}

export interface ComparisonData {
  metric: string;
  label: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  improvement: 'positive' | 'negative' | 'neutral';
}

export interface MeasurementPoint {
  key: keyof Measurements;
  label: string;
  unit: string;
  position: { x: number; y: number };
  color: string;
}

export interface AssessmentComparisonProps {
  currentAssessment: Assessment;
  studentId: string;
  className?: string;
}

export interface ProgressScore {
  score: number;
  status: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
  message: string;
}

export interface HumanoidFigureProps {
  measurements: Measurements | undefined;
  previousMeasurements: Measurements | undefined;
  activeCategory: 'circumferences' | 'skinfolds';
  onMeasurementClick: (measurement: MeasurementPoint) => void;
}

export interface ComparisonHeaderProps {
  progress: ProgressScore;
  availableAssessments: Assessment[];
  selectedAssessment: Assessment | null;
  onAssessmentSelect: (assessment: Assessment) => void;
}

export interface ComparisonTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  comparisonData: ComparisonData[];
  selectedMeasurement: MeasurementPoint | null;
  setSelectedMeasurement: (measurement: MeasurementPoint | null) => void;
  activeMeasurementCategory: 'circumferences' | 'skinfolds';
  setActiveMeasurementCategory: (category: 'circumferences' | 'skinfolds') => void;
  currentAssessment: Assessment;
  selectedPreviousAssessment: Assessment;
  onMeasurementClick: (measurement: MeasurementPoint) => void;
}

// Dados das medidas organizados com posicionamento para a figura humanoide
export const MEASUREMENT_DATA: {
  circumferences: MeasurementPoint[];
  skinfolds: MeasurementPoint[];
} = {
  circumferences: [
    { key: 'neck', label: 'Pescoço', unit: 'cm', position: { x: 50, y: 15 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'shoulders', label: 'Ombros', unit: 'cm', position: { x: 50, y: 25 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'chest', label: 'Tórax', unit: 'cm', position: { x: 50, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'chest_circ', label: 'Circunf. Tórax', unit: 'cm', position: { x: 50, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'waist', label: 'Cintura', unit: 'cm', position: { x: 50, y: 45 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm', position: { x: 50, y: 50 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'hips', label: 'Quadril', unit: 'cm', position: { x: 50, y: 55 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'left_arm', label: 'Braço Esq.', unit: 'cm', position: { x: 25, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'right_arm', label: 'Braço Dir.', unit: 'cm', position: { x: 75, y: 35 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'left_thigh', label: 'Coxa Esq.', unit: 'cm', position: { x: 40, y: 70 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'right_thigh', label: 'Coxa Dir.', unit: 'cm', position: { x: 60, y: 70 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'left_calf', label: 'Panturrilha Esq.', unit: 'cm', position: { x: 40, y: 85 }, color: 'from-blue-500 to-cyan-500' },
    { key: 'right_calf', label: 'Panturrilha Dir.', unit: 'cm', position: { x: 60, y: 85 }, color: 'from-blue-500 to-cyan-500' }
  ],
  skinfolds: [
    { key: 'triceps', label: 'Tríceps', unit: 'mm', position: { x: 80, y: 40 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'biceps', label: 'Bíceps', unit: 'mm', position: { x: 20, y: 40 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'subscapular', label: 'Subescapular', unit: 'mm', position: { x: 65, y: 30 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'abdominal', label: 'Abdominal', unit: 'mm', position: { x: 45, y: 50 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'suprailiac', label: 'Supra-ilíaca', unit: 'mm', position: { x: 35, y: 55 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'midaxillary', label: 'Axilar Média', unit: 'mm', position: { x: 25, y: 45 }, color: 'from-yellow-500 to-orange-500' },
    { key: 'thigh', label: 'Coxa', unit: 'mm', position: { x: 50, y: 70 }, color: 'from-yellow-500 to-orange-500' }
  ]
};

// Função utilitária para conversão segura de números
export const safeNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};