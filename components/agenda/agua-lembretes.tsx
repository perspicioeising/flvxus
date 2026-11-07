'use client';

import * as React from 'react';
import { ChevronDown, Droplets } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EventoCard, type EventoCardProps } from '@/components/agenda/evento-card';
import type { EventoAgenda } from '@/lib/agenda/tipos';

export interface AguaLembretesProps extends Omit<EventoCardProps, 'evento'> {
  /** Lembretes de água do dia (origem `agua`). */
  eventos: EventoAgenda[];
}

/** Bloco recolhível do dia: "Água · x/N" com a lista de lembretes. */
export function AguaLembretes({ eventos, ...cartao }: AguaLembretesProps) {
  const [aberto, setAberto] = React.useState(false);
  if (eventos.length === 0) return null;
  const feitos = eventos.filter((e) => e.status === 'concluido').length;
  return (
    <Collapsible open={aberto} onOpenChange={setAberto} className="rounded-2xl border border-border bg-card">
      <CollapsibleTrigger className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left">
        <Droplets className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold text-foreground tabular-nums">
          Água · {feitos}/{eventos.length}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-3 pb-3">
        {eventos.map((e) => (
          <EventoCard key={e.chave} evento={e} {...cartao} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
