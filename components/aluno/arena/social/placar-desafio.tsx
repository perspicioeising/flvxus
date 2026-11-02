import { Swords, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { diasRestantes } from '@/lib/arena/social';
import type { ChallengeScoreboard } from '@/types/database.types';

export interface PlacarDesafioProps {
  /** Placar do duelo (status 'ok'), já montado no servidor. */
  placar: ChallengeScoreboard;
  /** `user_id` do próprio atleta, para destacar sua linha. */
  meuUserId: string;
}

/** Formata um XP com separador de milhar pt-BR. */
function formatarXp(points: number): string {
  return new Intl.NumberFormat('pt-BR').format(points);
}

/** Inicial do nome para o fallback do avatar. */
function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || 'A';
}

/**
 * Placar AO VIVO de um duelo: eu vs. amigo, com XP do período (recomputado do
 * ledger pela função controlada) e countdown de dias restantes via
 * `diasRestantes(ends_on, agora)`. Puramente apresentacional (RSC-safe).
 */
export function PlacarDesafio({ placar, meuUserId }: PlacarDesafioProps) {
  const dias = diasRestantes(placar.ends_on, new Date());

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Swords className="h-4 w-4 text-primary" aria-hidden="true" />
          Duelo
        </p>
        <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground tabular-nums">
          <Timer className="h-3.5 w-3.5" aria-hidden="true" />
          {dias > 0 ? `${dias} ${dias === 1 ? 'dia' : 'dias'} restantes` : 'Encerrando'}
        </p>
      </div>

      <ul className="mt-3 divide-y divide-border">
        {placar.linhas.map((linha) => {
          const ehEu = linha.user_id === meuUserId;
          return (
            <li
              key={linha.user_id}
              className={cn(
                'flex items-center gap-3 py-2.5',
                ehEu && '-mx-2 rounded-xl bg-primary-soft px-2'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
                  ehEu
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {linha.posicao}
              </span>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={linha.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-xs font-bold">
                  {inicial(linha.display_name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                {linha.display_name}
                {ehEu ? (
                  <span className="ml-2 text-xs font-medium text-primary">você</span>
                ) : null}
                {!linha.accepted ? (
                  <span className="ml-2 text-xs font-medium text-muted-foreground">
                    aguardando aceite
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                {formatarXp(linha.points)} XP
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
