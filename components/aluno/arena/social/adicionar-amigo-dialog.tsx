'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { enviarSolicitacaoPorHandle } from '@/actions/arena-social';

/**
 * Dialog para adicionar um amigo por `@handle`. Não há busca por nome (D2):
 * é preciso saber o handle exato, compartilhado fora da plataforma. Chama
 * `enviarSolicitacaoPorHandle` e repassa o `status` do RPC a uma mensagem
 * neutra pt-BR — `not_found` nunca revela se o handle existe (anti-enumeração).
 */
export function AdicionarAmigoDialog() {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const [aberto, setAberto] = React.useState(false);
  const [handle, setHandle] = React.useState('');

  function enviar() {
    iniciar(async () => {
      const r = await enviarSolicitacaoPorHandle(handle);
      if (r.ok && r.status === 'sent') {
        toast({ title: 'Solicitação enviada.' });
        setHandle('');
        setAberto(false);
        router.refresh();
      } else if (r.status === 'already') {
        toast({ title: 'Vocês já têm uma conexão.' });
        setAberto(false);
        router.refresh();
      } else if (r.status === 'not_found') {
        toast({
          title: 'Não encontramos esse nome de usuário.',
          variant: 'destructive',
        });
      } else if (r.status === 'handle_invalido') {
        toast({
          title: 'Nome de usuário inválido. Use 3 a 30 caracteres (a-z, 0-9, _).',
          variant: 'destructive',
        });
      } else {
        toast({
          title: r.message ?? 'Não foi possível enviar a solicitação.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="min-h-11">
          <UserPlus className="mr-1 h-4 w-4" aria-hidden="true" />
          Adicionar por nome de usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar amigo</DialogTitle>
          <DialogDescription>
            Digite o nome de usuário exato de quem você quer adicionar. Peça o
            nome de usuário diretamente à pessoa — não há busca por nome.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Label htmlFor="adicionar-handle">Nome de usuário</Label>
          <Input
            id="adicionar-handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="ex.: maria_fit"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={pendente}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="min-h-11"
            onClick={enviar}
            disabled={pendente || handle.trim().length === 0}
          >
            {pendente ? 'Enviando…' : 'Enviar solicitação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
