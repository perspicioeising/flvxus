'use client';

import * as React from 'react';

import { toast } from '@/hooks/use-toast';
import { abrirPortal } from '@/actions/billing';
import { Button } from '@/components/ui/button';

/** Abre o Customer Portal da Stripe (atualizar pagamento, cancelar, trocar de plano). */
export function PortalButton() {
  const [carregando, setCarregando] = React.useState(false);

  async function aoClicar() {
    setCarregando(true);
    try {
      const r = await abrirPortal();
      if (r.ok && r.url) {
        window.location.assign(r.url);
        return;
      }
      toast({ title: r.message ?? 'Não foi possível abrir o portal.', variant: 'destructive' });
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button type="button" variant="outline" className="min-h-11" disabled={carregando} onClick={aoClicar}>
      {carregando ? 'Abrindo…' : 'Gerenciar assinatura'}
    </Button>
  );
}
