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