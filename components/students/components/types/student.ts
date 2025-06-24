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

// Interface principal do estudante (compatível com a API)
export interface Student {
  id: string;
  user_id?: string;
  tenant_id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | string;
  height?: number;
  weight?: number;
  goals?: string[];
  medical_conditions?: string;
  emergency_contact?: string;
  preferred_training_time?: string;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | string;
  notes?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'student';
  created_at: string;
  updated_at: string;
}

// Alias para compatibilidade com componentes de detalhes
export interface StudentProfile extends Student {}

// Props do formulário de estudante
export interface StudentFormCarouselProps {
  initialData?: Partial<StudentFormData>;
  mode?: 'create' | 'edit';
  studentId?: string;
  onSuccess?: () => void;
}

// Props dos steps do formulário
export interface StepProps {
  data: StudentFormData;
  onChange: (updates: Partial<StudentFormData>) => void;
  errors: Record<string, string>;
}

// Validação de cada step
export interface StepValidation {
  isValid: boolean;
  completedFields: number;
  totalFields: number;
  completionPercentage: number;
}

// Resultado da validação completa
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  stepValidation: Record<number, StepValidation>;
}

// Configuração dos steps
export interface StepConfig {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: string; // Nome do ícone como string
  color: string;
}

// Props dos componentes de detalhes
export interface StudentDetailsHeaderProps {
  student: Student;
  onBack: () => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
  isDeleting: boolean;
  isResendingInvite: boolean;
}

export interface StudentDetailsContentProps {
  student: Student;
}

export interface StudentDetailsActionsProps {
  student: Student;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
  isDeleting: boolean;
  isResendingInvite: boolean;
}

// Tipos para avaliações físicas
export interface PhysicalAssessment {
  id: string;
  student_id: string;
  tenant_id: string;
  date: string;
  weight?: number;
  height?: number;
  body_fat?: number;
  muscle_mass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hip?: number;
    bicep?: number;
    thigh?: number;
    forearm?: number;
    neck?: number;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para avaliações posturais
export interface PosturalAssessment {
  id: string;
  student_id: string;
  tenant_id: string;
  assessment_data: {
    head?: string;
    shoulders?: string;
    spine?: string;
    pelvis?: string;
    knees?: string;
    feet?: string;
  };
  observations?: string;
  recommendations?: string[];
  photos?: string[];
  created_at: string;
  updated_at: string;
}

// Tipos para filtros e listagem
export interface StudentFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

// Tipos para estatísticas dos estudantes
export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  by_experience: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  by_goals: Record<string, number>;
  recent_signups: number;
}

// Tipos para resposta da API
export interface StudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Tipos para ações em lote
export interface BulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'resend_invite';
  studentIds: string[];
}

export interface BulkActionResult {
  success: string[];
  failed: { id: string; error: string }[];
}

// Interfaces específicas para os steps do formulário com validação
export interface PersonalInfoStepProps extends StepProps {}

export interface PhysicalProfileStepProps extends StepProps {}

export interface MedicalInfoStepProps extends StepProps {
  onSave?: () => void;
  isSaving?: boolean;
  mode?: 'create' | 'edit';
}