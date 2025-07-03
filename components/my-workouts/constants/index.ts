export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sab' }
];

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Muito Fácil', color: 'text-green-500', emoji: '😊' },
  { value: 2, label: 'Fácil', color: 'text-green-400', emoji: '🙂' },
  { value: 3, label: 'Moderado', color: 'text-yellow-500', emoji: '😐' },
  { value: 4, label: 'Difícil', color: 'text-orange-500', emoji: '😓' },
  { value: 5, label: 'Muito Difícil', color: 'text-red-500', emoji: '😰' }
];

export const WORKOUT_GOALS = {
  'hipertrofia': { label: 'Hipertrofia', color: 'text-orange-600', icon: 'Dumbbell' },
  'emagrecimento': { label: 'Emagrecimento', color: 'text-red-600', icon: 'Zap' },
  'resistencia': { label: 'Resistência', color: 'text-blue-600', icon: 'Heart' },
  'forca': { label: 'Força', color: 'text-purple-600', icon: 'Trophy' },
  'condicionamento': { label: 'Condicionamento', color: 'text-green-600', icon: 'Target' }
};

export const WORKOUT_LEVELS = {
  'iniciante': { label: 'Iniciante', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'intermediario': { label: 'Intermediário', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  'avancado': { label: 'Avançado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
};
