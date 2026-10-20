'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  mapearErroIa,
  MSG_IA_INDISPONIVEL,
  type CorpoErroIa,
  type EntradaErroIa,
} from '@/lib/ia/erros';
import {
  mapearDietaParaLinhas,
  mapearTreinoParaItens,
  mapearAnaliseParaAvaliacao,
  nomesDeExerciciosDoTreino,
} from '@/lib/ia/materializacao';
import {
  gerarDietaInputSchema,
  sugerirTreinoInputSchema,
  analisarAvaliacaoInputSchema,
} from '@/schemas/ia-ui';
import {
  generateDietOutputSchema,
  suggestWorkoutOutputSchema,
  analyzeAssessmentOutputSchema,
  type GenerateDietOutput,
  type SuggestWorkoutOutput,
  type AnalyzeAssessmentOutput,
} from '@/schemas/ia';
import type { AiJobType } from '@/types/database.types';

/**
 * Server Actions da integração IA↔UI (FEAT-005).
 *
 * Fluxo rascunho→aprovação (ADR 0001 §6): as actions de geração invocam as
 * Edge Functions com o JWT do professor (`createClient()` server, RLS ativo);
 * as funções gravam o rascunho em `ai_generations` e devolvem
 * `{ generation_id, status, draft }` — NUNCA materializam. A materialização só
 * acontece em `aprovarGeracao`, dentro desta camada, escrevendo nas tabelas
 * reais com o RLS do professor.
 *
 * Não há checagem de consentimento (decisão de escopo — FEAT-003).
 */

/** Estado tipado retornado pelas actions (mesmo molde de `actions/execucao.ts`). */
export interface EstadoAcao {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
}

/** Estado das actions de geração: além do `EstadoAcao`, carrega o rascunho. */
export interface EstadoGeracao extends EstadoAcao {
  /** Id da linha em `ai_generations`. */
  generationId?: string;
  /** Rascunho estruturado devolvido pela função (já validado pelo Zod de saída). */
  draft?: unknown;
}

/** Converte os erros do Zod num mapa `campo -> primeira mensagem`. */
function erroDeCampo(flatten: {
  fieldErrors: Record<string, string[] | undefined>;
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [campo, mensagens] of Object.entries(flatten.fieldErrors)) {
    if (mensagens && mensagens.length > 0) {
      out[campo] = mensagens[0];
    }
  }
  return out;
}

/**
 * Normaliza o erro do `supabase.functions.invoke` para o formato que
 * `mapearErroIa` entende (status + corpo + nome), lidando com o
 * `FunctionsHttpError` (tem `context: Response`) e o `FunctionsFetchError`.
 */
async function normalizarErroInvoke(error: unknown): Promise<EntradaErroIa> {
  const err = error as { name?: string; context?: unknown } | null;
  const name = err?.name ?? null;

  const context = err?.context;
  // `FunctionsHttpError.context` é a Response original da função.
  if (context && typeof context === 'object' && 'status' in context) {
    const resp = context as Response;
    let body: CorpoErroIa | null = null;
    try {
      body = (await resp.clone().json()) as CorpoErroIa;
    } catch {
      body = null;
    }
    return { status: resp.status, body, name };
  }

  return { status: null, body: null, name };
}

/** Garante que quem chama é o professor; devolve o id/tenant quando ok. */
async function exigirProfessor(): Promise<
  { ok: true; userId: string; tenantId: string } | { ok: false; estado: EstadoAcao }
> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, estado: { ok: false, message: 'Sessão expirada. Entre novamente.' } };
  }
  if (user.role !== 'trainer') {
    return {
      ok: false,
      estado: { ok: false, message: 'Apenas o professor pode usar os recursos de IA.' },
    };
  }
  return { ok: true, userId: user.userId, tenantId: user.tenantId };
}

/** Invoca uma Edge Function de IA com o JWT do professor e trata erros em pt-BR. */
async function invocarFuncaoIa(
  nome: 'generate-diet' | 'suggest-workout' | 'analyze-assessment',
  body: unknown
): Promise<EstadoGeracao> {
  const supabase = await createClient();

  const { data, error } = await supabase.functions.invoke(nome, {
    body: body as Record<string, unknown>,
  });

  if (error) {
    const normalizado = await normalizarErroInvoke(error);
    return { ok: false, message: mapearErroIa(normalizado) };
  }

  const resposta = data as { generation_id?: string; status?: string; draft?: unknown } | null;
  if (!resposta?.generation_id || !resposta.draft) {
    return { ok: false, message: MSG_IA_INDISPONIVEL };
  }

  return {
    ok: true,
    message: 'Rascunho gerado. Revise antes de aprovar.',
    generationId: resposta.generation_id,
    draft: resposta.draft,
  };
}

