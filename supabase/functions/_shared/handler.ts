/**
 * Runtime compartilhado das Edge Functions de IA (efeitos Supabase + constantes).
 *
 * As três funções de rota (`generate-diet`, `suggest-workout`,
 * `analyze-assessment`) seguem a MESMA ordem de guarda-corpos; o que muda é o
 * prompt, o schema de entrada e o schema de saída. Este módulo concentra os
 * EFEITOS (client service_role, verificação de JWT, consulta de perfil,
 * rate-limit, inserts/updates em `ai_generations`, log de uso e preço por
 * modelo) para que cada `index.ts` fique só com a orquestração.
 *
 * consentimento removido por decisão de escopo; reintroduzir se LGPD voltar
 * (antes havia `hasAiConsent`/`resolveAssessmentStudent` para checar o
 * consentimento `ai_processing` do aluno — ver docs/pendencias.md).
 *
 * Decisões (ADR 0001 §5 / architecture §4.4 / §8):
 * - `service_role` só é usado APÓS o auth-guard validar JWT+papel; toda query
 *   carimba `tenant_id` do chamador.
 * - A verificação do JWT usa um client anon com o token do usuário
 *   (`auth.getUser`), nunca o service_role.
 * - Preço por modelo derivado de `ANTHROPIC_MODEL` (ADR 0001 §2); sem string de
 *   modelo fixa no fluxo.
 *
 * Código Deno (imports `.ts`, `Deno.env`, `npm:@supabase/supabase-js` via
 * import map). Não entra no `tsc` do Next.
 */

import { createClient } from '@supabase/supabase-js';

import type { AuthenticatedUser, ProfileContext, UserRole } from './auth-guard.ts';
import { estimateCostUsd, type AiJobType, type ModelPricing, type UsageLogRecord } from './logging.ts';
import type { JsonSchema } from './structured-output.ts';

/** Tipos de job desta fase (weekly_adherence fica fora — adiado). */
export const JOB_TYPE = {
  generate_diet: 'generate_diet',
  suggest_workout: 'suggest_workout',
  analyze_assessment: 'analyze_assessment',
} as const satisfies Record<string, AiJobType>;

/** Nome da tool por função (canal da saída estruturada forçada). */
export const TOOL_NAMES = {
  generate_diet: 'generate_diet',
  suggest_workout: 'suggest_workout',
  analyze_assessment: 'analyze_assessment',
} as const;

/** Teto de tokens de saída (guarda-corpo de custo, ADR 0001 §5). */
export const MAX_OUTPUT_TOKENS = 4096;

/** Timeout real por requisição à Anthropic, em ms. */
export const TIMEOUT_MS = 60_000;

/**
 * JSON Schemas das tools (refletem os schemas Zod de `schemas/ia/`). São usados
 * para FORÇAR o formato na Anthropic; a validação de verdade é sempre o Zod no
 * servidor (`parseToolOutput`) — ADR 0001 §4.
 */
export const JSON_SCHEMAS: Record<'generate_diet' | 'suggest_workout' | 'analyze_assessment', JsonSchema> = {
  generate_diet: {
    type: 'object',
    additionalProperties: false,
    required: ['meals', 'totals', 'shopping_list', 'disclaimer'],
    properties: {
      meals: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'time', 'order_index', 'foods'],
          properties: {
            name: { type: 'string' },
            time: { type: 'string' },
            order_index: { type: 'integer', minimum: 0 },
            foods: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['food_name', 'quantity', 'unit', 'kcal', 'protein_g', 'carbs_g', 'fat_g'],
                properties: {
                  food_name: { type: 'string' },
                  quantity: { type: 'number', exclusiveMinimum: 0 },
                  unit: { type: 'string' },
                  kcal: { type: 'number', minimum: 0 },
                  protein_g: { type: 'number', minimum: 0 },
                  carbs_g: { type: 'number', minimum: 0 },
                  fat_g: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },
      },
      totals: {
        type: 'object',
        additionalProperties: false,
        required: ['target_kcal', 'protein_g', 'carbs_g', 'fat_g'],
        properties: {
          target_kcal: { type: 'number', minimum: 0 },
          protein_g: { type: 'number', minimum: 0 },
          carbs_g: { type: 'number', minimum: 0 },
          fat_g: { type: 'number', minimum: 0 },
        },
      },
      shopping_list: { type: 'array', minItems: 1, items: { type: 'string' } },
      disclaimer: { type: 'string' },
    },
  },
  suggest_workout: {
    type: 'object',
    additionalProperties: false,
    required: ['days', 'disclaimer'],
    properties: {
      days: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['weekday', 'exercises'],
          properties: {
            weekday: { type: 'integer', minimum: 0, maximum: 6 },
            label: { type: ['string', 'null'] },
            exercises: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'sets', 'reps', 'rest_seconds'],
                properties: {
                  name: { type: 'string' },
                  sets: { type: 'integer', exclusiveMinimum: 0 },
                  reps: { type: 'string' },
                  rest_seconds: { type: 'integer', minimum: 0 },
                  notes: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
      disclaimer: { type: 'string' },
    },
  },
  analyze_assessment: {
    type: 'object',
    additionalProperties: false,
    required: ['analysis', 'recommendations', 'disclaimer'],
    properties: {
      analysis: { type: 'string' },
      recommendations: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['category', 'text', 'priority'],
          properties: {
            category: { type: 'string' },
            text: { type: 'string' },
            priority: { type: 'string', enum: ['alta', 'media', 'baixa'] },
          },
        },
      },
      disclaimer: { type: 'string' },
    },
  },
};

