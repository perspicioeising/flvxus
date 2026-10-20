import Link from 'next/link';
import { ChevronRight, ClipboardList } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export interface ModeloCardData {
  id: string;
  name: string;
  description: string | null;
  totalItens: number;
}

/** Cartão de MODELO reutilizável na listagem. Link para o editor. */
export function ModeloCard({ modelo }: { modelo: ModeloCardData }) {
  return (
    <Link
      href={`/professor/modelos-treino/${modelo.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <ClipboardList className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium text-foreground">{modelo.name}</p>
        {modelo.description ? (
          <p className="truncate text-sm text-muted-foreground">{modelo.description}</p>
        ) : null}
        <Badge variant="secondary" className="font-normal">
          {modelo.totalItens} {modelo.totalItens === 1 ? 'exercício' : 'exercícios'}
        </Badge>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
