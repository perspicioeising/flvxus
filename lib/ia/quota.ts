/**
 * Decisão PURA da franquia de IA (Fase B3 / FR-B3) — sem banco, sem Deno.
 *
 * Espelha o que a Edge Function enforça de verdade com o service_role; estes
 * helpers existem para serem testáveis por Vitest (headless) e reusados onde a
 * decisão precisa ser derivada fora do runtime das funções.
 */

/** Nome do mês atual, truncado a date `YYYY-MM-DD` (UTC). */
function firstDayOfCurrentMonth(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Resolve o início do período de franquia como uma `date` (`YYYY-MM-DD`).
 *
 * Usa `current_period_start` da assinatura quando presente (truncado a date);
 * no fallback (null/vazio/ inválido), o 1º dia do mês corrente. Mantém PURA a
 * decisão de janela de franquia.
 */
export function resolvePeriodStart(
  currentPeriodStart: string | null | undefined,
  now: Date = new Date(),
): string {
  if (typeof currentPeriodStart === 'string' && currentPeriodStart.trim().length > 0) {
    const parsed = new Date(currentPeriodStart);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return firstDayOfCurrentMonth(now);
}

/**
 * TRUE quando o uso já atingiu/ passou o limite do período. Limite `null`
 * significa ilimitado (nunca estoura).
 */
export function quotaExceeded(limit: number | null, used: number): boolean {
  if (limit === null) {
    return false;
  }
  return used >= limit;
}
