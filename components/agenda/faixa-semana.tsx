'use client';

import * as React from 'react';
import { EventoCard, type EventoCardProps } from '@/components/agenda/evento-card';
import { ListaDia, separarDoDia } from '@/components/agenda/lista-dia';
import { AguaResumo } from '@/components/agenda/agua-resumo';
import { numeroDoDia, semanaCurta } from '@/components/agenda/formatar';
import { resumoAguaPorDia } from '@/lib/agenda/agua';
import type { EventoAgenda } from '@/lib/agenda/tipos';

export interface FaixaSemanaProps extends Omit<EventoCardProps, 'evento'> {
  /** Os 7 dias (domingo–sábado), `YYYY-MM-DD`. */
  dias: string[];
  eventos: EventoAgenda[];
  hoje: string;
  selecionado: string;
  onSelecionar: (dia: string) => void;
}

/**
 * Visão semana. Mobile: 7 chips de dia + lista do dia selecionado. `md+`:
 * uma coluna por dia (água como chip de resumo, nunca 15 itens).
 */
export function FaixaSemana({
  dias,
  eventos,
  hoje,
  selecionado,
  onSelecionar,
  ...cartao
}: FaixaSemanaProps) {
  const porDia = (dia: string) => eventos.filter((e) => e.dia === dia);
  const resumos = new Map(resumoAguaPorDia(eventos).map((r) => [r.dia, r]));

  return (
    <div className="space-y-3">
      <div className="md:hidden">
        <div role="group" aria-label="Dias da semana" className="grid grid-cols-7 gap-1">
          {dias.map((dia) => {
            const ativo = dia === selecionado;
            const qtd = porDia(dia).filter((e) => e.origem !== 'agua').length;
            return (
              <button
                key={dia}
                type="button"
                aria-pressed={ativo}
                aria-label={`${semanaCurta(dia)} ${numeroDoDia(dia)}${dia === hoje ? ', hoje' : ''}, ${qtd} eventos`}
                onClick={() => onSelecionar(dia)}
                className={`flex min-h-11 flex-col items-center justify-center rounded-xl border px-1 py-1 text-xs ${
                  ativo
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span>{semanaCurta(dia)}</span>
                <span className="text-sm font-bold tabular-nums">{numeroDoDia(dia)}</span>
                <span className="text-[10px] tabular-nums">{qtd > 0 ? `${qtd}•` : ' '}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <ListaDia eventos={porDia(selecionado)} {...cartao} />
        </div>
      </div>
      <div className="hidden gap-2 md:grid md:grid-cols-7">
        {dias.map((dia) => {
          const { semHorario, comHorario } = separarDoDia(porDia(dia));
          return (
            <section
              key={dia}
              aria-label={`${semanaCurta(dia)} ${numeroDoDia(dia)}`}
              className="min-w-0 space-y-2"
            >
              <h3
                className={`text-center text-xs font-semibold uppercase ${
                  dia === hoje ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {semanaCurta(dia)} {numeroDoDia(dia)}
              </h3>
              <AguaResumo resumo={resumos.get(dia)} />
              {[...semHorario, ...comHorario].map((e) => (
                <EventoCard key={e.chave} evento={e} {...cartao} />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
