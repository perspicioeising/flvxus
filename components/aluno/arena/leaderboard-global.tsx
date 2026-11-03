import { Crown, Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  badgeMetal,
  metalDaPosicao,
  ringMetal,
  textoMetal,
} from '@/lib/arena/podio';
import type { GamificationGlobalLeaderboard } from '@/types/database.types';

export interface LeaderboardGlobalProps {
  /** Ranking global (cross-tenant), ou `null` quando a leitura falhou. */
  ranking: GamificationGlobalLeaderboard | null;
  /** `user_id` do próprio aluno, para destacar sua linha. */
  meuUserId: string;
  /** Título opcional do cartão (padrão: "Ranking global"). */
  titulo?: string;
}

/** Formata um XP com separador de milhar pt-BR. */
function formatarXp(points: number): string {
  return new Intl.NumberFormat('pt-BR').format(points);
}

/** Inicial do nome exibido, para o fallback do avatar. */
function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || 'A';
}

/**
 * Ranking global (cross-tenant) da temporada mensal ou anual. Puramente
 * apresentacional (RSC-safe), mobile-first. Destaca a posição do próprio
 * usuário no cabeçalho e realça sua linha na lista. Não reaplica fallback de
 * nome: usa `display_name` direto (já resolvido pela função SQL).
 *
 * Pódio (top 3): ouro/prata/bronze no anel do avatar, no badge da posição e no
 * XP; o #1 ganha um ícone de coroa. A linha do PRÓPRIO usuário continua no verde
 * da marca (tem prioridade sobre o metal). Da 4ª posição em diante, estilo
 * neutro. Só apresentação — a ordenação vem da função SQL.
 */
export function LeaderboardGlobal({
  ranking,
  meuUserId,
  titulo = 'Ranking global',
}: LeaderboardGlobalProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Trophy className="h-4 w-4" aria-hidden="true" />
        {titulo}
      </p>

      {ranking === null ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Não foi possível carregar o ranking agora.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {ranking.me
              ? `Você está em #${ranking.me.posicao}`
              : 'Sem XP nesta temporada ainda'}
          </p>

          {ranking.total === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Ainda não há pontuação nesta temporada. Comece a treinar para
              aparecer aqui.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {ranking.linhas.map((linha) => {
                const ehEu = linha.user_id === meuUserId;
                // Pódio só colore quem NÃO é o próprio usuário (a linha "você"
                // mantém prioridade no verde da marca).
                const metal = ehEu ? null : metalDaPosicao(linha.posicao);
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
                          : metal
                            ? badgeMetal(metal)
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {linha.posicao}
                    </span>
                    <div className="relative shrink-0">
                      <Avatar
                        className={cn('h-8 w-8', metal && ringMetal(metal))}
                      >
                        <AvatarImage
                          src={linha.avatar_url ?? undefined}
                          alt=""
                        />
                        <AvatarFallback className="text-xs font-bold">
                          {inicial(linha.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      {metal === 'ouro' ? (
                        <Crown
                          className="absolute -right-1.5 -top-2 h-4 w-4 text-amber-400"
                          aria-label="Primeiro lugar"
                        />
                      ) : null}
                    </div>
                    <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                      {linha.display_name}
                      {ehEu ? (
                        <span className="ml-2 text-xs font-medium text-primary">
                          você
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-sm font-bold tabular-nums',
                        metal ? textoMetal(metal) : 'text-foreground'
                      )}
                    >
                      {formatarXp(linha.points)} XP
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
