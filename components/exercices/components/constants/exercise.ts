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

// components/exercises/constants/index.ts

// components/exercises/constants/index.ts

export const EXERCISE_STEPS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    shortTitle: 'Básico',
    description: 'Nome, descrição e categorias',
    icon: 'FileText',
    color: 'from-purple-500 to-purple-600'
  },
  
  {
    id: 'details',
    title: 'Detalhes Avançados',
    shortTitle: 'Detalhes',
    description: 'Variações, dicas e erros',
    icon: 'Target',
    color: 'from-purple-700 to-purple-800'
  },
  {
    id: 'media',
    title: 'Mídia',
    shortTitle: 'Mídia',
    description: 'Vídeo e áudio demonstrativos',
    icon: 'Video',
    color: 'from-purple-600 to-purple-700'
  },
  {
    id: 'review',
    title: 'Revisão',
    shortTitle: 'Revisar',
    description: 'Confirme todas as informações',
    icon: 'CheckCircle',
    color: 'from-purple-800 to-purple-900'
  }
];

// Ícones e cores para grupos musculares
export const MUSCLE_GROUP_ICONS: MuscleGroupIcon[] = [
  {
    group: "Peito",
    icon: "💪",
    color: "from-purple-500 to-pink-500",
    gradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
  },
  {
    group: "Costas", 
    icon: "🦵",
    color: "from-blue-500 to-purple-500",
    gradient: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
  },
  {
    group: "Pernas",
    icon: "🦵",
    color: "from-green-500 to-blue-500", 
    gradient: "from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
  },
  {
    group: "Ombros",
    icon: "🏋️",
    color: "from-orange-500 to-red-500",
    gradient: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
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
    color: "from-yellow-500 to-orange-500",
    gradient: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
  },
  {
    group: "Corpo Inteiro",
    icon: "🔥",
    color: "from-red-500 to-pink-500", 
    gradient: "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
  },
  {
    group: "Cardio",
    icon: "❤️",
    color: "from-pink-500 to-rose-500",
    gradient: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20"
  }
];

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

// Métricas para exibição nos cards
export const EXERCISE_METRICS = [
  {
    key: 'muscle_groups',
    label: "Grupos",
    colors: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    text: "text-purple-600 dark:text-purple-400",
    icon: "💪",
    format: "count" as const
  },
  {
    key: 'equipment',
    label: "Equipamentos", 
    colors: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
    text: "text-blue-600 dark:text-blue-400",
    icon: "🏋️",
    format: "count" as const
  },
  {
    key: 'variations',
    label: "Variações",
    colors: "from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20", 
    text: "text-green-600 dark:text-green-400",
    icon: "🔄",
    format: "count" as const
  },
  {
    key: 'tips',
    label: "Dicas",
    colors: "from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20",
    text: "text-orange-600 dark:text-orange-400", 
    icon: "💡",
    format: "count" as const
  }
];

// Cores principais do módulo
export const EXERCISE_COLORS = {
  primary: "from-purple-500 to-purple-600",
  secondary: "from-purple-600 to-purple-700",
  accent: "from-pink-500 to-purple-500",
  background: "from-purple-50/40 to-pink-50/40",
  darkBackground: "from-purple-900 to-purple-950"
} as const;