'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser, isSelfManaged } from '@/lib/auth';
import { requireEntitlement } from '@/lib/billing/guard';
import type { FeatureKey } from '@/lib/billing/entitlements';
import { createClient } from '@/lib/supabase/server';
import {
  mapearErroIa,
  MSG_IA_INDISPONIVEL,
  type CorpoErroIa,
  type EntradaErroIa,
} from '@/lib/ia/erros';
import {
  mapearDietaParaLinhas,
  mapearTreinoV2ParaLinhas,
  mapearAnaliseParaAvaliacao,
  idsFaltantes,
  normalizarGoalRestrictions,
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
  | { ok: true; userId: string; tenantId: string; selfManaged: boolean }
  | { ok: false; estado: EstadoAcao }
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
  return {
    ok: true,
    userId: user.userId,
    tenantId: user.tenantId,
    selfManaged: isSelfManaged(user),
  };
}

/**
 * Aplica `requireEntitlement` para cada feature exigida (na ordem). Retorna o
 * primeiro `{ ok:false }` encontrado, ou `{ ok:true }` quando todas liberadas.
 */
async function exigirEntitlements(...features: FeatureKey[]): Promise<EstadoAcao> {
  for (const feature of features) {
    const direito = await requireEntitlement(feature);
    if (!direito.ok) return direito;
  }
  return { ok: true };
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

  const direito = await exigirEntitlements('diets', 'ai');
  if (!direito.ok) return direito;

  const parsed = gerarDietaInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os dados para gerar a dieta.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  // Aluno autônomo (self_managed): a dieta é SEMPRE para si — força
  // `student_id` = próprio userId (ignora o enviado). Como esse `input` é
  // persistido em `ai_generations` e lido na aprovação (materializarDieta usa
  // input.student_id), a dieta materializada também fica para si. Como ele é o
  // professor do próprio tenant, consegue aprovar normalmente.
  const corpo = guard.selfManaged
    ? { ...parsed.data, student_id: guard.userId }
    : parsed.data;

  const resultado = await invocarFuncaoIa('generate-diet', corpo);
  if (resultado.ok) revalidatePath('/professor/dietas');
  return resultado;
}

/** Gera um rascunho de treino (Edge Function `suggest-workout`). */
export async function sugerirTreino(input: unknown): Promise<EstadoGeracao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const direito = await exigirEntitlements('ai');
  if (!direito.ok) return direito;

  const parsed = sugerirTreinoInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os dados para sugerir o treino.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  // Aluno autônomo (self_managed): o treino é SEMPRE para si — força
  // `student_id` = próprio userId (ignora o enviado). Como esse `input` é
  // persistido em `ai_generations` e lido na aprovação (materializarTreino usa
  // input.student_id), a ficha materializada também fica para si. Espelha o
  // mesmo padrão de `gerarDieta`.
  const corpo = guard.selfManaged
    ? { ...parsed.data, student_id: guard.userId }
    : parsed.data;

  const resultado = await invocarFuncaoIa('suggest-workout', corpo);
  if (resultado.ok) revalidatePath('/professor/treinos');
  return resultado;
}

/** Gera um rascunho de análise de avaliação (Edge Function `analyze-assessment`). */
export async function analisarAvaliacao(input: unknown): Promise<EstadoGeracao> {
  const guard = await exigirProfessor();
  if (!guard.ok) return guard.estado;

  const direito = await exigirEntitlements('assessments', 'ai');
  if (!direito.ok) return direito;

  const parsed = analisarAvaliacaoInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Avaliação inválida para análise.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  // Resolve a avaliação ANTERIOR do mesmo aluno para a IA comparar a evolução.
  // O client manda só o assessment_id; aqui buscamos (via RLS) a avaliação
  // imediatamente anterior (mesmo aluno, assessed_at < a atual, a mais recente)
  // e injetamos previous_assessment_id — a Edge Function já sabe usá-lo. Sem
  // isto a IA respondia "não há avaliação anterior para comparação".
  const corpo = { ...parsed.data };
  if (!corpo.previous_assessment_id) {
    const anteriorId = await resolverAvaliacaoAnterior(corpo.assessment_id);
    if (anteriorId) corpo.previous_assessment_id = anteriorId;
  }

  const resultado = await invocarFuncaoIa('analyze-assessment', corpo);
  if (resultado.ok) revalidatePath(`/professor/avaliacoes/${parsed.data.assessment_id}`);
  return resultado;
}

