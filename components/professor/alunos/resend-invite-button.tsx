'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { reenviarConvite } from '@/actions/alunos';

/**
 * Botão "Reenviar convite", exibido na ficha de um aluno com status 'pending'
 * (convite enviado mas ainda não aceito). Reenvia o e-mail de convite.
 */
export function ResendInviteButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);

  async function reenviar() {
    setEnviando(true);
    try {
      const r = await reenviarConvite(userId);
      if (r.ok) {
        toast({ title: r.message ?? 'Convite reenviado.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível reenviar o convite.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11"
      onClick={reenviar}
      disabled={enviando}
    >
      <Send className="mr-2 h-4 w-4" aria-hidden="true" />
      {enviando ? 'Reenviando…' : 'Reenviar convite'}
    </Button>
  );
}
