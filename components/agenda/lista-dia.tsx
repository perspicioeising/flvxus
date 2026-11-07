'use client';

import * as React from 'react';
import { CalendarX } from 'lucide-react';
import { EmptyState } from '@/components/patterns';
import { EventoCard, type EventoCardProps } from '@/components/agenda/evento-card';
import { AguaLembretes } from '@/components/agenda/agua-lembretes';
import { RefeicaoLembretes } from '@/components/agenda/refeicao-lembretes';
import type { EventoAgenda } from '@/lib/agenda/tipos';

export interface ListaDiaProps extends Omit<EventoCardProps, 'evento'> {
  /** Eventos de UM dia (já filtrados). */
  eventos: EventoAgenda[];
}

/** Ordena por horário; sem horário vai para a faixa própria. */
export function separarDoDia(eventos: EventoAgenda[]): {
  semHorario: EventoAgenda[];
  comHorario: EventoAgenda[];
  agua: EventoAgenda[];
  refeicoes: EventoAgenda[];
} {
  const agua = eventos.filter((e) => e.origem === 'agua');
  const refeicoes = eventos.filter((e) => e.origem === 'refeicao');
  const demais = eventos.filter((e) => e.origem !== 'agua' && e.origem !== 'refeicao');
  const semHorario = demais.filter((e) => e.inicio === null);
  const comHorario = demais
    .filter((e) => e.inicio !== null)
    .sort((a, b) => (a.inicio! < b.inicio! ? -1 : a.inicio! > b.inicio! ? 1 : 0));
  return { semHorario, comHorario, agua, refeicoes };
}

/** Lista de um dia: faixa "Sem horário" no topo, eventos por horário, refeições e água em accordeons. */
export function ListaDia({ eventos, ...cartao }: ListaDiaProps) {
  const { semHorario, comHorario, agua, refeicoes } = separarDoDia(eventos);
  if (eventos.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Nada neste dia"
        description="Nenhum compromisso ou atividade para esta data."
      />
    );
  }
  return (
    <div className="space-y-4">
      {semHorario.length > 0 ? (
        <section aria-label="Sem horário" className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sem horário
          </h3>
          {semHorario.map((e) => (
            <EventoCard key={e.chave} evento={e} {...cartao} />
          ))}
        </section>
      ) : null}
      {comHorario.length > 0 ? (
        <section aria-label="Com horário" className="space-y-2">
          {comHorario.map((e) => (
            <EventoCard key={e.chave} evento={e} {...cartao} />
          ))}
        </section>
      ) : null}
      <RefeicaoLembretes eventos={refeicoes} {...cartao} />
      <AguaLembretes eventos={agua} {...cartao} />
    </div>
  );
}
