'use client';

import * as React from 'react';

import { toast } from '@/hooks/use-toast';
import { iniciarCheckout } from '@/actions/billing';
import { Button } from '@/components/ui/button';
import type { PlanTier } from '@/types/database.types';

export interface CheckoutButtonProps {
  tier: PlanTier;
  /** Rótulo do botão (ex.: "Assinar", "Trocar para este plano"). */
  label: string;
  /** Desabilita quando o plano não tem price configurado ou é o atual. */
  disabled?: boolean;
  variant?: 'default' | 'outline';
}

/**
 * Botão que inicia o checkout do Stripe para um tier. Chama `iniciarCheckout`
 * e redireciona o navegador para `session.url`. O enforcement/validação real
 * (gate master, price configurado) é no backend.
 */
export function CheckoutButton({ tier, label, disabled, variant = 'default' }: CheckoutButtonProps) {
  const [carregando, setCarregando] = React.useState(false);

  async function aoClicar() {
    setCarregando(true);
    try {
      const fd = new FormData();
      fd.append('tier', tier);
      const r = await iniciarCheckout(undefined, fd);
      if (r.ok && r.url) {
        window.location.assign(r.url);
        return;
      }
      toast({ title: r.message ?? 'Não foi possível iniciar o checkout.', variant: 'destructive' });
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className="min-h-11 w-full"
      disabled={disabled || carregando}
      onClick={aoClicar}
    >
      {carregando ? 'Redirecionando…' : label}
    </Button>
  );
}
