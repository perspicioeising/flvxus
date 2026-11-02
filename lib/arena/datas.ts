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