/** Tabela mínima de Supabase que o runtime consome (evita acoplar o schema todo). */
interface SupabaseLike {
  auth: {
    getUser(jwt: string): Promise<{ data: { user: { id: string } | null }; error: unknown }>;
  };
  from(table: string): {
    select: (columns: string) => any;
    insert: (values: unknown) => any;
    update: (values: unknown) => any;
  };
}

/** Argumentos para inserir o rascunho pendente. */
export interface PendingGenerationInput {
  tenant_id: string;
  created_by: string;
  job_type: AiJobType;
  input: unknown;
}

/** Atualização final do rascunho (succeeded/failed). */
export interface GenerationResult {
  status: 'succeeded' | 'failed';
  output: unknown;
}

/** Superfície de efeitos que cada `index.ts` consome. */
export interface Runtime {
  verifyJwt: (authorizationHeader: string | null) => Promise<AuthenticatedUser | null>;
  resolveProfile: (userId: string) => Promise<ProfileContext | null>;
  countRecentCalls: (tenantId: string, userId: string, sinceIso: string) => Promise<number>;
  insertPendingGeneration: (input: PendingGenerationInput) => Promise<string>;
  finishGeneration: (id: string, result: GenerationResult) => Promise<void>;
  writeUsageLog: (record: UsageLogRecord) => Promise<void>;
  estimateCost: (model: string | null, inputTokens: number | null, outputTokens: number | null) => number | null;
}

/** Leitor de env (default Deno.env) — injetável para teste futuro. */
type EnvReader = (name: string) => string | undefined;

const defaultEnvReader: EnvReader = (name) => {
  const denoEnv = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env;
  return denoEnv?.get(name);
};

/** Preço por milhão de tokens derivado do modelo configurado (ADR 0001 §2). */
export function pricingForModel(model: string | null): ModelPricing {
  const name = (model ?? '').toLowerCase();
  if (name.includes('opus')) return { inputPerMTok: 4, outputPerMTok: 20 };
  if (name.includes('haiku')) return { inputPerMTok: 0.1, outputPerMTok: 0.5 };
  // Padrão do produto: Sonnet 5.5.
  return { inputPerMTok: 2, outputPerMTok: 10 };
}

function requiredEnv(env: EnvReader, name: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`${name} não configurado no ambiente da função.`);
  }
  return value;
}

/**
 * Lê e faz parse seguro do corpo JSON da requisição. Devolve `{}` se o corpo
 * for vazio/ inválido — o schema Zod da função cuida da rejeição amigável.
 */
export async function readRequestBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

/**
 * Constrói o runtime real a partir do ambiente da Edge Function.
 * - `anonClient`: valida o JWT do usuário (nunca service_role aqui).
 * - `adminClient`: service_role, usado SÓ após o auth-guard, sempre carimbando
 *   `tenant_id` (architecture §4.4).
 */
export function buildRuntime(env: EnvReader = defaultEnvReader): Runtime {
  const supabaseUrl = requiredEnv(env, 'SUPABASE_URL');
  const anonKey = requiredEnv(env, 'SUPABASE_ANON_KEY');
  const serviceRoleKey = requiredEnv(env, 'SUPABASE_SERVICE_ROLE_KEY');

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as SupabaseLike;

  return {
    async verifyJwt(authorizationHeader) {
      if (!authorizationHeader) return null;
      const token = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
      if (!token) return null;
      // Client anon com o token do usuário (não service_role).
      const anon = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      }) as unknown as SupabaseLike;
      const { data, error } = await anon.auth.getUser(token);
      if (error || !data.user) return null;
      return { userId: data.user.id };
    },

    async resolveProfile(userId) {
      // service_role, mas SÓ após o JWT validar (chamado pelo requireTrainer).
      const { data, error } = await admin
        .from('profiles')
        .select('tenant_id, role')
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data) return null;
      return { tenantId: data.tenant_id as string, role: data.role as UserRole };
    },

    // consentimento removido por decisão de escopo; reintroduzir se LGPD voltar
    // (aqui ficavam `hasAiConsent` e `resolveAssessmentStudent`).

    async countRecentCalls(tenantId, userId, sinceIso) {
      const { count, error } = await admin
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)
        .gte('created_at', sinceIso);
      if (error) return 0;
      return count ?? 0;
    },

    async insertPendingGeneration(input) {
      const { data, error } = await admin
        .from('ai_generations')
        .insert({
          tenant_id: input.tenant_id,
          created_by: input.created_by,
          job_type: input.job_type,
          status: 'pending',
          input: input.input,
        })
        .select('id')
        .single();
      if (error || !data) {
        throw new Error('Falha ao registrar a geração de IA.');
      }
      return data.id as string;
    },

    async finishGeneration(id, result) {
      await admin
        .from('ai_generations')
        .update({ status: result.status, output: result.output })
        .eq('id', id);
    },

    async writeUsageLog(record) {
      await admin.from('ai_usage_logs').insert(record);
    },

    estimateCost(model, inputTokens, outputTokens) {
      return estimateCostUsd(inputTokens, outputTokens, pricingForModel(model));
    },
  };
}
