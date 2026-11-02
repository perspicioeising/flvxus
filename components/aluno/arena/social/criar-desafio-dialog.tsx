'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Swords } from 'lucide-react';

import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { criarDuelo } from '@/actions/arena-social';
import type { FriendsList } from '@/types/database.types';

export interface CriarDesafioDialogProps {
  /** Amigos aceitos elegíveis a serem desafiados (contrato público). */
  amigos: FriendsList['accepted'];
}

/** Durações de duelo permitidas (dias). */
const DURACOES = [7, 15, 30] as const;

/**
 * Dialog "Desafiar amigo": escolhe um amigo aceito e a duração (7/15/30 dias) e
 * chama `criarDuelo`. Vence quem somar mais XP no período (dia-SP). O amigo
 * precisa aceitar o convite para o duelo valer.
 */
export function CriarDesafioDialog({ amigos }: CriarDesafioDialogProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const [aberto, setAberto] = React.useState(false);
  const [amigoId, setAmigoId] = React.useState('');
  const [dias, setDias] = React.useState<7 | 15 | 30>(7);

  function criar() {
    if (!amigoId) {
      toast({ title: 'Escolha um amigo para desafiar.', variant: 'destructive' });
      return;
    }
    iniciar(async () => {
      const r = await criarDuelo(amigoId, dias);
      if (r.ok && r.status === 'created') {
        toast({ title: 'Desafio criado. Aguarde o aceite do amigo.' });
        setAmigoId('');
        setAberto(false);
        router.refresh();
      } else if (r.status === 'duel_exists') {
        toast({
          title: 'Vocês já têm um duelo em andamento.',
          variant: 'destructive',
        });
      } else if (r.status === 'not_friends') {
        toast({ title: 'Vocês ainda não são amigos.', variant: 'destructive' });
      } else {
        toast({
          title: r.message ?? 'Não foi possível criar o desafio.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="min-h-11"
          disabled={amigos.length === 0}
        >
          <Swords className="mr-1 h-4 w-4" aria-hidden="true" />
          Desafiar amigo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desafiar um amigo</DialogTitle>
          <DialogDescription>
            Vence quem somar mais XP no período. Seu amigo precisa aceitar o
            convite para o duelo valer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label htmlFor="desafio-amigo">Amigo</Label>
          <Select value={amigoId} onValueChange={setAmigoId} disabled={pendente}>
            <SelectTrigger id="desafio-amigo">
              <SelectValue placeholder="Escolha um amigo" />
            </SelectTrigger>
            <SelectContent>
              {amigos.map((a) => (
                <SelectItem key={a.friendship_id} value={a.user_id}>
                  {a.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Duração</Label>
          <div className="grid grid-cols-3 gap-2">
            {DURACOES.map((d) => (
              <Button
                key={d}
                type="button"
                variant={dias === d ? 'default' : 'outline'}
                className={cn('min-h-11')}
                onClick={() => setDias(d)}
                disabled={pendente}
              >
                {d} dias
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="min-h-11"
            onClick={criar}
            disabled={pendente || !amigoId}
          >
            {pendente ? 'Criando…' : 'Criar desafio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
