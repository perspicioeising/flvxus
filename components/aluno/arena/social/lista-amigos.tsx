'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Users, X } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns';
import { responderSolicitacao } from '@/actions/arena-social';
import { MeuHandle } from '@/components/aluno/arena/social/meu-handle';
import { AdicionarAmigoDialog } from '@/components/aluno/arena/social/adicionar-amigo-dialog';
import type { FriendsList } from '@/types/database.types';

export interface ListaAmigosProps {
  /** Conexões sociais (contrato público), ou `null` quando a leitura falhou. */
  amigos: FriendsList | null;
  /** `@handle` atual do atleta, ou `null` quando ainda não definiu. */
  handleAtual: string | null;
}

/** Inicial do nome para o fallback do avatar. */
function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || 'A';
}

/**
 * Bloco "Amigos" da Arena: meu @handle (definir/compartilhar), adicionar por
 * @handle, solicitações recebidas (aceitar/recusar) e a lista de amigos aceitos
 * (contrato público — nome, avatar, nível e @handle). Toda ação chama
 * `responderSolicitacao` e revalida a Arena no servidor.
 */
export function ListaAmigos({ amigos, handleAtual }: ListaAmigosProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  function responder(
    requestId: string,
    acao: 'accept' | 'reject' | 'remove',
    sucesso: string
  ) {
    iniciar(async () => {
      const r = await responderSolicitacao(requestId, acao);
      if (r.ok) {
        toast({ title: sucesso });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível concluir a ação.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Users className="h-4 w-4" aria-hidden="true" />
        Amigos
      </p>

      <MeuHandle handleAtual={handleAtual} />

      <div className="flex justify-end">
        <AdicionarAmigoDialog />
      </div>

      {amigos === null ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar seus amigos agora.
        </p>
      ) : (
        <>
          {amigos.incoming.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Solicitações recebidas
              </p>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {amigos.incoming.map((s) => (
                  <li
                    key={s.request_id}
                    className="flex items-center gap-3 p-3"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={s.avatar_url ?? undefined} alt="" />
                      <AvatarFallback className="text-xs font-bold">
                        {inicial(s.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                      {s.display_name}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      className="min-h-11"
                      onClick={() =>
                        responder(s.request_id, 'accept', 'Solicitação aceita.')
                      }
                      disabled={pendente}
                      aria-label={`Aceitar ${s.display_name}`}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      onClick={() =>
                        responder(s.request_id, 'reject', 'Solicitação recusada.')
                      }
                      disabled={pendente}
                      aria-label={`Recusar ${s.display_name}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {amigos.accepted.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sem amigos ainda"
              description="Compartilhe seu @handle ou adicione alguém pelo handle para competir junto."
              className="rounded-3xl"
            />
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {amigos.accepted.map((a) => (
                <li key={a.friendship_id} className="flex items-center gap-3 p-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={a.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="text-xs font-bold">
                      {inicial(a.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-foreground">
                      {a.display_name}
                    </span>
                    {a.social_handle ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        @{a.social_handle}
                      </span>
                    ) : null}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11 text-muted-foreground"
                    onClick={() =>
                      responder(a.friendship_id, 'remove', 'Amizade removida.')
                    }
                    disabled={pendente}
                  >
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