/** Gera um rascunho de dieta (Edge Function `generate-diet`). */
export async function gerarDieta(input: unknown): Promise<EstadoGeracao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const parsed = gerarDietaInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os dados para gerar a dieta.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const resultado = await invocarFuncaoIa('generate-diet', parsed.data);
  if (resultado.ok) revalidatePath('/professor/dietas');
  return resultado;
}

/** Gera um rascunho de treino (Edge Function `suggest-workout`). */
export async function sugerirTreino(input: unknown): Promise<EstadoGeracao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const parsed = sugerirTreinoInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os dados para sugerir o treino.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const resultado = await invocarFuncaoIa('suggest-workout', parsed.data);
  if (resultado.ok) revalidatePath('/professor/treinos');
  return resultado;
}

/** Gera um rascunho de análise de avaliação (Edge Function `analyze-assessment`). */
export async function analisarAvaliacao(input: unknown): Promise<EstadoGeracao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const parsed = analisarAvaliacaoInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Avaliação inválida para análise.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const resultado = await invocarFuncaoIa('analyze-assessment', parsed.data);
  if (resultado.ok) revalidatePath(`/professor/avaliacoes/${parsed.data.assessment_id}`);
  return resultado;
}

/**
 * Valida o draft editado com o Zod de saída correspondente ao `job_type` e
 * grava em `ai_generations.output`. Não materializa nada.
 */
export async function editarRascunho(
  generationId: string,
  draftEditado: unknown
): Promise<EstadoAcao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const supabase = await createClient();

  const { data: gen, error: erroGen } = await supabase
    .from('ai_generations')
    .select('id, job_type, status')
    .eq('id', generationId)
    .maybeSingle();

  if (erroGen) {
    return { ok: false, message: `Não foi possível abrir o rascunho: ${erroGen.message}` };
  }
  if (!gen) {
    return { ok: false, message: 'Rascunho não encontrado.' };
  }

  const validado = validarDraftPorJob(gen.job_type as AiJobType, draftEditado);
  if (!validado.ok) {
    return { ok: false, message: validado.message };
  }

  const { error: erroUpdate } = await supabase
    .from('ai_generations')
    .update({ output: validado.draft as never })
    .eq('id', generationId);

  if (erroUpdate) {
    return { ok: false, message: `Não foi possível salvar o rascunho: ${erroUpdate.message}` };
  }

  return { ok: true, message: 'Rascunho salvo.', id: generationId };
}

/**
 * Aprova um rascunho e MATERIALIZA no destino real conforme `job_type`:
 * - `generate_diet`  → `diets` (draft) + `diet_meals` + `diet_meal_foods` (+ lista de compras).
 * - `suggest_workout`→ `workout_plans` (draft) + `workout_plan_items`.
 * - `analyze_assessment` → `physical_assessments.ai_analysis/ai_recommendations`.
 *
 * Em todos os casos carimba `ai_generations.target_table/target_id/reviewed_by/
 * reviewed_at/status`. Só aqui há materialização — a geração nunca materializa.
 */
