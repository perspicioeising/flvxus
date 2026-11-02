'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Plus } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { registrarAgua } from '@/actions/habitos';

export interface CardAguaProps {
  /** Total consumido hoje (ml). */
  consumidoMl: number;
  /** Meta de hidratação do dia (ml). */
  targetMl: number;
  /** Percentual consumido frente à meta (0..100). */
  pct: number;
  /** `true` quando a meta do dia já foi atingida. */
  metaAtingida: boolean;
}

/** Quantidades rápidas de registro (ml). */
const ATALHOS_ML = [200, 250, 500] as const;

/**
 * Card de HIDRATAÇÃO no início do aluno. Mostra o consumido frente à meta do dia
 * (barra via `Progress` + tokens) e oferece botões rápidos (+200/+250/+500 ml)
 * que chamam `registrarAgua`. Durante a ação o card fica desabilitado
 * (`useTransition`); erro e sucesso aparecem via toast. Mobile-first (alvos
 * ≥ 44px). O estado é revalidado pelo servidor após cada registro.
 */
export function CardAgua({ consumidoMl, targetMl, pct, metaAtingida }: CardAguaProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  function registrar(amountMl: number) {
    iniciar(async () => {
      const r = await registrarAgua(amountMl);
      if (r.ok) {
        toast({ title: r.message ?? 'Água registrada.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível registrar a água.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
          <Droplets className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground">Hidratação</p>
          <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
            {consumidoMl} ml de {targetMl} ml
            {metaAtingida ? ' · meta atingida 🎉' : ''}
          </p>
        </div>
      </div>

      <Progress value={pct} aria-label="Progresso de hidratação do dia" />

      <div className="grid grid-cols-3 gap-2">
        {ATALHOS_ML.map((ml) => (
          <Button
            key={ml}
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => registrar(ml)}
            disabled={pendente}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {ml} ml
          </Button>
        ))}
      </div>
    </div>
  );
}
