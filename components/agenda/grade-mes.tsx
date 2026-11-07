'use client';

import * as React from 'react';
import { DIAS_SEMANA_CURTO, numeroDoDia } from '@/components/agenda/formatar';
import { diasDoIntervalo, somarDias, weekdayDeDia } from '@/lib/agenda/fuso';
import { resumoAguaPorDia } from '@/lib/agenda/agua';
import type { EventoAgenda } from '@/lib/agenda/tipos';

export interface GradeMesProps {
  diaInicio: string;
  diaFim: string;
  eventos: EventoAgenda[];
  hoje: string;
  selecionado: string;
  /** Tocar um dia abre a lista do dia. */
  onSelecionar: (dia: string) => void;
}

/** Dot colorido para indicar presença de um tipo de evento na célula do mês. */
function DotEvento({ cor, label }: { cor: string; label: string }) {
  return (
    <span
      className={`h-2 w-2 rounded-full ${cor}`}
      title={label}
      aria-hidden="true"
    />
  );
}

/** Grade 7×N do mês com dots coloridos por tipo de evento na célula. */
export function GradeMes({ diaInicio, diaFim, eventos, hoje, selecionado, onSelecionar }: GradeMesProps) {
  const inicioGrade = somarDias(diaInicio, -weekdayDeDia(diaInicio));
  const fimGrade = somarDias(diaFim, 6 - weekdayDeDia(diaFim));
  const dias = diasDoIntervalo(inicioGrade, fimGrade);
  const resumos = new Map(resumoAguaPorDia(eventos).map((r) => [r.dia, r]));

  const temOrigem = (dia: string, origem: EventoAgenda['origem']) =>
    eventos.some((e) => e.dia === dia && e.origem === origem && e.status !== 'cancelado');

  return (
    <div role="group" aria-label="Dias do mês" className="grid grid-cols-7 gap-1">
      {DIAS_SEMANA_CURTO.map((nome) => (
        <div key={nome} aria-hidden="true" className="py-1 text-center text-xs font-semibold text-muted-foreground">
          {nome}
        </div>
      ))}
      {dias.map((dia) => {
        const dentro = dia >= diaInicio && dia <= diaFim;
        const ativo = dia === selecionado;
        const resumoAgua = resumos.get(dia);
        const temAgua = resumoAgua && resumoAgua.total > 0;
        return (
          <button
            key={dia}
            type="button"
            aria-pressed={ativo}
            aria-label={`Dia ${numeroDoDia(dia)}${dia === hoje ? ', hoje' : ''}`}
            disabled={!dentro}
            onClick={() => onSelecionar(dia)}
            className={`flex min-h-16 min-w-0 flex-col items-start gap-1 rounded-lg border p-1 text-left ${
              ativo ? 'border-primary bg-primary/10' : 'border-border bg-card'
            } ${dentro ? '' : 'opacity-30'}`}
          >
            <span
              className={`text-xs font-bold tabular-nums ${dia === hoje ? 'text-primary' : 'text-foreground'}`}
            >
              {numeroDoDia(dia)}
            </span>
            {dentro ? (
              <div className="flex flex-wrap gap-0.5">
                {temOrigem(dia, 'treino') && (
                  <DotEvento cor="bg-primary" label="Treino" />
                )}
                {temOrigem(dia, 'refeicao') && (
                  <DotEvento cor="bg-warning" label="Refeição" />
                )}
                {temOrigem(dia, 'compromisso') && (
                  <DotEvento cor="bg-chart-4" label="Compromisso" />
                )}
                {temAgua && (
                  <DotEvento cor="bg-info" label="Água" />
                )}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
