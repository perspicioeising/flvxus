// /constants/physical-assessment.ts

import { BodyProtocol, MeasurementFields } from '@/types/physical-assessment';

export const BODY_PROTOCOLS: BodyProtocol[] = [
  {
    value: "jackson_pollock_3",
    label: "Jackson & Pollock (3 dobras)",
    gender: "both",
    description: "Protocolo padrão - H: peito, abdômen, coxa / M: tríceps, supra-ilíaca, coxa",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    value: "jackson_pollock_7",
    label: "Jackson & Pollock (7 dobras)",
    gender: "both", 
    description: "Protocolo mais preciso com 7 pontos de medição",
    color: "from-indigo-600 to-indigo-700"
  },
  {
    value: "durnin_womersley",
    label: "Durnin & Womersley",
    gender: "both",
    description: "4 dobras: tríceps, bíceps, subescapular, supra-ilíaca",
    color: "from-indigo-500 to-blue-600"
  },
  {
    value: "slaughter",
    label: "Slaughter et al.",
    gender: "both",
    description: "Para crianças/adolescentes: tríceps e subescapular",
    color: "from-blue-500 to-indigo-600"
  },
  {
    value: "boileau", 
    label: "Boileau et al.",
    gender: "youth",
    description: "Para jovens: tríceps e subescapular",
    color: "from-blue-600 to-indigo-700"
  },
  {
    value: "guedes_1994",
    label: "Guedes 1994",
    gender: "both",
    description: "H: tríceps, supra-ilíaca, abdominal / M: subescapular, supra-ilíaca, coxa",
    color: "from-indigo-500 to-purple-600"
  }
];

export const MEASUREMENT_FIELDS: MeasurementFields = {
  circumferences: [
    { key: 'neck', label: 'Pescoço', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'shoulders', label: 'Ombros', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'chest', label: 'Tórax', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'chest_circ', label: 'Circunf. Tórax', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'waist', label: 'Cintura', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'hips', label: 'Quadril', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'left_arm', label: 'Braço Esquerdo', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'right_arm', label: 'Braço Direito', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'left_thigh', label: 'Coxa Esquerda', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'right_thigh', label: 'Coxa Direita', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'left_calf', label: 'Panturrilha Esq.', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' },
    { key: 'right_calf', label: 'Panturrilha Dir.', unit: 'cm', icon: '🔵', color: 'from-indigo-500 to-indigo-600' }
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
    color: 'from-indigo-500 to-indigo-600' 
  },
  { 
    id: 'protocol', 
    title: 'Protocolo', 
    shortTitle: 'Protocolo',
    description: 'Escolher método de avaliação',
    icon: 'Calculator', 
    color: 'from-indigo-600 to-indigo-700' 
  },
  { 
    id: 'measurements', 
    title: 'Medidas', 
    shortTitle: 'Medidas',
    description: 'Inserir medidas corporais',
    icon: 'Ruler', 
    color: 'from-indigo-500 to-blue-600' 
  },
  { 
    id: 'results', 
    title: 'Resultados', 
    shortTitle: 'Resultados',
    description: 'Ver composição corporal',
    icon: 'BarChart3', 
    color: 'from-blue-500 to-indigo-600' 
  },
  { 
    id: 'analysis', 
    title: 'Análise IA', 
    shortTitle: 'IA',
    description: 'Análise inteligente',
    icon: 'Brain', 
    color: 'from-indigo-600 to-purple-600' 
  }
];

export const RESULTS_METRICS = [
  {
    key: 'bmi',
    label: 'IMC',
    color: 'from-indigo-500 to-indigo-600',
    icon: 'Scale',
    maxValue: 35
  },
  {
    key: 'fatPercentage', 
    label: '% Gordura',
    color: 'from-blue-500 to-indigo-600',
    icon: 'BarChart3',
    maxValue: 35,
    suffix: '%'
  },
  {
    key: 'fatMass',
    label: 'M. Gorda', 
    color: 'from-indigo-600 to-blue-600',
    icon: 'Weight',
    suffix: 'kg'
  },
  {
    key: 'leanMass',
    label: 'M. Magra',
    color: 'from-blue-600 to-indigo-700', 
    icon: 'Activity',
    suffix: 'kg'
  }
];