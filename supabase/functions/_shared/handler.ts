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
import {
  aiFeatureForTier,
  resolvePeriodStart,
  type PlanTier,
  type SubscriptionStatus,
} from './quota-policy.ts';
import type { JsonSchema } from './structured-output.ts';

/** Tipos de job desta fase (weekly_adherence fica fora — adiado). */
export const JOB_TYPE = {
  generate_diet: 'generate_diet',
  suggest_workout: 'suggest_workout',
  analyze_assessment: 'analyze_assessment',
} as const satisfies Record<string, AiJobType>;

/** Teto de tokens de saída (guarda-corpo de custo, ADR 0001 §5). */
export const MAX_OUTPUT_TOKENS = 8192;

/**
 * Teto de exercícios do catálogo carregados no prompt (guarda-corpo de custo:
 * limita o tamanho do bloco <exercicios_disponiveis> enviado à Anthropic).
 */
export const EXERCISE_CATALOG_LIMIT = 300;

/** Timeout real por requisição à Anthropic, em ms. */
export const TIMEOUT_MS = 60_000;

/**
 * JSON Schemas de saída (refletem os schemas Zod de `schemas/ia/`). São usados
 * para FORÇAR o formato na Anthropic via `output_config.format`; a validação de
 * verdade é sempre o Zod no servidor (`parseStructuredOutput`) — ADR 0001 §4.
 * Limites finos (minItems/minimum/maximum/exclusiveMinimum) NÃO entram aqui
 * (incompatíveis com `output_config.format`); vivem só no Zod de saída.
 */
