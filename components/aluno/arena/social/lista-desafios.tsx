'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Swords, X } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns';
import { responderDuelo } from '@/actions/arena-social';
import { PlacarDesafio } from '@/components/aluno/arena/social/placar-desafio';
import { CriarDesafioDialog } from '@/components/aluno/arena/social/criar-desafio-dialog';
import type {
  ChallengeScoreboard,
  FriendsList,
} from '@/types/database.types';

export interface ListaDesafiosProps {
  /** Placares dos duelos do atleta (ativos/recentes), montados no servidor. */
  desafios: ChallengeScoreboard[];
  /** Amigos aceitos elegíveis a serem desafiados (para o dialog de criação). */
  amigos: FriendsList['accepted'];
  /** `user_id` do próprio atleta, para destacar e identificar convites. */
  meuUserId: string;
}

/** `true` quando o desafio é um convite pendente ao próprio atleta. */
function ehConvitePendente(sb: ChallengeScoreboard, meuUserId: string): boolean {
  if (sb.window_state !== 'pending') {
    return false;
  }
  const minhaLinha = sb.linhas.find((l) => l.user_id === meuUserId);
  return minhaLinha ? minhaLinha.accepted === false : false;
}

/** Nome do oponente num duelo (a outra linha que não sou eu). */
function nomeOponente(sb: ChallengeScoreboard, meuUserId: string): string {
  const outro = sb.linhas.find((l) => l.user_id !== meuUserId);
  return outro?.display_name ?? 'um amigo';
}

/**
 * Bloco "Desafios" da Arena: convites de duelo recebidos (aceitar/recusar) e
 * o botão "Desafiar amigo". Todos os demais duelos (pending aceito/active/
 * finished) são renderizados por `PlacarDesafio`, que ramifica internamente
 * por `window_state`. Degrada sozinho — alimentado pelos placares já montados
 * no servidor (lista vazia em falha).
 */
export function ListaDesafios({ desafios, amigos, meuUserId }: ListaDesafiosProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  const convites = desafios.filter((d) => ehConvitePendente(d, meuUserId));
  const demais = desafios.filter((d) => !ehConvitePendente(d, meuUserId));

  function responder(challengeId: string, aceitar: boolean) {
    iniciar(async () => {
      const r = await responderDuelo(challengeId, aceitar);
      if (r.ok) {
        toast({ title: aceitar ? 'Desafio aceito.' : 'Desafio recusado.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível responder o desafio.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Swords className="h-4 w-4" aria-hidden="true" />
          Desafios
        </p>
        <CriarDesafioDialog amigos={amigos} />
      </div>

      {convites.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Convites recebidos
          </p>
          <ul className="space-y-2">
            {convites.map((c) => (
              <li
                key={c.challenge_id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  <span className="font-semibold">
                    {nomeOponente(c, meuUserId)}
                  </span>{' '}
                  desafiou você
                </span>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-11"
                  onClick={() => responder(c.challenge_id, true)}
                  disabled={pendente}
                  aria-label="Aceitar desafio"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  onClick={() => responder(c.challenge_id, false)}
                  disabled={pendente}
                  aria-label="Recusar desafio"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {demais.map((d) => (
        <PlacarDesafio key={d.challenge_id} placar={d} meuUserId={meuUserId} />
      ))}

      {desafios.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="Nenhum desafio ainda"
          description="Desafie um amigo para um duelo de XP de 7, 15 ou 30 dias."
          className="rounded-3xl"
        />
      ) : null}
    </div>
  );
}
