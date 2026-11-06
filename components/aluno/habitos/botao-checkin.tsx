'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { fazerCheckin } from '@/actions/habitos';
import { useAcesso } from '@/components/billing/acesso-provider';

export interface BotaoCheckinProps {
  /** `true` quando o aluno já fez check-in hoje (dia-SP). */
  jaFezHoje: boolean;
}

/**
 * Botão de CHECK-IN diário no início do aluno. Quando ainda não houve check-in
 * hoje, oferece "Fazer check-in" (chama `fazerCheckin`, padrão `EstadoAcao`);
 * quando já houve, mostra o estado "Check-in de hoje feito" desabilitado. A ação
 * é idempotente no banco (`on conflict do nothing`); o estado é revalidado pelo
 * servidor. Mobile-first (alvo ≥ 44px).
 */
export function BotaoCheckin({ jaFezHoje }: BotaoCheckinProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const { podeEscrever } = useAcesso();

  function marcar() {
    iniciar(async () => {
      const r = await fazerCheckin();
      if (r.ok) {
        toast({ title: r.message ?? 'Check-in registrado.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível fazer o check-in.',
          variant: 'destructive',
        });
      }
    });
  }

  if (jaFezHoje) {
    return (
      <Button type="button" variant="secondary" className="min-h-11 w-full" disabled>
        <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
        Check-in de hoje feito
      </Button>
    );
  }

  return (
    <Button
      type="button"
      className="min-h-11 w-full"
      onClick={marcar}
      disabled={pendente || !podeEscrever}
    >
      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
      {pendente ? 'Registrando…' : 'Fazer check-in'}
    </Button>
  );
}
