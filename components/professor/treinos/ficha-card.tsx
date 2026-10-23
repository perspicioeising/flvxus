import Link from 'next/link';
import { ChevronRight, User } from 'lucide-react';

import type { PlanStatus } from '@/types/database.types';
import { StatusBadge } from './status-badge';
import { estaAgendada, formatarDataBr } from './labels';

export interface FichaCardData {
  id: string;
  name: string;
  status: PlanStatus;
  alunoNome: string | null;
  scheduledReleaseAt: string | null;
}

/** Cartão de FICHA na listagem. Link para o detalhe. Mostra aluno e status. */
export function FichaCard({ ficha }: { ficha: FichaCardData }) {
  return (
    <Link
      href={`/professor/treinos/${ficha.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 pr-12 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <User className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium text-foreground">{ficha.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {ficha.alunoNome ?? 'Aluno sem nome'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ficha.status} />
          {estaAgendada(ficha.status, ficha.scheduledReleaseAt) ? (
            <span className="text-xs text-muted-foreground">
              Agendada para {formatarDataBr(ficha.scheduledReleaseAt!)}
            </span>
          ) : null}
        </div>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
