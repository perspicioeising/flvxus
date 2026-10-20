/**
 * Rate limit por usuário com base em `ai_usage_logs` (architecture §8).
 *
 * A lógica de JANELA é PURA e testável por Vitest (sem `Deno.*`, sem Supabase):
 * dado o instante atual e o tamanho da janela, calcula o limite de corte e
 * decide se uma nova chamada é permitida a partir da contagem de registros.
 *
 * A consulta ao banco (contar registros na janela via service_role) é um efeito
 * e fica isolada em `countRecentCalls`, que recebe um "contador" injetável.
 */

/** Configuração de uma janela de rate limit. */
export interface RateLimitWindow {
  /** Máximo de chamadas permitidas dentro da janela. */
  maxCalls: number;
  /** Tamanho da janela, em milissegundos. */
  windowMs: number;
}

/** Instante de corte (ISO) a partir do qual contar os registros da janela. */
export function windowStartIso(now: Date, windowMs: number): string {
  return new Date(now.getTime() - windowMs).toISOString();
}

/** Resultado de uma decisão de rate limit. */
export interface RateLimitDecision {
  allowed: boolean;
  /** Quantas chamadas ainda cabem na janela (nunca negativo). */
  remaining: number;
}

/**
 * Decisão PURA: dada a contagem de chamadas recentes e a janela, diz se a
 * próxima chamada é permitida. Uma chamada nova só é permitida se a contagem
 * atual for estritamente menor que o teto.
 */
export function decide(recentCount: number, window: RateLimitWindow): RateLimitDecision {
  const allowed = recentCount < window.maxCalls;
  const remaining = Math.max(0, window.maxCalls - recentCount);
  return { allowed, remaining };
}

/**
 * Contador injetável: retorna quantos registros de `ai_usage_logs` existem para
 * o usuário/tenant desde `sinceIso`. A implementação real roda com service_role
 * na Edge Function; nos testes basta um stub.
 */
export type RecentCallCounter = (sinceIso: string) => Promise<number>;

/**
 * Orquestra a decisão de rate limit: calcula o início da janela, conta e decide.
 * Separa o efeito (contar) da lógica (decidir) para manter a parte testável pura.
 */
export async function checkRateLimit(
  counter: RecentCallCounter,
  window: RateLimitWindow,
  now: Date = new Date(),
): Promise<RateLimitDecision> {
  const sinceIso = windowStartIso(now, window.windowMs);
  const recentCount = await counter(sinceIso);
  return decide(recentCount, window);
}

/** Janela padrão do produto: 10 chamadas por hora por usuário. */
export const DEFAULT_WINDOW: RateLimitWindow = {
  maxCalls: 10,
  windowMs: 60 * 60 * 1000,
};
