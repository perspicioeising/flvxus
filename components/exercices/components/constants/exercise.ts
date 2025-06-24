// /constants/exercise.ts

import { MuscleGroupIcon } from '@/components/exercices/types/exercise';

export const MUSCLE_GROUPS = [
  "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Corpo Inteiro", "Cardio"
];

export const EQUIPMENT_TYPES = [
  "Peso Livre",
  "Máquina", 
  "Cabo",
  "Peso Corporal",
  "Elástico",
  "Kettlebell",
  "TRX",
  "Outros"
];

// ===== EXERCISE STEPS - Nova ordem e cores atualizadas =====
export const EXERCISE_STEPS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    shortTitle: 'Básico',
    description: 'Nome, descrição e categorias',
    icon: 'FileText',
    color: 'achievement-exercise', // Azul/Indigo
    gradient: 'achievement-exercise'
  },
  {
    id: 'details', // Movido para segundo lugar
    title: 'Detalhes Avançados',
    shortTitle: 'Detalhes',
    description: 'Variações, dicas e erros comuns',
    icon: 'Target',
    color: 'achievement-workout', // Verde
    gradient: 'achievement-workout'
  },
  {
    id: 'media', // Movido para terceiro lugar
    title: 'Mídia Demonstrativa',
    shortTitle: 'Mídia',
    description: 'Vídeo e áudio demonstrativos',
    icon: 'Video',
    color: 'achievement-weight', // Teal
    gradient: 'achievement-weight'
  },
  {
    id: 'review',
    title: 'Revisão Final',
    shortTitle: 'Revisar',
    description: 'Verificar e salvar exercício',
    icon: 'CheckCircle',
    color: 'achievement-consecutive', // Verde claro
    gradient: 'achievement-consecutive'
  }
];

// ===== MUSCLE GROUP ICONS - Cores atualizadas para o novo design system =====
export const MUSCLE_GROUP_ICONS: MuscleGroupIcon[] = [
  {
    group: "Peito",
    icon: "💪",
    color: "from-red-500 to-red-600",
    gradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
  },
  {
    group: "Costas", 
    icon: "🏋️",
    color: "from-blue-500 to-blue-600",
    gradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
  },
  {
    group: "Pernas",
    icon: "🦵",
    color: "from-green-500 to-green-600", 
    gradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
  },
  {
    group: "Ombros",
    icon: "🏋️",
    color: "from-yellow-500 to-yellow-600",
    gradient: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
  },
  {
    group: "Braços", 
    icon: "💪",
    color: "from-purple-500 to-purple-600",
    gradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
  },
  {
    group: "Core",
    icon: "⚡",
    color: "from-orange-500 to-orange-600",
    gradient: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
  },
  {
    group: "Corpo Inteiro",
    icon: "🔥",
    color: "from-pink-500 to-pink-600", 
    gradient: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20"
  },
  {
    group: "Cardio",
    icon: "❤️",
    color: "from-teal-500 to-teal-600",
    gradient: "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20"
  }
];

// ===== UTILITY FUNCTIONS =====

// Obter ícone e cor por grupo muscular
export const getMuscleGroupIcon = (group: string): MuscleGroupIcon => {
  return MUSCLE_GROUP_ICONS.find(m => m.group === group) || {
    group: "Outros",
    icon: "🏃",
    color: "from-gray-500 to-gray-600",
    gradient: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20"
  };
};

// Obter ícone principal do exercício baseado nos grupos musculares
export const getExerciseMainIcon = (muscleGroups: string[]): MuscleGroupIcon => {
  if (muscleGroups.length === 0) {
    return getMuscleGroupIcon("Outros");
  }
  return getMuscleGroupIcon(muscleGroups[0]);
};

// ===== FILTERS AND VIEW OPTIONS =====

