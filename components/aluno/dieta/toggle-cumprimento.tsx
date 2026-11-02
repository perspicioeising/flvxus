'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { alternarRefeicaoCumprida } from '@/actions/habitos';

export interface ToggleCumprimentoProps {
  /** Refeição a marcar/desmarcar. */
  mealId: string;
  /** Dieta da marcação (a vigente no fluxo normal; a da marcação no bloco de despromovida). */
  dietId: string;
  /** Estado inicial (marcada hoje) resolvido no servidor. */
  marcada: boolean;
  /**
   * Quando `true`, o toggle só permite DESMARCAR (dieta despromovida no meio do
   * dia — reversibilidade RF3.2). A UI esconde a ação de marcar.
   */
  somenteDesmarcar?: boolean;
}

/**
 * Toggle "cumpri hoje" de uma refeição (G2). Chama `alternarRefeicaoCumprida`
 * (padrão `EstadoAcao`) — a action resolve marcar/desmarcar pelo estado do dia.
 * Durante a ação fica desabilitado (`useTransition`); o estado é revalidado pelo
 * servidor. Mobile-first (alvo ≥ 44px).
 */
export function ToggleCumprimento({
  mealId,
  dietId,
  marcada,
  somenteDesmarcar = false,
}: ToggleCumprimentoProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  function alternar() {
    iniciar(async () => {
      const r = await alternarRefeicaoCumprida(mealId, dietId);
      if (r.ok) {
        toast({ title: r.message ?? 'Refeição atualizada.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível atualizar a refeição.',
          variant: 'destructive',
        });
      }
    });
  }

  const rotulo = marcada
    ? somenteDesmarcar
      ? 'Desmarcar'
      : 'Cumpri hoje'
    : 'Marcar como cumprida';

  return (
    <Button
      type="button"
      variant={marcada ? 'default' : 'outline'}
      className={cn('min-h-11 w-full', marcada && 'justify-center')}
      onClick={alternar}
      disabled={pendente}
      aria-pressed={marcada}
    >
      {marcada ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : null}
      {pendente ? 'Salvando…' : rotulo}
    </Button>
  );
}
