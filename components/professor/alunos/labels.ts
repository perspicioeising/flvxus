import type {
  ExperienceLevel,
  GoalType,
  StudentStatus,
} from '@/types/database.types';

/**
 * Rótulos pt-BR dos enums de aluno, compartilhados entre listagem, ficha e
 * formulários. Mantém a tradução em um só lugar.
 */

export const STATUS_LABEL: Record<StudentStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Convite pendente',
  archived: 'Arquivado',
};

export const EXPERIENCIA_LABEL: Record<ExperienceLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const OBJETIVO_LABEL: Record<GoalType, string> = {
  weight_loss: 'Emagrecimento',
  muscle_gain: 'Hipertrofia',
  maintenance: 'Manutenção',
  conditioning: 'Condicionamento',
  rehabilitation: 'Reabilitação',
  performance: 'Performance',
};

/** Variante do Badge por status (verde=ativo, neutro, destaque, etc.). */
export function statusBadgeVariant(
  status: StudentStatus | null
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending':
      return 'outline';
    case 'inactive':
    case 'archived':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function statusLabel(status: StudentStatus | null): string {
  return status ? STATUS_LABEL[status] : 'Sem status';
}
