/**
 * Leitura validada de `searchParams` da Agenda (puro). `data` é um dia cru
 * `YYYY-MM-DD` validado por `diaValido` (nunca passa por `new Date(string)`).
 */
import { diaValido, type VisaoAgenda } from '@/lib/agenda/fuso';

const VISOES: readonly VisaoAgenda[] = ['dia', 'semana', 'mes'];

function primeiro(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Visão válida ou `dia` (padrão). */
export function visaoDeParametro(v: string | string[] | undefined): VisaoAgenda {
  const valor = primeiro(v);
  return VISOES.includes(valor as VisaoAgenda) ? (valor as VisaoAgenda) : 'dia';
}

/** Dia cru válido ou `undefined` (a carga usa "hoje" no fuso do usuário). */
export function dataDeParametro(v: string | string[] | undefined): string | undefined {
  const valor = primeiro(v);
  return valor && diaValido(valor) ? valor : undefined;
}