/**
 * Dado o id de uma avaliação, acha a avaliação imediatamente anterior do mesmo
 * aluno (menor `assessed_at` que a atual, a mais recente dentre elas). Lê via
 * RLS (o professor só enxerga avaliações do próprio tenant). Retorna `null` se
 * não houver anterior ou se a avaliação atual não for encontrada.
 */
async function resolverAvaliacaoAnterior(assessmentId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: atual } = await supabase
    .from('physical_assessments')
    .select('student_id, assessed_at')
    .eq('id', assessmentId)
    .maybeSingle();
  if (!atual) return null;

  const { data: anterior } = await supabase
    .from('physical_assessments')
    .select('id')
    .eq('student_id', atual.student_id)
    .lt('assessed_at', atual.assessed_at)
    .order('assessed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return anterior?.id ?? null;
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
  const direitoEdicao = await requireEntitlement(null);
  if (!direitoEdicao.ok) return direitoEdicao;

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

  // Gate de entitlement por job_type ANTES de materializar: mesmo com o
  // rascunho gerado, aprovar (materializar) uma feature bloqueada por plano
  // retorna { ok:false }.
  const featurePorJob: Record<AiJobType, FeatureKey | null> = {
    generate_diet: 'diets',
    suggest_workout: null,
    analyze_assessment: 'assessments',
    weekly_adherence: null,
  };
  const featureAprovacao = featurePorJob[gen.job_type as AiJobType] ?? null;
  const direito = await requireEntitlement(featureAprovacao);
  if (!direito.ok) return direito;

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
        goal: input.goal,
        restrictions: input.restrictions,
        selfManaged: guard.selfManaged,
        draft: validado.draft as GenerateDietOutput,
      });
      targetTable = 'diets';
    } else if (gen.job_type === 'suggest_workout') {
      if (!studentId) return { ok: false, message: 'Rascunho sem aluno associado.' };
      targetId = await materializarTreino(supabase, {
        tenantId: gen.tenant_id,
        trainerId: guard.userId,
        studentId,
        selfManaged: guard.selfManaged,
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
    goal: unknown;
    restrictions: unknown;
    selfManaged: boolean;
    draft: GenerateDietOutput;
  }
): Promise<string> {
  const { diet, refeicoes, shopping_list } = mapearDietaParaLinhas(args.draft);
  // `goal`/`restrictions` vêm do input da geração (texto livre); normalizamos
  // para o que cabe na linha `diets` (enum `goal_type` + `text[]`).
  const { goal, restrictions } = normalizarGoalRestrictions({
    goal: args.goal,
    restrictions: args.restrictions,
  });

  const { data: dietaCriada, error: erroDieta } = await supabase
    .from('diets')
    .insert({
      tenant_id: args.tenantId,
      student_id: args.studentId,
      trainer_id: args.trainerId,
      // Aluno autônomo (self_managed): nasce JÁ LIBERADA para si; professional
      // (B2B) segue o fluxo rascunho→revisão→liberação.
      status: args.selfManaged ? 'released' : 'draft',
      released_at: args.selfManaged ? new Date().toISOString() : null,
      goal,
      restrictions,
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

/**
 * Insere `workout_plans` (draft) + `workout_plan_items` + `workout_plan_item_sets`,
 * espelhando `criarFicha` (ver `actions/treinos.ts`). A IA escolhe exercícios SÓ
 * do catálogo e devolve `exercise_id` real; aqui VALIDAMOS que todo id existe no
 * escopo do professor (RLS) ANTES de gravar qualquer linha — lista vazia ou id
 * fora de escopo lança sem criar o plano. Nenhum exercício é criado por nome.
 * Devolve o id do plano.
 */
async function materializarTreino(
  supabase: Supabase,
  args: {
    tenantId: string;
    trainerId: string;
    studentId: string;
    selfManaged: boolean;
    draft: SuggestWorkoutOutput;
  }
): Promise<string> {
  // 1. Mapeia o draft v2 em linhas puras (itens + séries) e resolve o modo.
  const { modo, rotation_steps, itens } = mapearTreinoV2ParaLinhas(args.draft);

  // 2. Coleta o conjunto de exercise_id únicos exigidos pelo rascunho.
  const idsUnicos = [...new Set(itens.map((it) => it.item.exercise_id))];
  if (idsUnicos.length === 0) {
    throw new Error('O rascunho de treino não tem exercícios.');
  }

  // 3. Valida que TODOS os ids existem no escopo do professor (RLS ativo:
  //    catálogo global `tenant_id is null` + exercícios do tenant).
  const { data: encontrados, error: erroExercicios } = await supabase
    .from('exercises')
    .select('id')
    .in('id', idsUnicos);
  if (erroExercicios) throw new Error(erroExercicios.message);

  const faltantes = idsFaltantes(
    idsUnicos,
    (encontrados ?? []).map((e) => e.id)
  );
  if (faltantes.length > 0) {
    throw new Error(`Exercício inválido no rascunho: ${faltantes[0]}`);
  }

  // 4. SÓ ENTÃO cria o plano. POR DIVISÃO grava rotation_steps; POR DIA grava null.
  const { data: plano, error: erroPlano } = await supabase
    .from('workout_plans')
    .insert({
      tenant_id: args.tenantId,
      student_id: args.studentId,
      trainer_id: args.trainerId,
      name: 'Treino sugerido por IA',
      // Aluno autônomo (self_managed): nasce JÁ LIBERADA para si; professional
      // (B2B) segue o fluxo rascunho→revisão→liberação.
      status: args.selfManaged ? 'released' : 'draft',
      released_at: args.selfManaged ? new Date().toISOString() : null,
      rotation_steps: (modo === 'por_divisao' ? rotation_steps : null) as never,
    })
    .select('id')
    .single();

  if (erroPlano || !plano) {
    throw new Error(erroPlano?.message ?? 'falha ao criar o plano de treino');
  }

  // 5. Insere os itens com ids pré-gerados (para ligar as séries via FK).
  const itensComId = itens.map((it) => ({ id: crypto.randomUUID(), ...it }));

  const { error: erroItens } = await supabase.from('workout_plan_items').insert(
    itensComId.map(({ id, item }) => ({
      id,
      plan_id: plano.id,
      exercise_id: item.exercise_id,
      weekday: item.weekday,
      division: item.division,
      order_index: item.order_index,
      sets: item.sets,
      reps: item.reps,
      rest_seconds: item.rest_seconds,
      target_load: item.target_load,
      notes: item.notes,
    }))
  );
  if (erroItens) throw new Error(erroItens.message);

  // 6. Insere as séries achatadas, carimbando a FK do item pai.
  const linhasSeries = itensComId.flatMap(({ id, series }) =>
    series.map((serie) => ({
      plan_item_id: id,
      set_number: serie.set_number,
      kind: serie.kind,
      note: serie.note,
      target_reps: serie.target_reps,
      rest_seconds: serie.rest_seconds,
      target_load: serie.target_load,
    }))
  );
  if (linhasSeries.length > 0) {
    const { error: erroSeries } = await supabase
      .from('workout_plan_item_sets')
      .insert(linhasSeries as never);
    if (erroSeries) throw new Error(erroSeries.message);
  }

  return plano.id;
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
