import { Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PodioTop3, type PodioEntrada } from '@/components/aluno/arena/podio-top3';
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
 * Ranking global (cross-tenant) da temporada mensal ou anual — também usado
 * pelo ranking de amigos (mesmo shape). Puramente apresentacional (RSC-safe),
 * mobile-first. Destaca a posição do próprio usuário no cabeçalho.
 *
 * Top 3: pódio fiel ao mock SVG (card único 2-1-3, #1 central maior+elevado com
 * coroa, anéis metálicos, avatares com foto e inicial no fallback) — via
 * `PodioTop3`, compartilhado com o ranking do tenant. Da 4ª posição em diante,
 * lista neutra (badge + avatar + nome + XP), com a linha do próprio usuário
 * realçada em verde. Só apresentação — a ordenação vem da função SQL.
 */
export function LeaderboardGlobal({
  ranking,
  meuUserId,
  titulo = 'Ranking global',
}: LeaderboardGlobalProps) {
  // Top 3 (pódio) e 4º+ (lista neutra), preservando a ordem da função SQL.
  const top3: PodioEntrada[] =
    ranking?.linhas
      .filter((linha) => linha.posicao <= 3)
      .map((linha) => ({
        posicao: linha.posicao,
        user_id: linha.user_id,
        nome: linha.display_name,
        xp: linha.points,
        avatarUrl: linha.avatar_url,
      })) ?? [];
  const resto = ranking?.linhas.filter((linha) => linha.posicao > 3) ?? [];

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
            <>
              {top3.length > 0 ? (
                <PodioTop3 entradas={top3} meuUserId={meuUserId} />
              ) : null}

              {resto.length > 0 ? (
                <ul className="mt-3 divide-y divide-border">
                  {resto.map((linha) => {
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
                          <AvatarImage
                            src={linha.avatar_url ?? undefined}
                            alt=""
                          />
                          <AvatarFallback className="text-xs font-bold">
                            {inicial(linha.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                          {linha.display_name}
                          {ehEu ? (
                            <span className="ml-2 text-xs font-medium text-primary">
                              você
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
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