// Filtros de data/período
export const DATE_FILTERS = [
  { value: 'all', label: 'Todos os Períodos' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' }
] as const;

// Opções de visualização
export const VIEW_MODES = [
  { value: 'grid', label: 'Grade', icon: 'Grid' },
  { value: 'list', label: 'Lista', icon: 'LayoutList' }
] as const;

// ===== EXERCISE METRICS - Atualizadas com as novas cores =====
export const EXERCISE_METRICS = [
  {
    key: 'muscle_groups',
    label: "Grupos",
    colors: "from-achievement-exercise/10 to-achievement-exercise/20",
    text: "text-achievement-exercise",
    border: "border-achievement-exercise/30",
    icon: "💪",
    format: "count" as const
  },
  {
    key: 'equipment',
    label: "Equipamentos", 
    colors: "from-achievement-workout/10 to-achievement-workout/20",
    text: "text-achievement-workout",
    border: "border-achievement-workout/30",
    icon: "🏋️",
    format: "count" as const
  },
  {
    key: 'variations',
    label: "Variações",
    colors: "from-achievement-weight/10 to-achievement-weight/20", 
    text: "text-achievement-weight",
    border: "border-achievement-weight/30",
    icon: "🔄",
    format: "count" as const
  },
  {
    key: 'tips',
    label: "Dicas",
    colors: "from-achievement-consecutive/10 to-achievement-consecutive/20",
    text: "text-achievement-consecutive", 
    border: "border-achievement-consecutive/30",
    icon: "💡",
    format: "count" as const
  }
];

// ===== EXERCISE MODULE COLORS - Novo design system =====
export const EXERCISE_COLORS = {
  // Cores principais baseadas no achievement system
  primary: "achievement-exercise",
  secondary: "achievement-workout", 
  accent: "achievement-weight",
  success: "achievement-consecutive",
  
  // Gradientes para backgrounds
  primaryGradient: "from-achievement-exercise/10 to-achievement-workout/10",
  secondaryGradient: "from-achievement-workout/10 to-achievement-weight/10",
  accentGradient: "from-achievement-weight/10 to-achievement-consecutive/10",
  
  // Backgrounds e overlays
  cardBackground: "bg-app-card",
  overlayBackground: "bg-app-overlay",
  pageBackground: "bg-app-gradient",
  
  // Borders
  defaultBorder: "border-app-border-default",
  mutedBorder: "border-app-border-muted", 
  accentBorder: "border-app-border-accent",
  
  // Texto
  primaryText: "text-app-text-primary",
  secondaryText: "text-app-text-secondary",
  mutedText: "text-app-text-muted",
  accentText: "text-app-text-accent",
  headingText: "text-app-heading",
  
  // Shadows
  lightShadow: "shadow-app-light",
  mediumShadow: "shadow-app-medium", 
  largeShadow: "shadow-app-large",
  xlShadow: "shadow-app-xl"
} as const;

// ===== EXERCISE STATUS AND CATEGORIES =====

// Status dos exercícios
export const EXERCISE_STATUS = [
  {
    value: 'draft',
    label: 'Rascunho',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: '📝'
  },
  {
    value: 'published',
    label: 'Publicado',
    color: 'achievement-consecutive',
    bgColor: 'bg-achievement-consecutive/10',
    textColor: 'text-achievement-consecutive',
    icon: '✅'
  },
  {
    value: 'archived',
    label: 'Arquivado',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: '📦'
  }
] as const;

// Níveis de dificuldade
export const DIFFICULTY_LEVELS = [
  {
    value: 'beginner',
    label: 'Iniciante',
    color: 'achievement-consecutive',
    icon: '🟢',
    description: 'Ideal para quem está começando'
  },
  {
    value: 'intermediate', 
    label: 'Intermediário',
    color: 'achievement-workout',
    icon: '🟡',
    description: 'Para quem já tem experiência básica'
  },
  {
    value: 'advanced',
    label: 'Avançado',
    color: 'achievement-weight',
    icon: '🟠',
    description: 'Para praticantes experientes'
  },
  {
    value: 'expert',
    label: 'Expert',
    color: 'achievement-exercise',
    icon: '🔴',
    description: 'Para profissionais e atletas'
  }
] as const;

// ===== ANIMATION AND TRANSITION CONFIGS =====

// Configurações de animação
export const ANIMATION_CONFIG = {
  // Durações
  fast: 'duration-200',
  normal: 'duration-300',
  slow: 'duration-500',
  slower: 'duration-700',
  
  // Easing
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
  
  // Transforms comuns
  scaleHover: 'hover:scale-105',
  scaleActive: 'active:scale-95',
  scaleCard: 'hover:scale-[1.02]',
  
  // Delays para animações em sequência
  delays: {
    item1: 'delay-0',
    item2: 'delay-75', 
    item3: 'delay-150',
    item4: 'delay-300'
  }
} as const;

// ===== RESPONSIVE BREAKPOINTS =====

// Configurações responsivas específicas do módulo
export const EXERCISE_BREAKPOINTS = {
  // Grid columns por breakpoint
  gridCols: {
    mobile: 'grid-cols-1',
    tablet: 'sm:grid-cols-2', 
    laptop: 'lg:grid-cols-3',
    desktop: 'xl:grid-cols-4'
  },
  
  // Gaps responsivos
  gaps: {
    small: 'gap-3 sm:gap-4',
    medium: 'gap-4 sm:gap-6', 
    large: 'gap-6 sm:gap-8'
  },
  
  // Padding responsivo
  padding: {
    container: 'px-3 sm:px-4',
    card: 'p-4 sm:p-6',
    section: 'py-4 sm:py-6 lg:py-8'
  }
} as const;