import { UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/** Selo "responsável desativado": o personal do atendimento perdeu o acesso (visível ao master). */
export function SeloResponsavelDesativado() {
  return (
    <Badge variant="outline" className="gap-1">
      <UserX className="h-3 w-3" aria-hidden="true" />
      Responsável desativado
    </Badge>
  );
}
