import { Medal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { rotuloResultado } from '@/lib/arena/social';
import type { ChallengeScoreboard } from '@/types/database.types';

export interface ResultadoDesafioProps {
  /** Placar de um duelo FINALIZADO (challenge_status === 'finished'). */
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
 * Resultado de um duelo encerrado: mostra o vencedor (com medalha) e o rótulo
 * de resultado (Vitória/Derrota/Empate) de cada membro. Lê `result`/`final_xp`,
 * que só são significativos quando o desafio está `finished`. Puramente
 * apresentacional (RSC-safe).
 */
export function ResultadoDesafio({ placar, meuUserId }: ResultadoDesafioProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Medal className="h-4 w-4 text-primary" aria-hidden="true" />
        Resultado do duelo
      </p>

      <ul className="mt-3 divide-y divide-border">
        {placar.linhas.map((linha) => {
          const ehEu = linha.user_id === meuUserId;
          const venceu = linha.result === 'won';
          const xp = linha.final_xp ?? linha.points;
          return (
            <li
              key={linha.user_id}
              className={cn(
                'flex items-center gap-3 py-2.5',
                ehEu && '-mx-2 rounded-xl bg-primary-soft px-2'
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                {venceu ? (
                  <Medal className="h-5 w-5 text-primary" aria-hidden="true" />
                ) : (
                  <span className="text-sm font-bold tabular-nums text-muted-foreground">
                    {linha.posicao}
                  </span>
                )}
              </span>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={linha.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-xs font-bold">
                  {inicial(linha.display_name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">
                  {linha.display_name}
                  {ehEu ? (
                    <span className="ml-2 text-xs font-medium text-primary">
                      você
                    </span>
                  ) : null}
                </span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {formatarXp(xp)} XP
                </span>
              </span>
              <Badge variant={venceu ? 'default' : 'secondary'} className="shrink-0">
                {rotuloResultado(linha.result)}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
