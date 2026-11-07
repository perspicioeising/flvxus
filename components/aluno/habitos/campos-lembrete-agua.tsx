'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LEMBRETE_FIM_PADRAO_MIN,
  LEMBRETE_INICIO_PADRAO_MIN,
  LEMBRETE_INTERVALO_PADRAO_MIN,
} from '@/lib/agenda/agua';
import { INTERVALOS_LEMBRETE_AGUA } from '@/schemas/habitos';

/** Lembretes de água editáveis (minutos do dia para início/fim). */
export interface LembretesAguaValor {
  intervaloMin: number;
  inicioMin: number;
  fimMin: number;
}

export const LEMBRETES_AGUA_PADRAO: LembretesAguaValor = {
  intervaloMin: LEMBRETE_INTERVALO_PADRAO_MIN,
  inicioMin: LEMBRETE_INICIO_PADRAO_MIN,
  fimMin: LEMBRETE_FIM_PADRAO_MIN,
};

/** `480` → `08:00`. */
export function minutosParaHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** `08:00` → `480` (NaN se inválido). */
export function horaParaMinutos(hora: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hora);
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
}

function rotuloIntervalo(min: number): string {
  if (min < 60) return `${min} minutos`;
  const h = min / 60;
  return h === 1 ? '1 hora' : `${h} horas`;
}

export interface CamposLembreteAguaProps {
  /** Prefixo dos ids (evita colisão quando há mais de um form na tela). */
  idPrefixo: string;
  valor: LembretesAguaValor;
  onChange: (valor: LembretesAguaValor) => void;
  disabled?: boolean;
}

/** Intervalo, início e fim dos lembretes de água da Agenda (abaixo da meta). */
export function CamposLembreteAgua({ idPrefixo, valor, onChange, disabled }: CamposLembreteAguaProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">Lembretes na agenda</legend>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefixo}-intervalo`}>Intervalo</Label>
          <Select
            value={String(valor.intervaloMin)}
            onValueChange={(v) => onChange({ ...valor, intervaloMin: Number(v) })}
          >
            <SelectTrigger id={`${idPrefixo}-intervalo`} className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVALOS_LEMBRETE_AGUA.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {rotuloIntervalo(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefixo}-inicio`}>Início</Label>
          <Input
            id={`${idPrefixo}-inicio`}
            type="time"
            className="min-h-11"
            value={minutosParaHora(valor.inicioMin)}
            onChange={(e) => {
              const min = horaParaMinutos(e.target.value);
              if (!Number.isNaN(min)) onChange({ ...valor, inicioMin: min });
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefixo}-fim`}>Fim</Label>
          <Input
            id={`${idPrefixo}-fim`}
            type="time"
            className="min-h-11"
            value={minutosParaHora(valor.fimMin)}
            onChange={(e) => {
              const min = horaParaMinutos(e.target.value);
              if (!Number.isNaN(min)) onChange({ ...valor, fimMin: min });
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}
