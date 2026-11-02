import { Hourglass, Swords, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { diasRestantes } from '@/lib/arena/social';
import { ResultadoDesafio } from '@/components/aluno/arena/social/resultado-desafio';
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

/** Nome do oponente num duelo (a outra linha que não sou eu). */
function nomeOponente(placar: ChallengeScoreboard, meuUserId: string): string {
  const outro = placar.linhas.find((l) => l.user_id !== meuUserId);
  return outro?.display_name ?? 'um amigo';
}

/** Formata uma data `YYYY-MM-DD` (dia-SP) como DD/MM em pt-BR. */
function formatarDia(dia: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  if (!m) {
    return dia;
  }
  const data = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(data);
}

/**
 * Sede ÚNICA de render de um duelo não-convite, ramificando por
 * `placar.window_state`:
 * - `pending`  → card "Aguardando [oponente] aceitar" (sem ranking/countdown);
 * - `active`   → placar AO VIVO com período real (DD/MM a DD/MM), ranking das
 *   linhas e countdown via `diasRestantes(ends_on, agora)`;
 * - `finished` → compõe `ResultadoDesafio` (vencedor + medalha).
 * Puramente apresentacional (RSC-safe).
 */
export function PlacarDesafio({ placar, meuUserId }: PlacarDesafioProps) {
  if (placar.window_state === 'finished') {
    return <ResultadoDesafio placar={placar} meuUserId={meuUserId} />;
  }

  if (placar.window_state === 'pending') {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Hourglass className="h-4 w-4 text-primary" aria-hidden="true" />
          Duelo
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Aguardando{' '}
          <span className="font-semibold text-foreground">
            {nomeOponente(placar, meuUserId)}
          </span>{' '}
          aceitar
        </p>
      </div>
    );
  }

  const dias = diasRestantes(placar.ends_on, new Date());
  const periodo =
    placar.starts_on && placar.ends_on
      ? `Vale o XP de ${formatarDia(placar.starts_on)} a ${formatarDia(placar.ends_on)}`
      : null;

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

      {periodo ? (
        <p className="mt-1 text-xs text-muted-foreground">{periodo}</p>
      ) : null}

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
