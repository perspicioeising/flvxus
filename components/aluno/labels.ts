import type { ExperienceLevel, GoalType } from '@/types/database.types';

/**
 * Rótulos pt-BR dos enums usados na área do aluno (architecture.md §9).
 * Mantidos juntos para reuso nas telas de início, perfil e evolução.
 */

/** Objetivo do aluno (enum `goal`). */
export const GOAL_LABEL: Record<GoalType, string> = {
  weight_loss: 'Emagrecimento',
  muscle_gain: 'Ganho de massa',
  maintenance: 'Manutenção',
  conditioning: 'Condicionamento',
  rehabilitation: 'Reabilitação',
  performance: 'Performance',
};

/** Nível de experiência do aluno (enum `experience_level`). */
export const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};
