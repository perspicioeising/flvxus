import { horaLocal, weekdayDeDia } from '@/lib/agenda/fuso';

/**
 * Formatadores de exibição da Agenda (pt-BR). Datas cruas `YYYY-MM-DD` nunca
 * passam por `new Date(string)` no fuso da máquina: usam `Date.UTC` e o
 * formatador em UTC (só calendário, sem hora).
 */

export const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const DIAS_SEMANA_LONGO = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

function utcDeDia(dia: string): Date {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

/** Ex.: `qua., 12 de novembro`. */
export function rotuloDia(dia: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(utcDeDia(dia));
}

/** Ex.: `novembro de 2026`. */
export function rotuloMes(dia: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    utcDeDia(dia)
  );
}

/** Número do dia do mês (`1`..`31`). */
export function numeroDoDia(dia: string): number {
  return Number(dia.slice(8, 10));
}

/** Nome curto do dia da semana de um dia cru. */
export function semanaCurta(dia: string): string {
  return DIAS_SEMANA_CURTO[weekdayDeDia(dia)];
}

/** Intervalo `HH:mm – HH:mm` no fuso do espectador (ou só o início). */
export function rotuloHorario(inicio: string | null, fim: string | null, tz: string): string | null {
  if (!inicio) return null;
  const ini = horaLocal(inicio, tz);
  return fim ? `${ini} – ${horaLocal(fim, tz)}` : ini;
}

/** Rótulo da visão para o cabeçalho. */
export function rotuloJanela(visao: 'dia' | 'semana' | 'mes', diaInicio: string, diaFim: string): string {
  if (visao === 'dia') return rotuloDia(diaInicio);
  if (visao === 'mes') return rotuloMes(diaInicio);
  return `${rotuloDia(diaInicio)} a ${rotuloDia(diaFim)}`;
}
