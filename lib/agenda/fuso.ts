/**
 * Fuso horário da Agenda — funções PURAS (sem I/O), parametrizadas por `tz`
 * (nome IANA). Nunca usa o fuso da máquina nem `new Date('YYYY-MM-DD')`: dias
 * crus `YYYY-MM-DD` só são validados e manipulados por aritmética de calendário
 * em UTC (`Date.UTC`), jamais reconvertidos por fuso. Design: §7.
 */

/** Visões da agenda. */
export type VisaoAgenda = 'dia' | 'semana' | 'mes';

const DIA_CRU = /^(\d{4})-(\d{2})-(\d{2})$/;
const HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

const MS_DIA = 86_400_000;

/** Ano bissexto (calendário gregoriano). */
function bissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

/** Quantidade de dias de um mês (`mes` 1–12). */
export function diasNoMes(ano: number, mes: number): number {
  const tabela = [31, bissexto(ano) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return tabela[mes - 1];
}

/** `true` quando `valor` é um `YYYY-MM-DD` de calendário real. */
export function diaValido(valor: string): boolean {
  const m = DIA_CRU.exec(valor);
  if (!m) return false;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1) return false;
  return dia <= diasNoMes(ano, mes);
}

/** `true` quando `valor` é `HH:mm` (00:00–23:59). */
export function horaValida(valor: string): boolean {
  return HORA.test(valor);
}

function partesDia(dia: string): { ano: number; mes: number; dia: number } {
  if (!diaValido(dia)) throw new RangeError(`Dia inválido: ${dia}`);
  return { ano: Number(dia.slice(0, 4)), mes: Number(dia.slice(5, 7)), dia: Number(dia.slice(8, 10)) };
}

function formatarDia(ms: number): string {
  const d = new Date(ms);
  const a = String(d.getUTCFullYear()).padStart(4, '0');
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const x = String(d.getUTCDate()).padStart(2, '0');
  return `${a}-${m}-${x}`;
}

/** Soma `n` dias (pode ser negativo) a um dia cru, por aritmética de calendário em UTC. */
export function somarDias(dia: string, n: number): string {
  const p = partesDia(dia);
  return formatarDia(Date.UTC(p.ano, p.mes - 1, p.dia) + n * MS_DIA);
}

/** Dia da semana de um dia cru: 0 = domingo … 6 = sábado (independe do servidor). */
export function weekdayDeDia(dia: string): number {
  const p = partesDia(dia);
  return new Date(Date.UTC(p.ano, p.mes - 1, p.dia)).getUTCDay();
}

/** Valida um nome de fuso IANA suportado pelo runtime. */
export function validarTz(tz: string): boolean {
  if (typeof tz !== 'string' || tz.trim() === '') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const cacheFormatadores = new Map<string, Intl.DateTimeFormat>();

function formatador(tz: string): Intl.DateTimeFormat {
  let f = cacheFormatadores.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    cacheFormatadores.set(tz, f);
  }
  return f;
}

interface ParteLocal {
  ano: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
  segundo: number;
}

function partesLocais(ms: number, tz: string): ParteLocal {
  const mapa: Record<string, number> = {};
  for (const p of formatador(tz).formatToParts(new Date(ms))) {
    if (p.type !== 'literal') mapa[p.type] = Number(p.value);
  }
  return {
    ano: mapa.year,
    mes: mapa.month,
    dia: mapa.day,
    hora: mapa.hour % 24,
    minuto: mapa.minute,
    segundo: mapa.second,
  };
}

/** Offset (ms) do `tz` em relação a UTC no instante `ms`. */
function offsetMs(ms: number, tz: string): number {
  const p = partesLocais(ms, tz);
  const comoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return comoUtc - Math.floor(ms / 1000) * 1000;
}

/** Dia local (`YYYY-MM-DD`) de um instante no fuso `tz`. */
export function diaLocal(instante: Date | string, tz: string): string {
  const ms = instante instanceof Date ? instante.getTime() : new Date(instante).getTime();
  if (Number.isNaN(ms)) throw new RangeError('Instante inválido');
  const p = partesLocais(ms, tz);
  return `${String(p.ano).padStart(4, '0')}-${String(p.mes).padStart(2, '0')}-${String(p.dia).padStart(2, '0')}`;
}

