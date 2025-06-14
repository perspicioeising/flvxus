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

// ===== NOVOS TIPOS PARA A LISTAGEM =====

export interface AssessmentListItem {
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
  ai_analysis?: any;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

export interface AssessmentStats {
  total: number;
  thisMonth: number;
  avgFatPercentage: number;
  avgBMI: number;
}

export interface AssessmentFilters {
  searchQuery: string;
  protocolFilter: string;
  dateFilter: string;
}

export interface AssessmentClassification {
  classification: string;
  colorClass: string;
}

export interface MetricCard {
  value: number;
  label: string;
  color: string;
  icon: any;
  progress: number;
  suffix?: string;
  decimals?: number;
}

// Tipos para detalhes
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

// Props dos componentes
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

// Props para componentes de lista
export interface AssessmentListPageProps {
  userRole: string | null;
}

export interface AssessmentCardProps {
  assessment: AssessmentListItem;
  onView: (id: string) => void;
  onViewAnalysis?: (id: string) => void;
}

export interface AssessmentFiltersProps {
  filters: AssessmentFilters;
  onFiltersChange: (filters: Partial<AssessmentFilters>) => void;
  onClearFilters: () => void;
}

export interface AssessmentStatsProps {
  stats: AssessmentStats;
}

export interface AssessmentEmptyStateProps {
  userRole: string | null;
  hasFilters: boolean;
  onCreateNew: () => void;
}

export interface AssessmentHeaderComponentProps {
  userRole: string | null;
  stats: AssessmentStats;
  onCreateNew: () => void;
}

// ===== NOVOS TIPOS PARA PAGINAÇÃO =====

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AssessmentListResponse {
  assessments: AssessmentListItem[];
  pagination: PaginationData;
}

export interface LoadMoreButtonProps {
  isLoading: boolean;
  hasMore: boolean;
  totalLoaded: number;
  totalAvailable: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

export interface PaginationInfoProps {
  currentCount: number;
  totalCount: number;
}