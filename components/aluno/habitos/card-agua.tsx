'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Pencil, Plus } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { registrarAgua } from '@/actions/habitos';
import { EditarMetaAguaForm } from '@/components/aluno/habitos/editar-meta-agua';
import { useAcesso } from '@/components/billing/acesso-provider';

export interface CardAguaProps {
  /** Total consumido hoje (ml). */
  consumidoMl: number;
  /** Meta de hidratação do dia (ml). */
  targetMl: number;
  /** Percentual consumido frente à meta (0..100). */
  pct: number;
  /** `true` quando a meta do dia já foi atingida. */
  metaAtingida: boolean;
  /** Meta atual salva (ml) ou `null` — para o editar inline da própria meta. */
  metaAtualMl: number | null;
  /** Peso (kg) da última avaliação, para a sugestão quando não há meta salva. */
  pesoKg: number | null;
}

/** Quantidades rápidas de registro (ml). */
const ATALHOS_ML = [200, 250, 500] as const;

/**
 * Card de HIDRATAÇÃO no início do aluno. Mostra o consumido frente à meta do dia
 * (barra via `Progress` + tokens) e oferece botões rápidos (+200/+250/+500 ml)
 * que chamam `registrarAgua`. Durante a ação o card fica desabilitado
 * (`useTransition`); erro e sucesso aparecem via toast. Mobile-first (alvos
 * ≥ 44px). O estado é revalidado pelo servidor após cada registro.
 *
 * A edição da PRÓPRIA meta vive DENTRO do card: um ícone discreto de lápis no
 * topo-direito revela o form inline (`EditarMetaAguaForm`), que mantém toda a
 * regra de `source`/validação e chama `definirMetaAgua` SEM `alvoUserId`.
 */
export function CardAgua({
  consumidoMl,
  targetMl,
  pct,
  metaAtingida,
  metaAtualMl,
  pesoKg,
}: CardAguaProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const { podeEscrever } = useAcesso();
  const [editando, setEditando] = React.useState(false);

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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 text-muted-foreground"
          aria-label="Editar meta de água"
          aria-expanded={editando}
          onClick={() => setEditando((v) => !v)}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
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
            disabled={pendente || !podeEscrever}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {ml} ml
          </Button>
        ))}
      </div>

      {editando ? (
        <EditarMetaAguaForm
          metaAtualMl={metaAtualMl}
          pesoKg={pesoKg}
          onFechar={() => setEditando(false)}
        />
      ) : null}
    </div>
  );
}
