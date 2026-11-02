import { Flame } from 'lucide-react';

export interface ContadorStreakProps {
  /** Sequência atual de dias consecutivos com aderência. */
  atual: number;
  /** Maior sequência já alcançada. */
  recorde: number;
}

/** Formata uma contagem de dias em pt-BR ("1 dia" / "N dias"). */
function formatarDias(n: number): string {
  return n === 1 ? '1 dia' : `${n} dias`;
}

/**
 * Contador de sequência (streak) de consistência, com ícone de chama. Mostra a
 * sequência atual em destaque e o recorde como apoio. Puramente apresentacional
 * (RSC-safe), mobile-first.
 */
export function ContadorStreak({ atual, recorde }: ContadorStreakProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Flame className="h-4 w-4" aria-hidden="true" />
        Sequência
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <Flame
            className="h-8 w-8 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="text-4xl font-black tabular-nums leading-none text-foreground">
            {atual}
          </span>
          <span className="text-sm text-muted-foreground">
            {atual === 1 ? 'dia' : 'dias'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Recorde: {formatarDias(recorde)}
        </p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {atual > 0
          ? 'Treine ou cumpra o descanso de hoje para manter a sequência.'
          : 'Conclua um treino para começar sua sequência.'}
      </p>
    </div>
  );
}
