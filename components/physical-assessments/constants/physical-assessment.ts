// /constants/physical-assessment.ts

import { BodyProtocol, MeasurementFields } from '@/components/physical-assessments/types/physical-assessment';

export const BODY_PROTOCOLS: BodyProtocol[] = [
  {
    value: "jackson_pollock_3",
    label: "Jackson & Pollock (3 dobras)",
    gender: "both",
    description: "Protocolo padrão - H: peito, abdômen, coxa / M: tríceps, supra-ilíaca, coxa",
    color: "from-green-500 to-green-600"
  },
  {
    value: "jackson_pollock_7",
    label: "Jackson & Pollock (7 dobras)",
    gender: "both", 
    description: "Protocolo mais preciso com 7 pontos de medição",
    color: "from-green-600 to-green-700"
  },
  {
    value: "durnin_womersley",
    label: "Durnin & Womersley",
    gender: "both",
    description: "4 dobras: tríceps, bíceps, subescapular, supra-ilíaca",
    color: "from-green-500 to-emerald-600"
  },
  {
    value: "slaughter",
    label: "Slaughter et al.",
    gender: "both",
    description: "Para crianças/adolescentes: tríceps e subescapular",
    color: "from-emerald-500 to-green-600"
  },
  {
    value: "boileau", 
    label: "Boileau et al.",
    gender: "youth",
    description: "Para jovens: tríceps e subescapular",
    color: "from-emerald-600 to-green-700"
  },
  {
    value: "guedes_1994",
    label: "Guedes 1994",
    gender: "both",
    description: "H: tríceps, supra-ilíaca, abdominal / M: subescapular, supra-ilíaca, coxa",
    color: "from-green-500 to-emerald-600"
  }
];

