/**
 * Fronteira temporal da Arena — fuso `America/Sao_Paulo` centralizado (decisão
 * HIGH-3). Espelha a função SQL `gamification_sp_date(timestamptz)` do motor:
 * a virada de dia da streak, o limite diário e o mês da temporada só fazem
 * sentido no fuso do usuário (um treino às 22h-23h cairia no dia UTC seguinte).
 *
 * Funções PURAS (sem I/O) — testáveis em `tests/unit/arena-datas.test.ts`.
 * NUNCA usar `toISOString()` cru para derivar dia/mês: isso retorna UTC e
 * desloca a borda das 23h (critério de aceite 17).
 */

const TIME_ZONE = 'America/Sao_Paulo';

/** `YYYY-MM-DD` — dia-SP já carimbado pelo banco (`gamification_sp_date`). */
const DIA_SP_CRU = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida que uma string `YYYY-MM-DD` representa uma data real (mês 1–12 e dia
 * válido para o mês), sem passar por `new Date()` (que reinterpretaria a string
 * como meia-noite UTC e deslocaria o dia ao reconverter para o fuso SP).
 */
function diaCruValido(valor: string): boolean {
  const ano = Number(valor.slice(0, 4));
  const mes = Number(valor.slice(5, 7));
  const dia = Number(valor.slice(8, 10));
  if (mes < 1 || mes > 12 || dia < 1) {
    return false;
  }
  const bissexto = (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
  const diasNoMes = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dia <= diasNoMes[mes - 1];
}

/**
 * Normaliza uma entrada para o dia-SP (`YYYY-MM-DD`). Quando a entrada JÁ é um
 * dia-SP cru (`YYYY-MM-DD`, como o `occurred_on` que o banco carimba via
 * `gamification_sp_date(now())`), devolve a própria string após validação — sem
 * reconverter por fuso (o que, via `new Date("YYYY-MM-DD")`, cairia na
 * meia-noite UTC e voltaria um dia). Para instantes (`Date` ou ISO com
 * horário), delega ao `diaSP` por fuso. Retorna `null` para entradas inválidas.
 */
export function diaSPdeDiaOuInstante(ts: Date | string): string | null {
  if (typeof ts === 'string' && DIA_SP_CRU.test(ts)) {
    return diaCruValido(ts) ? ts : null;
  }
  return diaSP(ts);
}

/** Formata um instante como YYYY-MM-DD (campos numéricos) no fuso SP. */
function partesSP(ts: Date | string): { ano: string; mes: string; dia: string } | null {
  const data = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(data.getTime())) {
    return null;
  }

  const formatador = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const partes = formatador.formatToParts(data);
  const ano = partes.find((p) => p.type === 'year')?.value;
  const mes = partes.find((p) => p.type === 'month')?.value;
  const dia = partes.find((p) => p.type === 'day')?.value;

  if (!ano || !mes || !dia) {
    return null;
  }
  return { ano, mes, dia };
}

/**
 * Dia-SP de um instante no formato `YYYY-MM-DD` (fuso `America/Sao_Paulo`).
 * Espelha `gamification_sp_date`. Retorna `null` para datas inválidas.
 */
export function diaSP(ts: Date | string): string | null {
  const p = partesSP(ts);
  return p ? `${p.ano}-${p.mes}-${p.dia}` : null;
}

/**
 * Período-SP (mês da temporada) de um instante no formato `YYYY-MM`
 * (fuso `America/Sao_Paulo`). Espelha o `period_key` do motor. Retorna `null`
 * para datas inválidas.
 */
export function periodoSP(ts: Date | string): string | null {
  const p = partesSP(ts);
  return p ? `${p.ano}-${p.mes}` : null;
}
