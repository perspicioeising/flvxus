import { CheckCircle2, EyeOff } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { PlanStatus } from '@/types/database.types';
import { STATUS_LABEL, STATUS_VARIANTE, visivelAoAluno } from './labels';

/**
 * Selo de status da ficha. Server-safe (sem estado). Reforça visualmente se a
 * ficha está ou não visível ao aluno — só `released` fica visível.
 */
export function StatusBadge({ status }: { status: PlanStatus }) {
  const visivel = visivelAoAluno(status);
  const Icone = visivel ? CheckCircle2 : EyeOff;

  return (
    <Badge variant={STATUS_VARIANTE[status]} className="gap-1">
      <Icone className="h-3 w-3" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
