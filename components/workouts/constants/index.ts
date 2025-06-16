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
  Clock,
  Users
} from "lucide-react";
import type { WorkoutFormData, SelectedExercise, Exercise } from '../types';

// Workout difficulty levels
export const DIFFICULTY_LEVELS = [
  { 
    value: "iniciante", 
    label: "Iniciante", 
    color: "from-green-500 to-emerald-600",
    description: "Para quem está começando"
  },
  { 
    value: "intermediario", 
    label: "Intermediário", 
    color: "from-yellow-500 to-orange-600",
    description: "Para quem já tem experiência"
  },
  { 
    value: "avancado", 
    label: "Avançado", 
    color: "from-red-500 to-red-600",
    description: "Para atletas experientes"
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
  { value: "peito", label: "Peitoral", icon: Target },
  { value: "costas", label: "Costas", icon: Target },
  { value: "pernas", label: "Pernas", icon: Target },
  { value: "ombros", label: "Ombros", icon: Target },
  { value: "bracos", label: "Braços", icon: Target },
  { value: "core", label: "Core", icon: Target },
  { value: "gluteos", label: "Glúteos", icon: Target },
  { value: "panturrilhas", label: "Panturrilhas", icon: Target }
] as const;

// Equipment types
export const EQUIPMENT_TYPES = [
  { value: "peso_livre", label: "Peso Livre" },
  { value: "maquinas", label: "Máquinas" },
  { value: "peso_corporal", label: "Peso Corporal" },
  { value: "elasticos", label: "Elásticos" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "barra", label: "Barra" },
  { value: "halteres", label: "Halteres" },
  { value: "cabo", label: "Cabo" }
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "created_at", label: "Data de Criação" },
  { value: "updated_at", label: "Última Modificação" },
  { value: "level", label: "Nível" },
  { value: "goal", label: "Objetivo" }
] as const;

// Color scheme for workouts module
export const WORKOUT_COLORS = {
  primary: "from-pink-500 to-pink-600",
  primaryHover: "hover:from-pink-600 hover:to-pink-700",
  primaryShadow: "hover:shadow-pink-500/25",
  secondary: "from-rose-500 to-pink-600",
  secondaryHover: "hover:from-rose-600 hover:to-pink-700",
  accent: "from-purple-500 to-pink-600",
  accentHover: "hover:from-purple-600 hover:to-pink-700",
  background: "from-pink-600/10 via-rose-500/10 to-purple-600/10",
  backgroundDark: "dark:from-pink-500/10 dark:via-rose-400/10 dark:to-purple-500/10"
} as const;

// Statistics icons
export const STATS_CONFIG = [
  {
    key: "total",
    label: "Total",
    icon: Activity,
    color: "from-pink-500 to-rose-600",
    description: "Treinos criados"
  },
  {
    key: "exercises",
    label: "Exercícios",
    icon: Target,
    color: "from-purple-500 to-pink-600",
    description: "Total de exercícios"
  },
  {
    key: "average",
    label: "Média",
    icon: TrendingUp,
    color: "from-rose-500 to-pink-600",
    description: "Exercícios por treino"
  },
  {
    key: "levels",
    label: "Níveis",
    icon: Award,
    color: "from-indigo-500 to-purple-600",
    description: "Diferentes dificuldades"
  }
] as const;

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
  notes: ""
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1
} as const;

// API endpoints
export const API_ENDPOINTS = {
  workouts: "/api/workouts",
  exercises: "/api/exercises",
  workout: (id: string) => `/api/workouts/${id}`,
  workoutClone: (id: string) => `/api/workouts/${id}/clone`
} as const;

// Filter defaults
export const DEFAULT_FILTERS = {
  search: "",
  level: "all",
  goal: "all",
  sortBy: "created_at",
  sortOrder: "desc" as const
};

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

// Animation delays for staggered loading
export const ANIMATION_DELAYS = {
  stagger: 0.1,
  card: 0.3,
  skeleton: 1.5
} as const;