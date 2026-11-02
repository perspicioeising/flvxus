import { Trophy, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { GamificationLeaderboard } from '@/types/database.types';

export interface LeaderboardArenaProps {
  /** Ranking do tenant, ou `null` quando a leitura falhou. */
  ranking: GamificationLeaderboard | null;
  /** `user_id` do próprio aluno, para destacar sua linha. */
  meuUserId: string;
}

/** Formata um XP com separador de milhar pt-BR. */
function formatarXp(xp: number): string {
  return new Intl.NumberFormat('pt-BR').format(xp);
}

/**
 * Ranking do tenant (temporada vigente). Antes de atingir o mínimo de
 * participantes (gate na função SQL, `active=false`), exibe o estado
 * "ranking em breve" com a contagem atual vs. o mínimo — sem nunca expor dados
 * privados de colegas. Puramente apresentacional (RSC-safe), mobile-first.
 */
export function LeaderboardArena({ ranking, meuUserId }: LeaderboardArenaProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Trophy className="h-4 w-4" aria-hidden="true" />
        Ranking da temporada
      </p>

      {ranking === null ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Não foi possível carregar o ranking agora. Tente novamente mais tarde.
        </p>
      ) : !ranking.active ? (
        <div className="mt-3 flex flex-col items-center gap-2 py-6 text-center">
          <span className="rounded-full bg-muted p-3 text-muted-foreground">
            <Users className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="text-base font-bold text-foreground">Ranking em breve</p>
          <p className="max-w-prose text-sm text-muted-foreground">
            O ranking liga quando houver pelo menos {ranking.minimo}{' '}
            participantes na academia. Agora são {ranking.participantes}.
          </p>
        </div>
      ) : ranking.linhas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Ainda não há pontuação nesta temporada. Comece a treinar para aparecer
          aqui.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {ranking.linhas.map((linha) => {
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
                <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                  {linha.full_name?.trim() || 'Aluno'}
                  {ehEu ? (
                    <span className="ml-2 text-xs font-medium text-primary">
                      você
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {formatarXp(linha.season_xp)} XP
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
