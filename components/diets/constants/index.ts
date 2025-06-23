// components/diets/constants/index.ts

import {
  TrendingUp,
  Target,
  Apple,
  Zap,
  BarChart3,
  FileText,
  Salad,
  Pizza,
  Beef,
  Timer,
  Coffee,
  User,
  Heart,
  Dumbbell,
  ChefHat,
  CheckCircle
} from "lucide-react";

import type { DietGoal, ActivityLevel, DietaryStyle, FoodPreference, BudgetProfile, DietStepData } from '../types';

export const DIET_GOALS: DietGoal[] = [
  { 
    value: 'muscle_gain', 
    label: 'Ganho de Massa Muscular', 
    icon: TrendingUp, 
    color: 'from-blue-500 to-purple-500' 
  },
  { 
    value: 'fat_loss', 
    label: 'Perda de Gordura', 
    icon: Target, 
    color: 'from-red-500 to-orange-500' 
  },
  { 
    value: 'reeducation', 
    label: 'Reeducação Alimentar', 
    icon: Apple, 
    color: 'from-green-500 to-emerald-500' 
  },
  { 
    value: 'performance', 
    label: 'Melhora de Performance', 
    icon: Zap, 
    color: 'from-yellow-500 to-orange-500' 
  },
  { 
    value: 'maintenance', 
    label: 'Manutenção de Peso', 
    icon: BarChart3, 
    color: 'from-purple-500 to-pink-500' 
  },
  { 
    value: 'other', 
    label: 'Outro', 
    icon: FileText, 
    color: 'from-gray-500 to-gray-600' 
  }
];

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  { 
    value: 'sedentary', 
    label: 'Sedentário', 
    description: 'Pouco ou nenhum exercício' 
  },
  { 
    value: 'light', 
    label: 'Leve', 
    description: '1-3 dias por semana' 
  },
  { 
    value: 'moderate', 
    label: 'Moderado', 
    description: '3-5 dias por semana' 
  },
  { 
    value: 'intense', 
    label: 'Intenso', 
    description: '6-7 dias por semana' 
  },
  { 
    value: 'athlete', 
    label: 'Atleta', 
    description: 'Treino intenso diário' 
  }
];

export const DIETARY_STYLES: DietaryStyle[] = [
  { value: 'vegetarian', label: 'Vegetariano', icon: Salad },
  { value: 'vegan', label: 'Vegano', icon: Apple },
  { value: 'omnivore', label: 'Onívoro', icon: Pizza },
  { value: 'low_carb', label: 'Low Carb', icon: Beef },
  { value: 'keto', label: 'Cetogênica', icon: Beef },
  { value: 'paleo', label: 'Paleo', icon: Beef },
  { value: 'intermittent', label: 'Jejum Intermitente', icon: Timer },
  { value: 'flexible', label: 'Flexível', icon: Coffee },
];

export const FOOD_PREFERENCES: FoodPreference[] = [
  { value: 'common', label: 'Comuns e acessíveis' },
  { value: 'nutrient_rich', label: 'Ricos em nutrientes' },
  { value: 'easy_prep', label: 'Fácil preparo' },
  { value: 'ready_made', label: 'Prontos/congelados' }
];

export const BUDGET_PROFILES: BudgetProfile[] = [
  { 
    value: 'economic', 
    label: 'Econômico', 
    description: 'Alimentos básicos e acessíveis', 
    color: 'from-green-500 to-emerald-500' 
  },
  { 
    value: 'intermediate', 
    label: 'Intermediário', 
    description: 'Equilíbrio entre preço e variedade', 
    color: 'from-yellow-500 to-orange-500' 
  },
  { 
    value: 'free', 
    label: 'Livre', 
    description: 'Sem restrições de orçamento', 
    color: 'from-purple-500 to-pink-500' 
  }
];

export const RESTRICTIONS = [
  'Lactose',
  'Glúten',
  'Frutos do mar',
  'Nozes e castanhas',
  'Ovo',
  'Soja',
  'Açúcar',
  'Sal',
];

