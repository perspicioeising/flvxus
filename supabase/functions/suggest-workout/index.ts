/**
 * Edge Function `suggest-workout` (job_type = suggest_workout).
 *
 * Gera um RASCUNHO de plano de treino via Anthropic e grava em
 * `ai_generations` (pending -> succeeded/failed). NUNCA materializa em
 * `workout_plans`: o professor revisa e aprova depois (ADR 0001 §6).
 *
 * Segue a MESMA ordem de guarda-corpos de `generate-diet` (architecture §8):
 * CORS -> auth-guard (JWT+trainer) -> Zod de entrada -> consentimento
 * ai_processing -> rate-limit/teto/timeout -> ai_generations pending ->
 * Anthropic (dados como DADOS) -> Zod de saída -> ai_usage_logs + update -> retorno.
 */

import { z } from 'zod';

import { suggestWorkoutOutputSchema } from '../../../schemas/ia/suggest-workout.ts';
import { AnthropicClient } from '../_shared/anthropic.ts';
import { requireTrainer } from '../_shared/auth-guard.ts';
import { handlePreflight } from '../_shared/cors.ts';
import { aiFailure, badRequest, errorResponse, jsonResponse, rateLimited } from '../_shared/errors.ts';
import { recordUsage } from '../_shared/logging.ts';
import { checkRateLimit, DEFAULT_WINDOW } from '../_shared/rate-limit.ts';
import { buildTool, parseToolOutput } from '../_shared/structured-output.ts';
import { SUGGEST_WORKOUT_SYSTEM, buildSuggestWorkoutUserMessage } from '../_prompts/suggest-workout.ts';
import {
  JOB_TYPE,
  JSON_SCHEMAS,
  MAX_OUTPUT_TOKENS,
  TIMEOUT_MS,
  TOOL_NAMES,
  buildRuntime,
  readRequestBody,
} from '../_shared/handler.ts';

/** Entrada (architecture §8): student_id, goal, experience_level, days_per_week, assessment_id?. */
const inputSchema = z.object({
  student_id: z.string().uuid('student_id deve ser um UUID.'),
  goal: z.string().min(1, 'goal é obrigatório.'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'experience_level inválido.' }),
  }),
  days_per_week: z
    .number()
    .int('days_per_week deve ser inteiro.')
    .min(1, 'days_per_week mínimo é 1.')
    .max(7, 'days_per_week máximo é 7.'),
  assessment_id: z.string().uuid('assessment_id deve ser um UUID.').optional(),
});

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const runtime = buildRuntime();

  try {
    if (req.method !== 'POST') {
      throw badRequest('Método não suportado.');
    }

    const ctx = await requireTrainer(
      req.headers.get('Authorization'),
      runtime.verifyJwt,
      runtime.resolveProfile,
    );

    const parsedInput = inputSchema.safeParse(await readRequestBody(req));
    if (!parsedInput.success) {
      throw badRequest('Entrada inválida para sugestão de treino.');
    }
    const input = parsedInput.data;

    const consented = await runtime.hasAiConsent(ctx.tenantId, input.student_id);
    if (!consented) {
      throw badRequest('O aluno não concedeu consentimento de processamento por IA.');
    }

    const decision = await checkRateLimit(
      (sinceIso) => runtime.countRecentCalls(ctx.tenantId, ctx.userId, sinceIso),
      DEFAULT_WINDOW,
    );
    if (!decision.allowed) {
      throw rateLimited();
    }

    const generationId = await runtime.insertPendingGeneration({
      tenant_id: ctx.tenantId,
      created_by: ctx.userId,
      job_type: JOB_TYPE.suggest_workout,
      input,
    });

    const startedAt = Date.now();
    const client = new AnthropicClient({ timeoutMs: TIMEOUT_MS });
    const tool = buildTool(
      TOOL_NAMES.suggest_workout,
      'Retorna o rascunho estruturado do plano de treino.',
      JSON_SCHEMAS.suggest_workout,
    );

    try {
      const result = await client.createMessage({
        system: SUGGEST_WORKOUT_SYSTEM,
        userContent: buildSuggestWorkoutUserMessage(JSON.stringify(input)),
        tool,
        maxTokens: MAX_OUTPUT_TOKENS,
      });

      const parsedOutput = parseToolOutput(
        result.response,
        TOOL_NAMES.suggest_workout,
        suggestWorkoutOutputSchema,
      );
      if (!parsedOutput.ok) {
        throw aiFailure();
      }

      await recordUsage(runtime.writeUsageLog, {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        job_type: JOB_TYPE.suggest_workout,
        model: result.model,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        estimated_cost_usd: runtime.estimateCost(result.model, result.inputTokens, result.outputTokens),
        status: 'succeeded',
        latency_ms: Date.now() - startedAt,
      });
      await runtime.finishGeneration(generationId, {
        status: 'succeeded',
        output: parsedOutput.data,
      });

      return jsonResponse({ generation_id: generationId, status: 'succeeded', draft: parsedOutput.data });
    } catch (aiErr) {
      await recordUsage(runtime.writeUsageLog, {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        job_type: JOB_TYPE.suggest_workout,
        model: null,
        input_tokens: null,
        output_tokens: null,
        estimated_cost_usd: null,
        status: 'failed',
        latency_ms: Date.now() - startedAt,
      });
      await runtime.finishGeneration(generationId, { status: 'failed', output: null });
      throw aiErr;
    }
  } catch (err) {
    return errorResponse(err);
  }
});
