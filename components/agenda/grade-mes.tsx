'use client';

import * as React from 'react';
import { AguaResumo } from '@/components/agenda/agua-resumo';
import { DIAS_SEMANA_CURTO, numeroDoDia } from '@/components/agenda/formatar';
import { diasDoIntervalo, somarDias, weekdayDeDia } from '@/lib/agenda/fuso';
import { resumoAguaPorDia } from '@/lib/agenda/agua';
import type { EventoAgenda, OrigemEvento } from '@/lib/agenda/tipos';

export interface GradeMesProps {
  diaInicio: string;
  diaFim: string;
  eventos: EventoAgenda[];
  hoje: string;
  selecionado: string;
  /** Tocar um dia abre a lista do dia. */
  onSelecionar: (dia: string) => void;
}

const SIGLA: Record<Exclude<OrigemEvento, 'agua'>, string> = {
  compromisso: 'Comp.',
  treino: 'Trein.',
  refeicao: 'Ref.',
};

/** Grade 7×N do mês com contagem por origem (água em chip). */
export function GradeMes({ diaInicio, diaFim, eventos, hoje, selecionado, onSelecionar }: GradeMesProps) {
  const inicioGrade = somarDias(diaInicio, -weekdayDeDia(diaInicio));
  const fimGrade = somarDias(diaFim, 6 - weekdayDeDia(diaFim));
  const dias = diasDoIntervalo(inicioGrade, fimGrade);
  const resumos = new Map(resumoAguaPorDia(eventos).map((r) => [r.dia, r]));

  const contar = (dia: string, origem: OrigemEvento) =>
    eventos.filter((e) => e.dia === dia && e.origem === origem && e.status !== 'cancelado').length;

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
        return (
          <button
            key={dia}
            type="button"
            aria-pressed={ativo}
            aria-label={`Dia ${numeroDoDia(dia)}${dia === hoje ? ', hoje' : ''}`}
            disabled={!dentro}
            onClick={() => onSelecionar(dia)}
            className={`flex min-h-16 min-w-0 flex-col items-start gap-0.5 rounded-lg border p-1 text-left text-[11px] ${
              ativo ? 'border-primary bg-primary/10' : 'border-border bg-card'
            } ${dentro ? '' : 'opacity-30'}`}
          >
            <span
              className={`text-xs font-bold tabular-nums ${dia === hoje ? 'text-primary' : 'text-foreground'}`}
            >
              {numeroDoDia(dia)}
            </span>
            {dentro
              ? (['compromisso', 'treino', 'refeicao'] as const).map((o) => {
                  const n = contar(dia, o);
                  return n > 0 ? (
                    <span key={o} className="truncate text-muted-foreground tabular-nums">
                      {SIGLA[o]} {n}
                    </span>
                  ) : null;
                })
              : null}
            {dentro ? <AguaResumo resumo={resumos.get(dia)} /> : null}
          </button>
        );
      })}
    </div>
  );
}