export const DIET_STEPS: DietStepData[] = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Dados essenciais para criar a dieta personalizada',
    icon: 'User',
    color: 'from-green-500 to-emerald-500',
    shortTitle: 'Básico'
  },
  {
    id: 'goals',
    title: 'Objetivos da Dieta',
    description: 'Defina os objetivos e nível de atividade física',
    icon: 'Target',
    color: 'from-blue-500 to-cyan-500',
    shortTitle: 'Objetivos'
  },
  {
    id: 'preferences',
    title: 'Preferências e Restrições',
    description: 'Personalize a dieta de acordo com suas preferências',
    icon: 'Apple',
    color: 'from-purple-500 to-pink-500',
    shortTitle: 'Preferências'
  },
  {
    id: 'review',
    title: 'Dieta Gerada com IA',
    description: 'Revise e aprove a dieta personalizada',
    icon: 'FileText',
    color: 'from-orange-500 to-red-500',
    shortTitle: 'Revisão'
  }
];

export const STEP_ICONS = {
  User,
  Target,
  Apple,
  FileText,
  Heart,
  Dumbbell,
  ChefHat,
  CheckCircle
} as const;

// /components/diets/constants/index.ts

export const MODULE_COLORS = {
  primary: {
    gradient: 'from-emerald-600 via-green-500 to-teal-600',
    bg: 'bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-600'
  },
  secondary: {
    gradient: 'from-blue-600 via-cyan-500 to-blue-600',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-600'
  }
};

export const DIET_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'active', label: 'Ativas' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'completed', label: 'Concluídas' }
];

export const DIET_GOAL_OPTIONS = [
  { value: 'all', label: 'Todos os Objetivos' },
  { value: 'muscle_gain', label: 'Ganho de Massa' },
  { value: 'fat_loss', label: 'Perda de Gordura' },
  { value: 'reeducation', label: 'Reeducação Alimentar' },
  { value: 'performance', label: 'Performance' },
  { value: 'maintenance', label: 'Manutenção' }
];

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'sedentary', label: 'Sedentário' },
  { value: 'light', label: 'Leve' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'intense', label: 'Intenso' },
  { value: 'athlete', label: 'Atleta' }
];

export const BUDGET_PROFILE_OPTIONS = [
  { value: 'economic', label: 'Econômico' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'free', label: 'Livre' }
];

export const MEALS_PER_DAY_OPTIONS = [
  { value: 3, label: '3 refeições' },
  { value: 4, label: '4 refeições' },
  { value: 5, label: '5 refeições' },
  { value: 6, label: '6 refeições' }
];

export const DIET_GOAL_COLORS = {
  muscle_gain: {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200/50 dark:border-blue-700/50',
    text: 'text-blue-600 dark:text-blue-400',
    darkText: 'text-blue-800 dark:text-blue-300'
  },
  fat_loss: {
    bg: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
    border: 'border-red-200/50 dark:border-red-700/50',
    text: 'text-red-600 dark:text-red-400',
    darkText: 'text-red-800 dark:text-red-300'
  },
  reeducation: {
    bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    border: 'border-green-200/50 dark:border-green-700/50',
    text: 'text-green-600 dark:text-green-400',
    darkText: 'text-green-800 dark:text-green-300'
  },
  performance: {
    bg: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    border: 'border-purple-200/50 dark:border-purple-700/50',
    text: 'text-purple-600 dark:text-purple-400',
    darkText: 'text-purple-800 dark:text-purple-300'
  },
  maintenance: {
    bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
    border: 'border-yellow-200/50 dark:border-yellow-700/50',
    text: 'text-yellow-600 dark:text-yellow-400',
    darkText: 'text-yellow-800 dark:text-yellow-300'
  }
};

export const STATUS_COLORS = {
  active: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700',
    dot: 'bg-emerald-500'
  },
  draft: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-500'
  },
  completed: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700',
    dot: 'bg-blue-500'
  }
};

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0
};

export const VIEW_MODES = {
  GRID: 'grid' as const,
  LIST: 'list' as const
};