export const MEASUREMENT_FIELDS: MeasurementFields = {
  circumferences: [
    { key: 'neck', label: 'Pescoço', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'shoulders', label: 'Ombros', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'chest', label: 'Tórax', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'chest_circ', label: 'Circunf. Tórax', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'waist', label: 'Cintura', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'hips', label: 'Quadril', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'left_arm', label: 'Braço Esquerdo', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'right_arm', label: 'Braço Direito', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'left_thigh', label: 'Coxa Esquerda', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'right_thigh', label: 'Coxa Direita', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'left_calf', label: 'Panturrilha Esq.', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' },
    { key: 'right_calf', label: 'Panturrilha Dir.', unit: 'cm', icon: '🔵', color: 'from-green-500 to-green-600' }
  ],
  skinfolds: [
    { key: 'triceps', label: 'Tríceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'durnin_womersley', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'biceps', label: 'Bíceps', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley'], color: 'from-yellow-500 to-orange-500' },
    { key: 'subscapular', label: 'Subescapular', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7', 'durnin_womersley', 'slaughter', 'boileau', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'abdominal', label: 'Abdominal', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'suprailiac', label: 'Supra-ilíaca', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'durnin_womersley', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'midaxillary', label: 'Axilar Média', unit: 'mm', icon: '🟡', required: ['jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' },
    { key: 'thigh', label: 'Coxa', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7', 'guedes_1994'], color: 'from-yellow-500 to-orange-500' },
    { key: 'chest', label: 'Peitoral', unit: 'mm', icon: '🟡', required: ['jackson_pollock_3', 'jackson_pollock_7'], color: 'from-yellow-500 to-orange-500' }
  ]
};

export const ASSESSMENT_STEPS = [
  { 
    id: 'basic', 
    title: 'Dados Básicos', 
    shortTitle: 'Básico',
    description: 'Selecionar aluno e dados iniciais',
    icon: 'User', 
    color: 'from-green-500 to-green-600' 
  },
  { 
    id: 'protocol', 
    title: 'Protocolo', 
    shortTitle: 'Protocolo',
    description: 'Escolher método de avaliação',
    icon: 'Calculator', 
    color: 'from-green-600 to-green-700' 
  },
  { 
    id: 'measurements', 
    title: 'Medidas', 
    shortTitle: 'Medidas',
    description: 'Inserir medidas corporais',
    icon: 'Ruler', 
    color: 'from-green-600 to-green-700' 
  },
  { 
    id: 'results', 
    title: 'Resultados', 
    shortTitle: 'Resultados',
    description: 'Ver composição corporal',
    icon: 'BarChart3', 
    color: 'from-emerald-500 to-green-600' 
  },
  { 
    id: 'analysis', 
    title: 'Análise IA', 
    shortTitle: 'IA',
    description: 'Análise inteligente com IA',
    icon: 'Brain', 
    color: 'from-green-600 to-emerald-600' 
  }
];

export const RESULTS_METRICS = [
  {
    key: 'bmi',
    label: 'IMC',
    color: 'from-green-500 to-green-600',
    icon: 'Scale',
    maxValue: 35
  },
  {
    key: 'fatPercentage', 
    label: '% Gordura',
    color: 'from-emerald-500 to-green-600',
    icon: 'BarChart3',
    maxValue: 35,
    suffix: '%'
  },
  {
    key: 'fatMass',
    label: 'M. Gorda', 
    color: 'from-green-600 to-emerald-600',
    icon: 'Weight',
    suffix: 'kg'
  },
  {
    key: 'leanMass',
    label: 'M. Magra',
    color: 'from-emerald-600 to-green-700', 
    icon: 'Activity',
    suffix: 'kg'
  }
];

// ===== NOVAS CONSTANTES PARA LISTAGEM =====

export const PROTOCOLS: Record<string, string> = {
  'jackson_pollock_3': 'Jackson & Pollock (3 dobras)',
  'jackson_pollock_7': 'Jackson & Pollock (7 dobras)',
  'durnin_womersley': 'Durnin & Womersley',
  'slaughter': 'Slaughter et al.',
  'boileau': 'Boileau et al.',
  'guedes_1994': 'Guedes 1994',
};

export const MEASUREMENT_LABELS = {
  // Circunferências
  neck: 'Pescoço',
  shoulders: 'Ombros',
  chest: 'Tórax',
  chest_circ: 'Circunf. Tórax',
  waist: 'Cintura',
  abdomen: 'Abdômen',
  hips: 'Quadril',
  left_arm: 'Braço Esquerdo',
  right_arm: 'Braço Direito',
  left_thigh: 'Coxa Esquerda',
  right_thigh: 'Coxa Direita',
  left_calf: 'Panturrilha Esq.',
  right_calf: 'Panturrilha Dir.',
  // Dobras cutâneas
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  subscapular: 'Subescapular',
  abdominal: 'Abdominal',
  suprailiac: 'Supra-ilíaca',
  midaxillary: 'Axilar Média',
  thigh: 'Coxa'
} as const;

// Métricas para os cards mobile/desktop
export const ASSESSMENT_METRICS = [
  {
    key: 'bmi',
    label: "IMC",
    colors: "from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "📊",
    format: "decimal" as const
  },
  {
    key: 'fat_percentage',
    label: "Gordura",
    colors: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
    text: "text-red-600 dark:text-red-400",
    icon: "🔥",
    format: "percentage" as const
  },
  {
    key: 'lean_mass',
    label: "M. Magra",
    colors: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    text: "text-green-600 dark:text-green-400",
    icon: "💪",
    format: "kg" as const
  },
  {
    key: 'weight',
    label: "Peso",
    colors: "from-emerald-50 to-pink-50 dark:from-emerald-900/20 dark:to-pink-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "⚖️",
    format: "kg" as const
  }
];

// Filtros de data
export const DATE_FILTERS = [
  { value: 'all', label: 'Todos os Períodos' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' }
] as const;

// Classificações de gordura corporal
export const FAT_PERCENTAGE_CLASSIFICATIONS = {
  male: [
    { min: 0, max: 6, label: 'Muito Baixo', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' },
    { min: 6, max: 14, label: 'Atlético', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
    { min: 14, max: 18, label: 'Fitness', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' },
    { min: 18, max: 25, label: 'Aceitável', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' },
    { min: 25, max: 100, label: 'Elevado', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' }
  ],
  female: [
    { min: 0, max: 16, label: 'Muito Baixo', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' },
    { min: 16, max: 21, label: 'Atlético', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
    { min: 21, max: 25, label: 'Fitness', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' },
    { min: 25, max: 32, label: 'Aceitável', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' },
    { min: 32, max: 100, label: 'Elevado', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' }
  ]
} as const;