export const JSON_SCHEMAS: Record<'generate_diet' | 'suggest_workout' | 'analyze_assessment', JsonSchema> = {
  generate_diet: {
    type: 'object',
    additionalProperties: false,
    required: ['meals', 'totals', 'shopping_list', 'disclaimer'],
    properties: {
      meals: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'time', 'order_index', 'foods'],
          properties: {
            name: { type: 'string' },
            time: { type: 'string' },
            order_index: { type: 'integer' },
            foods: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['food_name', 'quantity', 'unit', 'kcal', 'protein_g', 'carbs_g', 'fat_g'],
                properties: {
                  food_name: { type: 'string' },
                  quantity: { type: 'number' },
                  unit: { type: 'string' },
                  kcal: { type: 'number' },
                  protein_g: { type: 'number' },
                  carbs_g: { type: 'number' },
                  fat_g: { type: 'number' },
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
          target_kcal: { type: 'number' },
          protein_g: { type: 'number' },
          carbs_g: { type: 'number' },
          fat_g: { type: 'number' },
        },
      },
      shopping_list: { type: 'array', items: { type: 'string' } },
      disclaimer: { type: 'string' },
    },
  },
  // Formato v2: treino por DIVISÕES (A/B/C) com dias de descanso, rotação e
  // SÉRIES individuais; a IA escolhe `exercise_id` reais do catálogo. Sem
  // limites finos (minItems/minimum/...): incompatíveis com output_config.format;
  // vivem só no Zod de saída (schemas/ia/suggest-workout.ts).
  suggest_workout: {
    type: 'object',
    additionalProperties: false,
    required: ['divisions', 'disclaimer'],
    properties: {
      divisions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'weekday', 'exercises'],
          properties: {
            label: { type: 'string' },
            weekday: { type: ['integer', 'null'] },
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['exercise_id', 'order_index', 'series'],
                properties: {
                  exercise_id: { type: 'string' },
                  exercise_name: { type: ['string', 'null'] },
                  order_index: { type: 'integer' },
                  sets: { type: ['integer', 'null'] },
                  reps: { type: ['string', 'null'] },
                  rest_seconds: { type: ['integer', 'null'] },
                  target_load: { type: ['number', 'null'] },
                  notes: { type: ['string', 'null'] },
                  series: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['set_number', 'kind', 'target_reps', 'rest_seconds', 'target_load', 'note'],
                      properties: {
                        set_number: { type: 'integer' },
                        kind: { type: 'string', enum: ['warmup', 'adaptation', 'work'] },
                        target_reps: { type: ['string', 'null'] },
                        rest_seconds: { type: ['integer', 'null'] },
                        target_load: { type: ['number', 'null'] },
                        note: { type: ['string', 'null'] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      rest_days: { type: 'array', items: { type: 'integer' } },
      rotation_steps: {
        type: ['array', 'null'],
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['type'],
          properties: {
            type: { type: 'string', enum: ['division', 'rest'] },
            label: { type: ['string', 'null'] },
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
    select: (columns: string, options?: unknown) => any;
    insert: (values: unknown) => any;
    update: (values: unknown) => any;
    upsert: (values: unknown, options?: unknown) => any;
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

/** Franquia de IA resolvida para o tenant (FR-B3). */
export interface AiQuota {
  /** Cota mensal do plano: `null` = ilimitado. */
  limit: number | null;
  /** Status efetivo da assinatura (null = sem direito/sem linha). */
  status: SubscriptionStatus | null;
  /** `features.ai` do tier efetivo (false quando o plano não inclui IA). */
  aiFeatureOn: boolean;
  /** Início do período corrente (`YYYY-MM-DD`) usado no contador. */
  periodStart: string;
}

/** Exercício do catálogo (tenant + global) como DADO do prompt. */
export interface ExerciseCatalogItem {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string[];
}

/** Superfície de efeitos que cada `index.ts` consome. */
export interface Runtime {
  verifyJwt: (authorizationHeader: string | null) => Promise<AuthenticatedUser | null>;
  resolveProfile: (userId: string) => Promise<ProfileContext | null>;
  /**
   * Catálogo de exercícios visíveis ao tenant (próprios + biblioteca global
   * `tenant_id IS NULL`), ordenado por nome, limitado a `EXERCISE_CATALOG_LIMIT`.
   * service_role, usado SÓ após o auth-guard.
   */
  listExercises: (tenantId: string) => Promise<ExerciseCatalogItem[]>;
  countRecentCalls: (tenantId: string, userId: string, sinceIso: string) => Promise<number>;
  insertPendingGeneration: (input: PendingGenerationInput) => Promise<string>;
  finishGeneration: (id: string, result: GenerationResult) => Promise<void>;
  writeUsageLog: (record: UsageLogRecord) => Promise<void>;
  estimateCost: (model: string | null, inputTokens: number | null, outputTokens: number | null) => number | null;
  /** Resolve a franquia de IA do tenant (status, limite, feature, período). */
  getAiQuota: (tenantId: string) => Promise<AiQuota>;
  /** Lê o uso consumido no período (0 se não houver linha). */
  getAiUsed: (tenantId: string, periodStart: string) => Promise<number>;
  /** Incrementa o contador do período (upsert +1). */
  incrementAiUsed: (tenantId: string, periodStart: string) => Promise<void>;
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

    async listExercises(tenantId) {
      // Exercícios do tenant + biblioteca global (tenant_id IS NULL). O filtro
      // de tenant é carimbado explicitamente no `or` (architecture §4.4).
      const { data, error } = await admin
        .from('exercises')
        .select('id, name, muscle_groups, equipment')
        .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
        .order('name', { ascending: true })
        .limit(EXERCISE_CATALOG_LIMIT);
      if (error || !data) return [];
      return (data as Array<{ id: string; name: string; muscle_groups: string[] | null; equipment: string[] | null }>).map(
        (row) => ({
          id: row.id,
          name: row.name,
          muscle_groups: row.muscle_groups ?? [],
          equipment: row.equipment ?? [],
        }),
      );
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

    async getAiQuota(tenantId) {
      // Assinatura do tenant + tier/franquia do plano (service_role, public.-qual.).
      const { data: sub } = await admin
        .from('subscriptions')
        .select('status, stripe_subscription_id, current_period_start, plans ( tier, ai_quota_monthly )')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      // account_type do MASTER do tenant.
      const { data: master } = await admin
        .from('profiles')
        .select('account_type')
        .eq('tenant_id', tenantId)
        .eq('is_tenant_master', true)
        .maybeSingle();

      const planos = (sub as { plans?: { tier: PlanTier; ai_quota_monthly: number | null } | { tier: PlanTier; ai_quota_monthly: number | null }[] } | null)?.plans;
      const plano = Array.isArray(planos) ? (planos[0] ?? null) : (planos ?? null);

      let tier: PlanTier | null = plano?.tier ?? null;
      let limit: number | null = plano?.ai_quota_monthly ?? null;
      let status: SubscriptionStatus | null = (sub?.status as SubscriptionStatus | null) ?? null;

      const accountType = (master?.account_type as string | null) ?? 'professional';
      const hasStripeSubscriptionId = sub?.stripe_subscription_id != null;
      const preTrial =
        status == null || status === 'incomplete' || status === 'incomplete_expired';

      // Graça pré-trial do aluno autônomo: sem assinatura real e status pré-trial
      // => tier individual em trialing (franquia individual = 50; ver seed).
      if (accountType === 'self_managed' && !hasStripeSubscriptionId && preTrial) {
        tier = 'individual';
        status = 'trialing';
        limit = 50;
      }

      const periodStart = resolvePeriodStart(sub?.current_period_start as string | null | undefined);

      return {
        limit,
        status,
        aiFeatureOn: aiFeatureForTier(tier),
        periodStart,
      };
    },

    async getAiUsed(tenantId, periodStart) {
      const { data, error } = await admin
        .from('ai_usage_counters')
        .select('used')
        .eq('tenant_id', tenantId)
        .eq('period_start', periodStart)
        .maybeSingle();
      if (error || !data) return 0;
      return (data.used as number) ?? 0;
    },

    async incrementAiUsed(tenantId, periodStart) {
      // Lê o uso atual e re-grava +1 (upsert). Espelha o
      // `on conflict (tenant_id, period_start) do update set used = used + 1`.
      const { data } = await admin
        .from('ai_usage_counters')
        .select('used')
        .eq('tenant_id', tenantId)
        .eq('period_start', periodStart)
        .maybeSingle();
      const atual = (data?.used as number | undefined) ?? 0;
      await admin
        .from('ai_usage_counters')
        .upsert(
          { tenant_id: tenantId, period_start: periodStart, used: atual + 1, updated_at: new Date().toISOString() },
          { onConflict: 'tenant_id,period_start' },
        );
    },
  };
}
