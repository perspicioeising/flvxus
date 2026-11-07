'use client';

import * as React from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EventoCard, type EventoCardProps } from '@/components/agenda/evento-card';
import type { EventoAgenda } from '@/lib/agenda/tipos';

export interface RefeicaoLembretesProps extends Omit<EventoCardProps, 'evento'> {
  /** Refeições do dia (origem `refeicao`). */
  eventos: EventoAgenda[];
}

/** Bloco recolhível do dia: "Refeições · x/N" com a lista de refeições. */
export function RefeicaoLembretes({ eventos, ...cartao }: RefeicaoLembretesProps) {
  const [aberto, setAberto] = React.useState(false);
  if (eventos.length === 0) return null;
  const feitos = eventos.filter((e) => e.status === 'concluido').length;
  return (
    <Collapsible open={aberto} onOpenChange={setAberto} className="rounded-2xl border border-border bg-card">
      <CollapsibleTrigger className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left">
        <Utensils className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold text-foreground tabular-nums">
          Refeições · {feitos}/{eventos.length}
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