export async function aprovarGeracao(generationId: string): Promise<EstadoAcao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const supabase = await createClient();

  const { data: gen, error: erroGen } = await supabase
    .from('ai_generations')
    .select('id, tenant_id, job_type, status, input, output, target_id')
    .eq('id', generationId)
    .maybeSingle();

  if (erroGen) {
    return { ok: false, message: `Não foi possível abrir o rascunho: ${erroGen.message}` };
  }
  if (!gen) {
    return { ok: false, message: 'Rascunho não encontrado.' };
  }
  if (gen.target_id) {
    return { ok: false, message: 'Este rascunho já foi aprovado.' };
  }

  const validado = validarDraftPorJob(gen.job_type as AiJobType, gen.output);
  if (!validado.ok) {
    return { ok: false, message: validado.message };
  }

  const input = (gen.input ?? {}) as Record<string, unknown>;
  const studentId = typeof input.student_id === 'string' ? input.student_id : null;

  let targetTable: string;
  let targetId: string;

  try {
    if (gen.job_type === 'generate_diet') {
      if (!studentId) return { ok: false, message: 'Rascunho sem aluno associado.' };
      targetId = await materializarDieta(supabase, {
        tenantId: gen.tenant_id,
        trainerId: guard.userId,
        studentId,
        assessmentId: typeof input.assessment_id === 'string' ? input.assessment_id : null,
        draft: validado.draft as GenerateDietOutput,
      });
      targetTable = 'diets';
    } else if (gen.job_type === 'suggest_workout') {
      if (!studentId) return { ok: false, message: 'Rascunho sem aluno associado.' };
      targetId = await materializarTreino(supabase, {
        tenantId: gen.tenant_id,
        trainerId: guard.userId,
        studentId,
        draft: validado.draft as SuggestWorkoutOutput,
      });
      targetTable = 'workout_plans';
    } else if (gen.job_type === 'analyze_assessment') {
      const assessmentId =
        typeof input.assessment_id === 'string' ? input.assessment_id : null;
      if (!assessmentId) return { ok: false, message: 'Rascunho sem avaliação associada.' };
      targetId = await materializarAnalise(supabase, {
        assessmentId,
        draft: validado.draft as AnalyzeAssessmentOutput,
      });
      targetTable = 'physical_assessments';
    } else {
      return { ok: false, message: 'Tipo de geração não suportado para aprovação.' };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'erro desconhecido';
    return { ok: false, message: `Não foi possível materializar o rascunho: ${msg}` };
  }

  const { error: erroCarimbo } = await supabase
    .from('ai_generations')
    .update({
      status: 'succeeded',
      target_table: targetTable,
      target_id: targetId,
      reviewed_by: guard.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', generationId);

  if (erroCarimbo) {
    return {
      ok: false,
      message: `Materializado, mas falhou ao carimbar o rascunho: ${erroCarimbo.message}`,
    };
  }

  revalidatePath('/professor/dietas');
  revalidatePath('/professor/treinos');
  return { ok: true, message: 'Rascunho aprovado e materializado.', id: targetId };
}

/** Marca um rascunho como rejeitado (não materializa). */
export async function rejeitarGeracao(generationId: string): Promise<EstadoAcao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const supabase = await createClient();
  const { error } = await supabase
    .from('ai_generations')
    .update({ status: 'rejected', reviewed_by: guard.userId, reviewed_at: new Date().toISOString() })
    .eq('id', generationId);

  if (error) {
    return { ok: false, message: `Não foi possível rejeitar o rascunho: ${error.message}` };
  }

  revalidatePath('/professor/dietas');
  revalidatePath('/professor/treinos');
  return { ok: true, message: 'Rascunho descartado.', id: generationId };
}

// -----------------------------------------------------------------------------
// Helpers internos (não exportados — regra de 'use server').
// -----------------------------------------------------------------------------

type ValidacaoDraft =
  | { ok: true; draft: unknown }
  | { ok: false; message: string };

/** Valida o draft de acordo com o `job_type` usando o Zod de saída da função. */
function validarDraftPorJob(jobType: AiJobType, draft: unknown): ValidacaoDraft {
  const semConteudo = { ok: false as const, message: 'Rascunho vazio ou inválido.' };
  if (draft == null) return semConteudo;

  switch (jobType) {
    case 'generate_diet': {
      const r = generateDietOutputSchema.safeParse(draft);
      return r.success ? { ok: true, draft: r.data } : semConteudo;
    }
    case 'suggest_workout': {
      const r = suggestWorkoutOutputSchema.safeParse(draft);
      return r.success ? { ok: true, draft: r.data } : semConteudo;
    }
    case 'analyze_assessment': {
      const r = analyzeAssessmentOutputSchema.safeParse(draft);
      return r.success ? { ok: true, draft: r.data } : semConteudo;
    }
    default:
      return { ok: false, message: 'Tipo de geração não suportado.' };
  }
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Insere `diets` + refeições + alimentos + lista de compras. Devolve o id da dieta. */
async function materializarDieta(
  supabase: Supabase,
  args: {
    tenantId: string;
    trainerId: string;
    studentId: string;
    assessmentId: string | null;
    draft: GenerateDietOutput;
  }
): Promise<string> {
  const { diet, refeicoes, shopping_list } = mapearDietaParaLinhas(args.draft);

  const { data: dietaCriada, error: erroDieta } = await supabase
    .from('diets')
    .insert({
      tenant_id: args.tenantId,
      student_id: args.studentId,
      trainer_id: args.trainerId,
      status: 'draft',
      target_kcal: diet.target_kcal,
      protein_g: diet.protein_g,
      carbs_g: diet.carbs_g,
      fat_g: diet.fat_g,
      based_on_assessment_id: args.assessmentId,
    })
    .select('id')
    .single();

  if (erroDieta || !dietaCriada) {
    throw new Error(erroDieta?.message ?? 'falha ao criar a dieta');
  }
  const dietId = dietaCriada.id;

  for (const { refeicao, alimentos } of refeicoes) {
    const { data: refCriada, error: erroRef } = await supabase
      .from('diet_meals')
      .insert({
        diet_id: dietId,
        name: refeicao.name,
        time: refeicao.time,
        order_index: refeicao.order_index,
      })
      .select('id')
      .single();

    if (erroRef || !refCriada) {
      throw new Error(erroRef?.message ?? 'falha ao criar refeição');
    }

    if (alimentos.length > 0) {
      const { error: erroFoods } = await supabase.from('diet_meal_foods').insert(
        alimentos.map((a) => ({
          meal_id: refCriada.id,
          food_name: a.food_name,
          quantity: a.quantity,
          unit: a.unit,
          kcal: a.kcal,
          protein_g: a.protein_g,
          carbs_g: a.carbs_g,
          fat_g: a.fat_g,
        }))
      );
      if (erroFoods) throw new Error(erroFoods.message);
    }
  }

  if (shopping_list.length > 0) {
    const { error: erroLista } = await supabase
      .from('diet_shopping_lists')
      .insert({ diet_id: dietId, items: shopping_list });
    if (erroLista) throw new Error(erroLista.message);
  }

  return dietId;
}

/** Insere `workout_plans` + itens, resolvendo/criando exercícios. Devolve o id do plano. */
async function materializarTreino(
  supabase: Supabase,
  args: {
    tenantId: string;
    trainerId: string;
    studentId: string;
    draft: SuggestWorkoutOutput;
  }
): Promise<string> {
  // 1. Resolve cada nome de exercício para um id (tenant + catálogo global),
  //    criando no tenant os que não existirem.
  const nomes = nomesDeExerciciosDoTreino(args.draft);
  const mapa = await resolverOuCriarExercicios(supabase, args.tenantId, nomes);

  const itens = mapearTreinoParaItens(args.draft, (nome) => mapa.get(nome.trim().toLowerCase()) ?? null);

  // 2. Cria o plano como rascunho.
  const { data: plano, error: erroPlano } = await supabase
    .from('workout_plans')
    .insert({
      tenant_id: args.tenantId,
      student_id: args.studentId,
      trainer_id: args.trainerId,
      name: 'Treino sugerido por IA',
      status: 'draft',
    })
    .select('id')
    .single();

  if (erroPlano || !plano) {
    throw new Error(erroPlano?.message ?? 'falha ao criar o plano de treino');
  }

  // 3. Insere os itens.
  if (itens.length > 0) {
    const { error: erroItens } = await supabase.from('workout_plan_items').insert(
      itens.map((it) => ({
        plan_id: plano.id,
        exercise_id: it.exercise_id,
        weekday: it.weekday,
        order_index: it.order_index,
        sets: it.sets,
        reps: it.reps,
        rest_seconds: it.rest_seconds,
        notes: it.notes,
      }))
    );
    if (erroItens) throw new Error(erroItens.message);
  }

  return plano.id;
}

/**
 * Resolve nomes de exercício para ids. Busca entre os exercícios visíveis
 * (catálogo global `tenant_id is null` + tenant via RLS); cria no tenant os que
 * não existirem. Devolve um Map `nome_minúsculo -> id`.
 */
async function resolverOuCriarExercicios(
  supabase: Supabase,
  tenantId: string,
  nomes: string[]
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  if (nomes.length === 0) return mapa;

  const { data: existentes, error } = await supabase
    .from('exercises')
    .select('id, name')
    .in('name', nomes);

  if (error) throw new Error(error.message);

  for (const ex of existentes ?? []) {
    mapa.set(ex.name.trim().toLowerCase(), ex.id);
  }

  const faltantes = nomes.filter((n) => !mapa.has(n.trim().toLowerCase()));
  if (faltantes.length > 0) {
    const { data: criados, error: erroCriar } = await supabase
      .from('exercises')
      .insert(faltantes.map((name) => ({ tenant_id: tenantId, name })))
      .select('id, name');

    if (erroCriar || !criados) {
      throw new Error(erroCriar?.message ?? 'falha ao criar exercícios da sugestão');
    }
    for (const ex of criados) {
      mapa.set(ex.name.trim().toLowerCase(), ex.id);
    }
  }

  return mapa;
}

/** Atualiza `physical_assessments.ai_analysis/ai_recommendations`. Devolve o id da avaliação. */
async function materializarAnalise(
  supabase: Supabase,
  args: {
    assessmentId: string;
    draft: AnalyzeAssessmentOutput;
  }
): Promise<string> {
  const atualizacao = mapearAnaliseParaAvaliacao(args.draft);

  const { data, error } = await supabase
    .from('physical_assessments')
    .update({
      ai_analysis: atualizacao.ai_analysis as never,
      ai_recommendations: atualizacao.ai_recommendations as never,
    })
    .eq('id', args.assessmentId)
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'falha ao gravar a análise na avaliação');
  }
  return data.id;
}
