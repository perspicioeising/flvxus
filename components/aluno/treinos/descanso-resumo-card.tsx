'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Moon } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { confirmarDescanso } from '@/actions/execucao';

export interface DescansoResumoCardProps {
  /** Ficha cujo próximo passo da rotação é um descanso. */
  planId: string;
  /** Índice do passo de descanso em `rotation_steps` (para confirmar). */
  restStepIndex: number;
  /**
   * Quando o professor opera a tela em nome do aluno (treino presencial),
   * passa o `user_id` do aluno-alvo. Ausente = fluxo do próprio aluno.
   */
  targetStudentId?: string;
}

/**
 * Card "Hoje é descanso" no TOPO da ficha quando o próximo passo da rotação é um
 * descanso (FEAT-003). Explica o descanso e oferece o botão "Marcar descanso
 * como cumprido", que chama `confirmarDescanso` (padrão `EstadoAcao`) e
 * revalida — ao cumprir, a rotação avança para a próxima divisão. O botão fica
 * desabilitado durante a ação (`useTransition`). Mobile-first: alvo ≥ 44px.
 */
export function DescansoResumoCard({
  planId,
  restStepIndex,
  targetStudentId,
}: DescansoResumoCardProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  function marcar() {
    iniciar(async () => {
      const r = await confirmarDescanso(planId, restStepIndex, targetStudentId);
      if (r.ok) {
        toast({ title: r.message ?? 'Descanso registrado.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível registrar o descanso.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Moon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground">Hoje é descanso</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A rotação da sua ficha prevê um dia de descanso agora. Aproveite para
            recuperar. Ao cumprir, marque abaixo para seguir para o próximo
            treino.
          </p>
        </div>
      </div>
      <Button
        type="button"
        className="min-h-11 w-full"
        onClick={marcar}
        disabled={pendente}
      >
        {pendente ? 'Registrando…' : 'Marcar descanso como cumprido'}
      </Button>
    </div>
  );
}
