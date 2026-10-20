import Link from 'next/link';
import { ChevronRight, Dumbbell, Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export interface ExerciseCardData {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string[];
  /** `null` = exercício do catálogo global (somente leitura). */
  tenant_id: string | null;
}

/**
 * Cartão de exercício da biblioteca. Link para o detalhe. Exercícios globais
 * (`tenant_id` nulo) exibem um selo de somente-leitura; os botões de editar e
 * excluir ficam apenas no detalhe (e também bloqueados lá).
 */
export function ExerciseCard({ exercicio }: { exercicio: ExerciseCardData }) {
  const ehGlobal = exercicio.tenant_id === null;
  const grupos = exercicio.muscle_groups ?? [];
  const equipamentos = exercicio.equipment ?? [];

  return (
    <Link
      href={`/professor/exercicios/${exercicio.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Dumbbell className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-foreground">{exercicio.name}</p>
          {ehGlobal ? (
            <Badge variant="outline" className="shrink-0 gap-1">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Catálogo
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {grupos.slice(0, 3).map((grupo) => (
            <Badge key={grupo} variant="secondary" className="font-normal">
              {grupo}
            </Badge>
          ))}
          {equipamentos.slice(0, 2).map((equip) => (
            <Badge key={equip} variant="outline" className="font-normal">
              {equip}
            </Badge>
          ))}
        </div>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}
