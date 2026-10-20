/**
 * Log de uso de IA em `ai_usage_logs` (architecture §8 / ADR 0001 §5).
 *
 * Grava APÓS sucesso OU falha: tenant_id, user_id, job_type, model,
 * input_tokens, output_tokens, estimated_cost_usd, status, latency_ms.
 * Colunas conforme `types/database.types.ts` (tabela `ai_usage_logs`).
 *
 * A estimativa de custo é PURA (testável). A gravação é um efeito injetável
 * (`UsageLogWriter`); a implementação real usa o client service_role na função.
 */

/** Tipos de job de IA (espelha o enum `ai_job_type` do banco). */
export type AiJobType =
  | 'generate_diet'
  | 'suggest_workout'
  | 'analyze_assessment'
  | 'weekly_adherence';

/** Preço por milhão de tokens (MTok), em USD. */
export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
}

/**
 * Estimativa PURA de custo em USD a partir dos tokens e do preço do modelo.
 * Tokens nulos contam como 0. Resultado nunca negativo.
 */
export function estimateCostUsd(
  inputTokens: number | null,
  outputTokens: number | null,
  pricing: ModelPricing,
): number {
  const input = Math.max(0, inputTokens ?? 0);
  const output = Math.max(0, outputTokens ?? 0);
  const cost =
    (input / 1_000_000) * pricing.inputPerMTok +
    (output / 1_000_000) * pricing.outputPerMTok;
  return Math.max(0, cost);
}

/** Registro a gravar em `ai_usage_logs` (forma de Insert). */
export interface UsageLogRecord {
  tenant_id: string;
  user_id: string | null;
  job_type: AiJobType;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost_usd: number | null;
  status: string | null;
  latency_ms: number | null;
}

/** Escritor injetável do log (default real: insert via service_role). */
export type UsageLogWriter = (record: UsageLogRecord) => Promise<void>;

/**
 * Grava o log de uso. Nunca lança para fora: um erro de logging não deve
 * derrubar a resposta ao usuário (o log é observabilidade, não o produto).
 */
export async function recordUsage(
  writer: UsageLogWriter,
  record: UsageLogRecord,
): Promise<void> {
  try {
    await writer(record);
  } catch {
    // Silencioso de propósito: falha de observabilidade não afeta o fluxo.
  }
}
