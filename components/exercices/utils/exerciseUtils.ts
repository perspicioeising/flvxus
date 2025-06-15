// /utils/exerciseUtils.ts

import { Exercise, ExerciseStats, ExerciseFilters } from "@/components/exercices/types/exercise";
import { getMuscleGroupIcon, getExerciseMainIcon } from "@/components/exercices/components/constants/exercise";

/**
 * Formata valores de métricas de exercícios
 */
export function formatExerciseMetric(
  value: any[] | number | null | undefined,
  format: 'count' | 'text' = 'count'
): string {
  if (!value) return "0";
  
  if (Array.isArray(value)) {
    return value.length.toString();
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return "0";
}

/**
 * Calcula estatísticas de uma lista de exercícios
 */
export function calculateExerciseStats(exercises: Exercise[]): ExerciseStats {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const thisMonth = exercises.filter(exercise => {
    const exerciseDate = new Date(exercise.created_at);
    return exerciseDate.getMonth() === currentMonth &&
      exerciseDate.getFullYear() === currentYear;
  }).length;

  // Contar por grupo muscular
  const byMuscleGroup: Record<string, number> = {};
  exercises.forEach(exercise => {
    exercise.muscle_group.forEach(group => {
      byMuscleGroup[group] = (byMuscleGroup[group] || 0) + 1;
    });
  });

  // Contar por equipamento
  const byEquipment: Record<string, number> = {};
  exercises.forEach(exercise => {
    exercise.equipment.forEach(equipment => {
      byEquipment[equipment] = (byEquipment[equipment] || 0) + 1;
    });
  });

  return {
    total: exercises.length,
    thisMonth,
    byMuscleGroup,
    byEquipment
  };
}

/**
 * Filtra exercícios baseado nos critérios de busca
 */
export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters
): Exercise[] {
  return exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesMuscle =
      filters.muscleFilter === "all" ||
      exercise.muscle_group.includes(filters.muscleFilter);

    const matchesEquipment =
      filters.equipmentFilter === "all" ||
      exercise.equipment.includes(filters.equipmentFilter);

    return matchesSearch && matchesMuscle && matchesEquipment;
  });
}

/**
 * Obtém as iniciais do nome do exercício
 */
export function getExerciseInitials(name: string): string {
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Obtém o ícone principal do exercício
 */
export function getExerciseIcon(exercise: Exercise) {
  return getExerciseMainIcon(exercise.muscle_group);
}

/**
 * Obtém a cor do grupo muscular
 */
export function getMuscleGroupColor(group: string) {
  return getMuscleGroupIcon(group);
}

/**
 * Formata lista de grupos musculares para exibição
 */
export function formatMuscleGroups(groups: string[], maxDisplay: number = 3): {
  visible: string[];
  remaining: number;
} {
  return {
    visible: groups.slice(0, maxDisplay),
    remaining: Math.max(0, groups.length - maxDisplay)
  };
}

/**
 * Formata lista de equipamentos para exibição
 */
export function formatEquipmentList(equipment: string[]): string {
  if (equipment.length === 0) return "Nenhum equipamento";
  if (equipment.length <= 2) return equipment.join(", ");
  return `${equipment.slice(0, 2).join(", ")} +${equipment.length - 2}`;
}

/**
 * Verifica se o exercício tem conteúdo multimídia
 */
export function hasMultimedia(exercise: Exercise): {
  hasVideo: boolean;
  hasAudio: boolean;
  hasAny: boolean;
} {
  const hasVideo = Boolean(exercise.video_url);
  const hasAudio = Boolean(exercise.audio_url);
  
  return {
    hasVideo,
    hasAudio,
    hasAny: hasVideo || hasAudio
  };
}

/**
 * Obtém resumo do exercício para cards
 */
export function getExerciseSummary(exercise: Exercise) {
  const muscleInfo = formatMuscleGroups(exercise.muscle_group);
  const multimedia = hasMultimedia(exercise);
  const icon = getExerciseIcon(exercise);
  
  return {
    mainMuscleGroup: exercise.muscle_group[0] || "Geral",
    muscleGroups: muscleInfo,
    equipmentCount: exercise.equipment.length,
    variationsCount: exercise.variations?.length || 0,
    tipsCount: exercise.tips?.length || 0,
    multimedia,
    icon
  };
}