/** Hora local (`HH:mm`) de um instante no fuso `tz`. */
export function horaLocal(instante: Date | string, tz: string): string {
  const ms = instante instanceof Date ? instante.getTime() : new Date(instante).getTime();
  if (Number.isNaN(ms)) throw new RangeError('Instante inválido');
  const p = partesLocais(ms, tz);
  return `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`;
}

/**
 * Instante (UTC) em que o relógio de parede de `tz` marca `dia` + `hora`.
 * Resolve o offset do fuso em torno do horário (antes e depois, ±1 dia) e
 * confere qual candidato reproduz exatamente a hora de parede pedida:
 * - hora REPETIDA (fim do horário de verão): usa a PRIMEIRA (instante menor);
 * - LACUNA (início do horário de verão, hora inexistente): avança para a
 *   primeira hora válida (aplica o offset de antes da lacuna).
 */
export function instanteDeLocal(dia: string, hora: string, tz: string): Date {
  const p = partesDia(dia);
  const m = HORA.exec(hora);
  if (!m) throw new RangeError(`Hora inválida: ${hora}`);
  const alvo = Date.UTC(p.ano, p.mes - 1, p.dia, Number(m[1]), Number(m[2]));
  const offsets = Array.from(
    new Set([offsetMs(alvo - MS_DIA, tz), offsetMs(alvo + MS_DIA, tz)])
  ).sort((a, b) => b - a); // maior offset primeiro → instante mais cedo
  const candidatos = offsets
    .map((o) => alvo - o)
    .filter((t) => {
      const l = partesLocais(t, tz);
      return Date.UTC(l.ano, l.mes - 1, l.dia, l.hora, l.minuto) === alvo;
    })
    .sort((a, b) => a - b);
  if (candidatos.length > 0) return new Date(candidatos[0]);
  // Lacuna: offset de ANTES da transição (o menor) joga o relógio para depois dela.
  return new Date(alvo - offsets[offsets.length - 1]);
}

/** Instante de um minuto-do-dia (0..1439) em `dia` no `tz`. */
export function instanteDeMinutos(dia: string, minutos: number, tz: string): Date {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mi = String(minutos % 60).padStart(2, '0');
  return instanteDeLocal(dia, `${h}:${mi}`, tz);
}

/** `[inicio, fim)` do dia local em instantes. */
export function intervaloDoDia(dia: string, tz: string): { inicio: Date; fim: Date } {
  return {
    inicio: instanteDeLocal(dia, '00:00', tz),
    fim: instanteDeLocal(somarDias(dia, 1), '00:00', tz),
  };
}

export interface JanelaVisao {
  /** Primeiro dia local da janela (inclusivo). */
  diaInicio: string;
  /** Último dia local da janela (inclusivo). */
  diaFim: string;
  /** Instante inicial (inclusivo). */
  inicio: Date;
  /** Instante final (exclusivo). */
  fim: Date;
}

/** Janela da visão: dia, semana (domingo–sábado) ou mês que contém `dia`. */
export function janelaDaVisao(visao: VisaoAgenda, dia: string, tz: string): JanelaVisao {
  let diaInicio: string;
  let diaFim: string;
  if (visao === 'dia') {
    diaInicio = dia;
    diaFim = dia;
  } else if (visao === 'semana') {
    diaInicio = somarDias(dia, -weekdayDeDia(dia));
    diaFim = somarDias(diaInicio, 6);
  } else {
    const p = partesDia(dia);
    const mm = String(p.mes).padStart(2, '0');
    diaInicio = `${String(p.ano).padStart(4, '0')}-${mm}-01`;
    diaFim = `${String(p.ano).padStart(4, '0')}-${mm}-${String(diasNoMes(p.ano, p.mes)).padStart(2, '0')}`;
  }
  return {
    diaInicio,
    diaFim,
    inicio: intervaloDoDia(diaInicio, tz).inicio,
    fim: intervaloDoDia(diaFim, tz).fim,
  };
}

/** Lista os dias crus de `diaInicio` a `diaFim` (inclusivos). */
export function diasDoIntervalo(diaInicio: string, diaFim: string): string[] {
  const dias: string[] = [];
  for (let d = diaInicio; d <= diaFim; d = somarDias(d, 1)) dias.push(d);
  return dias;
}
