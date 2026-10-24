import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { formatarData } from '@/lib/datas';
import { StatusBadge } from '@/components/patterns';

/** Dados mínimos de uma ficha liberada para o card da lista. */
export interface FichaResumo {
  id: string;
  name: string;
  releasedAt: string | null;
  totalExercicios: number;
  /** Se há item prescrito para o dia da semana atual. */
  temTreinoHoje: boolean;
  /** Dia da semana atual (0..6), para montar o link "Treinar hoje". */
  weekdayAtual: number;
  /** Letra/marcador exibido à esquerda (ex.: "A", "B"...). */
  letra: string;
}

/**
 * Card de uma ficha liberada na lista de treinos do aluno: letra grande à
 * esquerda, nome + contagem ao centro, selo "PRÓXIMO" e seta. Todo o card é
 * um link para o detalhe. Mobile-first: alvos ≥ 44px.
 */
export function FichaCard({ ficha }: { ficha: FichaResumo }) {
  return (
    <Link
      href={`/aluno/treinos/${ficha.id}`}
      className="flex min-h-11 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-3xl font-black text-primary-soft-foreground">
        {ficha.letra}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-bold text-foreground">
            {ficha.name}
          </p>
          {ficha.temTreinoHoje ? (
            <StatusBadge tone="brand">Próximo</StatusBadge>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Liberada em {formatarData(ficha.releasedAt)} ·{' '}
          {ficha.totalExercicios === 1
            ? '1 exercício'
            : `${ficha.totalExercicios} exercícios`}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
