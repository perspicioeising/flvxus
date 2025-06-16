// components/workouts/constants/index.ts

import { 
  Target, 
  Dumbbell, 
  Activity, 
  Heart, 
  Zap, 
  Shield,
  TrendingUp,
  Award,
  Info,
  User,
  Settings,
  CheckCircle2
} from "lucide-react";
import type { WorkoutFormData, SelectedExercise, Exercise, WorkoutStep } from '../types';

// Workout creation steps
export const WORKOUT_STEPS: WorkoutStep[] = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    shortTitle: 'Básico',
    description: 'Nome e descrição do treino',
    icon: 'Info',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'goal',
    title: 'Nível e Objetivo',
    shortTitle: 'Objetivo',
    description: 'Defina o nível e objetivo do treino',
    icon: 'Target',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'exercises',
    title: 'Exercícios',
    shortTitle: 'Exercícios',
    description: 'Selecione e configure os exercícios',
    icon: 'Dumbbell',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'review',
    title: 'Revisão',
    shortTitle: 'Revisão',
    description: 'Revise e finalize o treino',
    icon: 'CheckCircle2',
    color: 'from-red-500 to-red-600'
  }
];

// Workout difficulty levels
export const DIFFICULTY_LEVELS = [
  { 
    value: "iniciante", 
    label: "Iniciante", 
    color: "from-green-500 to-emerald-600",
    description: "Para quem está começando",
    icon: User
  },
  { 
    value: "intermediario", 
    label: "Intermediário", 
    color: "from-yellow-500 to-orange-600",
    description: "Para quem já tem experiência",
    icon: Activity
  },
  { 
    value: "avancado", 
    label: "Avançado", 
    color: "from-red-500 to-red-600",
    description: "Para atletas experientes",
    icon: Award
  }
] as const;

// Workout goals
export const WORKOUT_GOALS = [
  { 
    value: "strength", 
    label: "Força", 
    icon: Dumbbell, 
    color: "from-blue-500 to-indigo-600",
    description: "Desenvolvimento de força máxima"
  },
  { 
    value: "hipertrofia", 
    label: "Hipertrofia", 
    icon: Activity, 
    color: "from-purple-500 to-purple-600",
    description: "Aumento da massa muscular"
  },
  { 
    value: "resistencia", 
    label: "Resistência", 
    icon: Heart, 
    color: "from-green-500 to-teal-600",
    description: "Melhora da capacidade cardiovascular"
  },
  { 
    value: "potencia", 
    label: "Potência", 
    icon: Zap, 
    color: "from-yellow-500 to-orange-600",
    description: "Desenvolvimento de explosão"
  },
  { 
    value: "emagrecimento", 
    label: "Emagrecimento", 
    icon: TrendingUp, 
    color: "from-pink-500 to-rose-600",
    description: "Perda de peso e definição"
  },
  { 
    value: "reabilitacao", 
    label: "Reabilitação", 
    icon: Shield, 
    color: "from-cyan-500 to-blue-600",
    description: "Recuperação e prevenção"
  }
] as const;

// Muscle groups
export const MUSCLE_GROUPS = [
  { value: "all", label: "Todos os Grupos" },
  { value: "peito", label: "Peitoral" },
  { value: "costas", label: "Costas" },
  { value: "pernas", label: "Pernas" },
  { value: "ombros", label: "Ombros" },
  { value: "bracos", label: "Braços" },
  { value: "core", label: "Core" },
  { value: "gluteos", label: "Glúteos" },
  { value: "panturrilhas", label: "Panturrilhas" }
] as const;

// Equipment types
export const EQUIPMENT_TYPES = [
  { value: "all", label: "Todos os Equipamentos" },
  { value: "peso_livre", label: "Peso Livre" },
  { value: "maquinas", label: "Máquinas" },
  { value: "peso_corporal", label: "Peso Corporal" },
  { value: "elasticos", label: "Elásticos" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "barra", label: "Barra" },
  { value: "halteres", label: "Halteres" },
  { value: "cabo", label: "Cabo" }
] as const;

// Color scheme for workouts module
export const WORKOUT_COLORS = {
  primary: "from-red-500 to-red-600",
  primaryHover: "hover:from-red-600 hover:to-red-700",
  primaryShadow: "hover:shadow-red-500/25",
  secondary: "from-rose-500 to-red-600",
  secondaryHover: "hover:from-rose-600 hover:to-red-700",
  accent: "from-orange-500 to-red-600",
  accentHover: "hover:from-orange-600 hover:to-red-700",
  background: "from-red-600/10 via-rose-500/10 to-orange-600/10",
  backgroundDark: "dark:from-red-500/10 dark:via-rose-400/10 dark:to-orange-500/10"
} as const;

// Default form values
export const DEFAULT_WORKOUT_FORM: WorkoutFormData = {
  name: "",
  description: "",
  level: "",
  goal: "",
  exercises: []
};

export const DEFAULT_EXERCISE_PARAMS: Omit<SelectedExercise, keyof Exercise> = {
  sets: 3,
  reps: 12,
  rest: 60,
  notes: "",
  order: 1
};

// API endpoints
export const API_ENDPOINTS = {
  workouts: "/api/workouts",
  exercises: "/api/exercises",
  workout: (id: string) => `/api/workouts/${id}`,
  workoutClone: (id: string) => `/api/workouts/${id}/clone`
} as const;

// Filter defaults
export const DEFAULT_EXERCISE_FILTERS = {
  search: "",
  muscleGroup: "all",
  equipment: "all"
};

// Validation rules
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    maxLength: 500
  },
  level: {
    required: true
  },
  goal: {
    required: true
  },
  exercises: {
    minLength: 1
  },
  sets: {
    min: 1,
    max: 10
  },
  reps: {
    min: 1,
    max: 100
  },
  rest: {
    min: 0,
    max: 600
  }
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Este campo é obrigatório",
  INVALID_NAME: "Nome deve ter entre 3 e 100 caracteres",
  INVALID_DESCRIPTION: "Descrição deve ter no máximo 500 caracteres",
  NO_EXERCISES: "Adicione pelo menos um exercício",
  INVALID_SETS: "Séries deve estar entre 1 e 10",
  INVALID_REPS: "Repetições deve estar entre 1 e 100",
  INVALID_REST: "Descanso deve estar entre 0 e 600 segundos",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  UNKNOWN_ERROR: "Ocorreu um erro inesperado"
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  WORKOUT_CREATED: "Treino criado com sucesso! 🎉",
  WORKOUT_UPDATED: "Treino atualizado com sucesso! ✅",
  WORKOUT_CLONED: "Treino clonado com sucesso! 📋",
  WORKOUT_DELETED: "Treino removido com sucesso! 🗑️"
} as const;

// Step icons mapping
export const STEP_ICONS = {
  Info,
  Target,
  Dumbbell,
  CheckCircle2,
  User,
  Settings
};