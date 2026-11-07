import { Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ResumoAguaDia } from '@/lib/agenda/agua';

/** Chip "Água 8/15" das visões semana e mês (nunca 15 itens por célula). */
export function AguaResumo({ resumo }: { resumo: ResumoAguaDia | undefined }) {
  if (!resumo || resumo.total === 0) return null;
  return (
    <Badge variant="outline" className="gap-1 tabular-nums">
      <Droplets className="h-3 w-3" aria-hidden="true" />
      Água {resumo.concluidos}/{resumo.total}
    </Badge>
  );
}
