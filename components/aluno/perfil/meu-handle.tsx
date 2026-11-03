'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AtSign } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { definirHandle } from '@/actions/arena-social';

export interface MeuHandleProps {
  /** `@handle` atual do atleta, ou `null` quando ainda não definiu. */
  handleAtual: string | null;
}

/**
 * Bloco "meu @handle": mostra o handle público do atleta (para compartilhar) e
 * permite defini-lo/alterá-lo. É o identificador que amigos usam para enviar
 * solicitações (não há busca por nome — D2). Chama `definirHandle`, que grava em
 * `profiles.social_handle` do próprio usuário sob RLS. A normalização (minúsculas,
 * sem `@`) é feita na borda e no banco.
 */
export function MeuHandle({ handleAtual }: MeuHandleProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const [aberto, setAberto] = React.useState(false);
  const [valor, setValor] = React.useState(handleAtual ?? '');

  function salvar() {
    iniciar(async () => {
      const r = await definirHandle(valor);
      if (r.ok) {
        toast({ title: 'Nome de usuário salvo.' });
        setAberto(false);
        router.refresh();
      } else {
        toast({
          title:
            r.message ??
            (r.status === 'em_uso'
              ? 'Esse nome de usuário já está em uso.'
              : 'Não foi possível salvar o nome de usuário.'),
          variant: 'destructive',
        });
      }
    });
  }

  if (!aberto) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-0 items-center gap-2">
          <AtSign className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {handleAtual ? (
            <span className="truncate text-sm font-semibold text-foreground">
              @{handleAtual}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Defina seu nome de usuário para receber solicitações.
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 shrink-0"
          onClick={() => setAberto(true)}
        >
          {handleAtual ? 'Alterar' : 'Definir nome de usuário'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="space-y-1">
        <Label htmlFor="meu-handle">Seu nome de usuário</Label>
        <Input
          id="meu-handle"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="ex.: joao_arena"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={pendente}
        />
        <p className="text-xs text-muted-foreground">
          3 a 30 caracteres: letras minúsculas, números ou _.
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 text-muted-foreground"
          onClick={() => setAberto(false)}
          disabled={pendente}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          className="min-h-11"
          onClick={salvar}
          disabled={pendente}
        >
          {pendente ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
