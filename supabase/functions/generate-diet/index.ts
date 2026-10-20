/**
 * Edge Function `generate-diet` (job_type = generate_diet).
 *
 * Gera um RASCUNHO de dieta via Anthropic e grava em `ai_generations`
 * (status pending -> succeeded/failed). NUNCA materializa em `diets`:
 * o professor revisa e aprova depois (rascunho->aprovação, ADR 0001 §6).
 *
 * Ordem dos guarda-corpos (architecture §8 / ADR 0001 §5):
 *   1. CORS preflight
 *   2. auth-guard: valida JWT e papel trainer (401/403)
 *   3. validação Zod da entrada
 *   4. consentimento `ai_processing` do aluno (architecture §11)
 *   5. rate-limit + teto de tokens + timeout real
 *   6. insere ai_generations status=pending (carimba tenant_id)
 *   7. chama Anthropic com o system prompt + dados do aluno como DADOS
 *   8. valida a saída com schemas/ia/generate-diet
 *   9. grava ai_usage_logs (sucesso OU falha) e atualiza ai_generations
 *  10. retorna o rascunho
 *
 * Código Deno (imports com extensão `.ts`; `Deno.serve`/`Deno.env`). NÃO entra
 * no `tsc` do Next (excluído no tsconfig); é checado por `deno check`.
 */

import { z } from 'zod';

import { generateDietOutputSchema } from '../../../schemas/ia/generate-diet.ts';
import { AnthropicClient } from '../_shared/anthropic.ts';
import { requireTrainer } from '../_shared/auth-guard.ts';
import { handlePreflight } from '../_shared/cors.ts';
import { aiFailure, badRequest, errorResponse, jsonResponse, rateLimited } from '../_shared/errors.ts';
import { recordUsage } from '../_shared/logging.ts';
import { checkRateLimit, DEFAULT_WINDOW } from '../_shared/rate-limit.ts';
import { buildTool, parseToolOutput } from '../_shared/structured-output.ts';
import { GENERATE_DIET_SYSTEM, buildGenerateDietUserMessage } from '../_prompts/generate-diet.ts';
import {
  JOB_TYPE,
  JSON_SCHEMAS,
  MAX_OUTPUT_TOKENS,
  TIMEOUT_MS,
  TOOL_NAMES,
  buildRuntime,
  readRequestBody,
} from '../_shared/handler.ts';

/** Entrada da função (architecture §8): student_id, goal, restrictions[], assessment_id?, target_kcal?. */
const inputSchema = z.object({
  student_id: z.string().uuid('student_id deve ser um UUID.'),
  goal: z.string().min(1, 'goal é obrigatório.'),
  restrictions: z.array(z.string().min(1)).default([]),
  assessment_id: z.string().uuid('assessment_id deve ser um UUID.').optional(),
  target_kcal: z.number().finite().positive('target_kcal deve ser positivo.').optional(),
});

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const runtime = buildRuntime();

  try {
    if (req.method !== 'POST') {
      throw badRequest('Método não suportado.');
    }

    // 2. auth-guard: JWT primeiro, papel trainer depois (401/403).
    const ctx = await requireTrainer(
      req.headers.get('Authorization'),
      runtime.verifyJwt,
      runtime.resolveProfile,
    );

    // 3. validação Zod da entrada.
    const parsedInput = inputSchema.safeParse(await readRequestBody(req));
    if (!parsedInput.success) {
      throw badRequest('Entrada inválida para geração de dieta.');
    }
    const input = parsedInput.data;

    // 4. consentimento ai_processing do aluno (architecture §11).
    const consented = await runtime.hasAiConsent(ctx.tenantId, input.student_id);
    if (!consented) {
      throw badRequest('O aluno não concedeu consentimento de processamento por IA.');
    }

    // 5. rate-limit por usuário na janela padrão (teto/timeout aplicados adiante).
    const decision = await checkRateLimit(
      (sinceIso) => runtime.countRecentCalls(ctx.tenantId, ctx.userId, sinceIso),
      DEFAULT_WINDOW,
    );
    if (!decision.allowed) {
      throw rateLimited();
    }

    // 6. rascunho em ai_generations: status pending, carimbando tenant_id.
    const generationId = await runtime.insertPendingGeneration({
      tenant_id: ctx.tenantId,
      created_by: ctx.userId,
      job_type: JOB_TYPE.generate_diet,
      input,
    });

    const startedAt = Date.now();
    // 7. chama a Anthropic com dados do aluno como DADOS (anti-injection).
    const client = new AnthropicClient({ timeoutMs: TIMEOUT_MS });
    const tool = buildTool(
      TOOL_NAMES.generate_diet,
      'Retorna o rascunho estruturado da dieta.',
      JSON_SCHEMAS.generate_diet,
    );

    try {
      const result = await client.createMessage({
        system: GENERATE_DIET_SYSTEM,
        userContent: buildGenerateDietUserMessage(JSON.stringify(input)),
        tool,
        maxTokens: MAX_OUTPUT_TOKENS,
      });

      // 8. valida a saída com Zod antes de gravar qualquer coisa.
      const parsedOutput = parseToolOutput(
        result.response,
        TOOL_NAMES.generate_diet,
        generateDietOutputSchema,
      );
      if (!parsedOutput.ok) {
        throw aiFailure();
      }

      // 9a. log de uso em SUCESSO + ai_generations -> succeeded.
      await recordUsage(runtime.writeUsageLog, {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        job_type: JOB_TYPE.generate_diet,
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

      // 10. retorna o rascunho (NÃO materializa em diets).
      return jsonResponse({ generation_id: generationId, status: 'succeeded', draft: parsedOutput.data });
    } catch (aiErr) {
      // 9b. log de uso em FALHA + ai_generations -> failed, depois propaga.
      await recordUsage(runtime.writeUsageLog, {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        job_type: JOB_TYPE.generate_diet,
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
