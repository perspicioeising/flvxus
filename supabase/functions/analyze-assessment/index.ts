/**
 * Edge Function `analyze-assessment` (job_type = analyze_assessment).
 *
 * Gera um RASCUNHO de análise de avaliação física (análise textual +
 * recomendações estruturadas) via Anthropic e grava em `ai_generations`
 * (pending -> succeeded/failed) como rascunho REVISÁVEL. NÃO escreve direto em
 * `physical_assessments.ai_analysis/ai_recommendations`: o professor revisa e
 * aprova depois (ADR 0001 §6).
 *
 * Segue a MESMA ordem de guarda-corpos (architecture §8): CORS -> auth-guard
 * (JWT+trainer) -> Zod de entrada -> consentimento ai_processing do aluno dono
 * da avaliação -> rate-limit/teto/timeout -> ai_generations pending ->
 * Anthropic (dados como DADOS) -> Zod de saída -> ai_usage_logs + update -> retorno.
 */

import { z } from 'zod';

import { analyzeAssessmentOutputSchema } from '../../../schemas/ia/analyze-assessment.ts';
import { AnthropicClient } from '../_shared/anthropic.ts';
import { requireTrainer } from '../_shared/auth-guard.ts';
import { handlePreflight } from '../_shared/cors.ts';
import { aiFailure, badRequest, errorResponse, jsonResponse, rateLimited } from '../_shared/errors.ts';
import { recordUsage } from '../_shared/logging.ts';
import { checkRateLimit, DEFAULT_WINDOW } from '../_shared/rate-limit.ts';
import { buildTool, parseToolOutput } from '../_shared/structured-output.ts';
import { ANALYZE_ASSESSMENT_SYSTEM, buildAnalyzeAssessmentUserMessage } from '../_prompts/analyze-assessment.ts';
import {
  JOB_TYPE,
  JSON_SCHEMAS,
  MAX_OUTPUT_TOKENS,
  TIMEOUT_MS,
  TOOL_NAMES,
  buildRuntime,
  readRequestBody,
} from '../_shared/handler.ts';

/** Entrada (architecture §8): assessment_id (+ anterior para comparação, opcional). */
const inputSchema = z.object({
  assessment_id: z.string().uuid('assessment_id deve ser um UUID.'),
  previous_assessment_id: z.string().uuid('previous_assessment_id deve ser um UUID.').optional(),
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
      throw badRequest('Entrada inválida para análise de avaliação.');
    }
    const input = parsedInput.data;

    // Consentimento ai_processing é do ALUNO dono da avaliação (architecture §11).
    const studentId = await runtime.resolveAssessmentStudent(ctx.tenantId, input.assessment_id);
    if (!studentId) {
      throw badRequest('Avaliação não encontrada no tenant.');
    }
    const consented = await runtime.hasAiConsent(ctx.tenantId, studentId);
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
      job_type: JOB_TYPE.analyze_assessment,
      input,
    });

    const startedAt = Date.now();
    const client = new AnthropicClient({ timeoutMs: TIMEOUT_MS });
    const tool = buildTool(
      TOOL_NAMES.analyze_assessment,
      'Retorna o rascunho estruturado da análise de avaliação.',
      JSON_SCHEMAS.analyze_assessment,
    );

    try {
      const result = await client.createMessage({
        system: ANALYZE_ASSESSMENT_SYSTEM,
        userContent: buildAnalyzeAssessmentUserMessage(JSON.stringify(input)),
        tool,
        maxTokens: MAX_OUTPUT_TOKENS,
      });

      const parsedOutput = parseToolOutput(
        result.response,
        TOOL_NAMES.analyze_assessment,
        analyzeAssessmentOutputSchema,
      );
      if (!parsedOutput.ok) {
        throw aiFailure();
      }

      await recordUsage(runtime.writeUsageLog, {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        job_type: JOB_TYPE.analyze_assessment,
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
        job_type: JOB_TYPE.analyze_assessment,
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
