import Link from 'next/link';
import { CalendarOff, ChevronRight } from 'lucide-react';

/** Props do cartão de ficha legada sem treino para o dia de hoje. */
export interface CardFichaSemTreinoProps {
  /** Nome da ficha liberada. */
  fichaNome: string;
  /** Destino do cartão (detalhe da ficha, para escolher o dia). */
  href: string;
}

/**
 * Cartão de uma ficha ativa (legada, por dia) que NÃO tem treino prescrito para
 * hoje. Em vez de ocultar a ficha (regressão que fazia sumir uma das fichas do
 * aluno), mostramos um cartão discreto que leva ao detalhe da ficha, onde o
 * aluno escolhe o dia. Mobile-first: alvo ≥ 44px, todo o cartão é um link.
 */
export function CardFichaSemTreino({
  fichaNome,
  href,
}: CardFichaSemTreinoProps) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center gap-4 rounded-3xl border border-border bg-card p-5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <CalendarOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-foreground">
          {fichaNome}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Sem treino para hoje nesta ficha
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
