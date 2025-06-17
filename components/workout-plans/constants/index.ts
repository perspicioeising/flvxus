// constants/index.ts - Constantes centralizadas do módulo

export const DAYS_OF_WEEK = [
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
] as const;

export const PLAN_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'active', label: 'Ativo' },
  { value: 'completed', label: 'Concluído' },
] as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
} as const;

export const DEFAULT_FORM_DATA = {
  name: '',
  description: '',
  student_id: '',
  start_date: '',
  end_date: '',
} as const;

export const DEFAULT_FILTERS = {
  searchQuery: '',
  statusFilter: 'all' as const,
} as const;

// Configurações de animação
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Configurações de scroll infinito
export const INFINITE_SCROLL_CONFIG = {
  threshold: 200,
  pageSize: 10,
} as const;

// Cores do módulo (tema laranja)
export const MODULE_COLORS = {
  primary: {
    gradient: "from-orange-500 to-orange-600",
    hover: "hover:from-orange-600 hover:to-orange-700", 
    shadow: "hover:shadow-orange-500/25",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700",
  },
  secondary: {
    gradient: "from-amber-500 to-orange-500",
    hover: "hover:from-amber-600 hover:to-orange-600",
    shadow: "hover:shadow-amber-500/25",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-700",
  },
  accent: {
    gradient: "from-red-500 to-orange-500",
    hover: "hover:from-red-600 hover:to-orange-600",
    shadow: "hover:shadow-red-500/25",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-700",
  },
  success: {
    gradient: "from-green-500 to-green-600",
    hover: "hover:from-green-600 hover:to-green-700",
    shadow: "hover:shadow-green-500/25",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-700",
  },
  neutral: {
    gradient: "from-gray-500 to-gray-600",
    hover: "hover:from-gray-600 hover:to-gray-700",
    shadow: "hover:shadow-gray-500/25",
    text: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
  },
} as const;

// Breakpoints responsivos
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Configurações de toast
export const TOAST_MESSAGES = {
  plan: {
    created: 'Plano criado com sucesso! 🎉',
    cloned: 'Plano clonado com sucesso! 📋',
    updated: 'Plano atualizado com sucesso! ✅',
    deleted: 'Plano deletado com sucesso! 🗑️',
    error: {
      create: 'Erro ao criar plano',
      clone: 'Erro ao clonar plano',
      update: 'Erro ao atualizar plano',
      delete: 'Erro ao deletar plano',
      fetch: 'Erro ao buscar planos de treino',
    }
  },
  workouts: {
    error: {
      fetch: 'Erro ao buscar treinos',
    }
  },
  students: {
    error: {
      fetch: 'Erro ao buscar alunos',
    }
  }
} as const;

// Validação
export const VALIDATION_RULES = {
  name: {
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  planDuration: {
    minDays: 1,
    maxDays: 365,
  },
  workoutsPerPlan: {
    min: 1,
    max: 7,
  },
} as const;