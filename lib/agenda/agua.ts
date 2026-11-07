/**
 * Lembretes de água na Agenda — funções PURAS (sem I/O). Design: §8.3.
 * Lembrete k em `t_k = início + k·intervalo` (k = 0..N−1, `t_k ≤ fim`); status
 * CUMULATIVO pelo total do dia (não há vínculo lembrete↔registro).
 */

import { diaSP } from '@/lib/arena/datas';
import { diasDoIntervalo, instanteDeMinutos } from '@/lib/agenda/fuso';
import type { EventoAgenda } from '@/lib/agenda/tipos';
import { META_AGUA_DEFAULT_ML } from '@/lib/habitos/meta-agua';

/** Espelho dos defaults SQL de `water_goals` (migration 20261107090100). */
export const LEMBRETE_INICIO_PADRAO_MIN = 480;
export const LEMBRETE_FIM_PADRAO_MIN = 1320;
export const LEMBRETE_INTERVALO_PADRAO_MIN = 60;

export interface ConfigAgua {
  metaMl: number;
  inicioMin: number;
  fimMin: number;
  intervaloMin: number;
}

/** Config padrão (usuário sem linha em `water_goals`). */
export const CONFIG_AGUA_PADRAO: ConfigAgua = {
  metaMl: META_AGUA_DEFAULT_ML,
  inicioMin: LEMBRETE_INICIO_PADRAO_MIN,
  fimMin: LEMBRETE_FIM_PADRAO_MIN,
  intervaloMin: LEMBRETE_INTERVALO_PADRAO_MIN,
};

/** Número de lembretes do dia: floor((fim−início)/intervalo)+1 (0 se a config é inválida). */
export function quantidadeLembretes(c: Pick<ConfigAgua, 'inicioMin' | 'fimMin' | 'intervaloMin'>): number {
  if (c.intervaloMin <= 0 || c.fimMin < c.inicioMin) return 0;
  return Math.floor((c.fimMin - c.inicioMin) / c.intervaloMin) + 1;
}

/** Porção por lembrete: max(50, round(meta/N/50)·50) ml. */
export function porcaoMl(c: ConfigAgua): number {
  const n = quantidadeLembretes(c);
  if (n === 0) return 50;
  return Math.max(50, Math.round(c.metaMl / n / 50) * 50);
}

/** Acumulado esperado até o lembrete `k` (0-based): min(meta, (k+1)·porção). */
export function acumuladoEsperadoMl(c: ConfigAgua, k: number): number {
  return Math.min(c.metaMl, (k + 1) * porcaoMl(c));
}

export interface RegistroAgua {
  /** Dia-SP cru. */
  occurred_on: string;
  amount_ml: number;
}

export interface EntradaAguaAgenda {
  config: ConfigAgua;
  registros: RegistroAgua[];
  diaInicio: string;
  diaFim: string;
  hoje: string;
  tz: string;
  agora: Date;
}

/** Projeta os lembretes de água na janela local (inclusiva). */
export function projetarAgua(entrada: EntradaAguaAgenda): EventoAgenda[] {
  const { config, registros, diaInicio, diaFim, hoje, tz, agora } = entrada;
  const n = quantidadeLembretes(config);
  if (n === 0) return [];
  const porcao = porcaoMl(config);
  const totais = new Map<string, number>();
  for (const r of registros) totais.set(r.occurred_on, (totais.get(r.occurred_on) ?? 0) + r.amount_ml);
  const diaSPAgora = diaSP(agora);
  const eventos: EventoAgenda[] = [];

  for (const dia of diasDoIntervalo(diaInicio, diaFim)) {
    for (let k = 0; k < n; k += 1) {
      const instante = instanteDeMinutos(dia, config.inicioMin + k * config.intervaloMin, tz);
      const diaDoEvento = diaSP(instante);
      const total = diaDoEvento ? (totais.get(diaDoEvento) ?? 0) : 0;
      const esperado = acumuladoEsperadoMl(config, k);
      const status: EventoAgenda['status'] =
        total >= esperado ? 'concluido' : instante.getTime() < agora.getTime() ? 'atrasado' : 'previsto';
      eventos.push({
        chave: `agua:${dia}:${k}`,
        origem: 'agua',
        titulo: `Beber água · ${porcao} ml`,
        dia,
        inicio: instante.toISOString(),
        fim: null,
        status,
        acao:
          dia === hoje && status !== 'concluido' && diaDoEvento !== null && diaDoEvento === diaSPAgora
            ? { tipo: 'concluir_agua', ml: porcao }
            : null,
        meta: { indice: k, total: n, porcaoMl: porcao, acumuladoEsperadoMl: acumuladoEsperadoMl(config, k) },
      });
    }
  }
  return eventos;
}

export interface ResumoAguaDia {
  dia: string;
  concluidos: number;
  total: number;
}

/** Agrupa os lembretes por dia ("Água 8/15") para o chip das visões semana/mês. */
export function resumoAguaPorDia(eventos: EventoAgenda[]): ResumoAguaDia[] {
  const mapa = new Map<string, ResumoAguaDia>();
  for (const e of eventos) {
    if (e.origem !== 'agua') continue;
    const r = mapa.get(e.dia) ?? { dia: e.dia, concluidos: 0, total: 0 };
    r.total += 1;
    if (e.status === 'concluido') r.concluidos += 1;
    mapa.set(e.dia, r);
  }
  return [...mapa.values()].sort((a, b) => (a.dia < b.dia ? -1 : 1));
}
