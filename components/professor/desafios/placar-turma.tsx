import { Medal, Timer } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { diasRestantes, rotuloResultado } from '@/lib/arena/social';
import type { ChallengeScoreboard } from '@/types/database.types';

export interface PlacarTurmaProps {
  /** Placar do desafio da turma (status 'ok'), já montado no servidor. */
  placar: ChallengeScoreboard;
  /** Mostra o rótulo de resultado por aluno (apenas quando 'finished'). */
  compacto?: boolean;
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
 * Placar de um desafio da TURMA (kind='coach'), na ótica do professor (criador,
 * que não compete). Lista os alunos ordenados pelo XP do período (recomputado
 * do ledger pela função controlada), com countdown de dias restantes enquanto
 * `active` e o resultado consolidado (medalha/rótulo) quando `finished`.
 * Puramente apresentacional (RSC-safe).
 */
export function PlacarTurma({ placar, compacto = false }: PlacarTurmaProps) {
  const encerrado = placar.challenge_status === 'finished';
  const dias = diasRestantes(placar.ends_on, new Date());

  return (
    <ul className="divide-y divide-border">
      {placar.linhas.map((linha) => {
        const venceu = encerrado && linha.result === 'won';
        const xp = encerrado ? linha.final_xp ?? linha.points : linha.points;
        return (
          <li key={linha.user_id} className="flex items-center gap-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              {venceu ? (
                <Medal className="h-5 w-5 text-primary" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular-nums',
                    'bg-muted text-muted-foreground'
                  )}
                >
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
              </span>
              <span className="block text-xs text-muted-foreground tabular-nums">
                {formatarXp(xp)} XP
              </span>
            </span>
            {encerrado && !compacto ? (
              <Badge
                variant={venceu ? 'default' : 'secondary'}
                className="shrink-0"
              >
                {rotuloResultado(linha.result)}
              </Badge>
            ) : null}
          </li>
        );
      })}

      {placar.linhas.length === 0 ? (
        <li className="py-3 text-sm text-muted-foreground">
          Nenhum aluno neste desafio.
        </li>
      ) : null}

      {!encerrado ? (
        <li className="flex items-center gap-1 pt-3 text-xs font-semibold text-muted-foreground tabular-nums">
          <Timer className="h-3.5 w-3.5" aria-hidden="true" />
          {dias > 0
            ? `${dias} ${dias === 1 ? 'dia' : 'dias'} restantes`
            : 'Encerrando'}
        </li>
      ) : null}
    </ul>
  );
}
