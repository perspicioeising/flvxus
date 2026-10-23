'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  agendamentoSchema,
  criarFichaMultiModeloSchema,
  fichaSchema,
  modeloSchema,
  resolverPrazoParaData,
  transicaoPermitida,
  type AgendamentoInput,
  type CriarFichaMultiModeloInput,
  type FichaInput,
  type ItemFichaInput,
  type ItemModeloInput,
  type ModeloInput,
} from '@/schemas/treino';
import { formatarDataBr } from '@/components/professor/treinos/labels';
import type { PlanStatus } from '@/types/database.types';

/**
 * Server Actions do domínio de treinos (architecture.md §6.2, §6.4).
 *
 * TODA leitura/mutação usa `createClient()` (RLS ativo) — nunca filtramos
 * `tenant_id`/posse manualmente, exceto para CARIMBAR as colunas que as
 * policies de `with check` exigem (`tenant_id`, `trainer_id`). As policies em
 * supabase/migrations/20261020090800_rls_policies.sql garantem o isolamento e
 * a invariante "aluno só vê fichas `released`".
 *
 * MODELOS: `workouts (is_template=true)` + `workout_exercises`.
 * FICHAS:  `workout_plans` + `workout_plan_items`.
 *
 * Como os formulários enviam uma LISTA de itens (arrays), estas actions
 * recebem objetos já estruturados (não FormData) e validam com os schemas Zod
 * de `schemas/treino.ts` — o mesmo schema usado no cliente.
 */

/** Estado tipado retornado pelas actions para os forms. */
export interface EstadoAcao {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
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

// -----------------------------------------------------------------------------
// Montagem de payloads de itens
// -----------------------------------------------------------------------------

/** Linha de `workout_exercises` a partir de um item validado do modelo. */
function itemModeloParaLinha(workoutId: string, item: ItemModeloInput, indice: number) {
  return {
    workout_id: workoutId,
    exercise_id: item.exercise_id,
    order_index: item.order_index ?? indice,
    sets: item.sets ?? null,
    reps: item.reps ?? null,
    rest_seconds: item.rest_seconds ?? null,
    target_load: item.target_load ?? null,
    notes: item.notes ?? null,
  };
}

/** Linha de `workout_plan_items` a partir de um item validado da ficha. */
function itemFichaParaLinha(planId: string, item: ItemFichaInput, indice: number) {
  return {
    plan_id: planId,
    exercise_id: item.exercise_id,
    weekday: item.weekday ?? null,
    division: item.division ?? null,
    order_index: item.order_index ?? indice,
    sets: item.sets ?? null,
    reps: item.reps ?? null,
    rest_seconds: item.rest_seconds ?? null,
    target_load: item.target_load ?? null,
    notes: item.notes ?? null,
  };
}

// =============================================================================
// MODELOS (workouts is_template=true)
// =============================================================================

/**
 * Cria um MODELO reutilizável (`workouts` com `is_template=true`) e grava seus
 * itens em `workout_exercises`. Carimba `tenant_id`/`created_by` do professor
 * (exigência do `with check` das policies).
 */
export async function criarModelo(entrada: ModeloInput): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode criar modelos.' };
  }

  const parsed = modeloSchema.safeParse(entrada);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { data: workout, error: erroWorkout } = await supabase
    .from('workouts')
    .insert({
      tenant_id: professor.tenantId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      is_template: true,
      created_by: professor.userId,
    })
    .select('id')
    .single();

  if (erroWorkout || !workout) {
    return {
      ok: false,
      message: `Não foi possível criar o modelo: ${erroWorkout?.message ?? 'erro desconhecido'}`,
    };
  }

  const linhas = parsed.data.itens.map((item, i) => itemModeloParaLinha(workout.id, item, i));
  const { error: erroItens } = await supabase.from('workout_exercises').insert(linhas);

  if (erroItens) {
    // Reverte o cabeçalho para não deixar modelo sem itens.
    await supabase.from('workouts').delete().eq('id', workout.id);
    return {
      ok: false,
      message: `Não foi possível salvar os exercícios: ${erroItens.message}`,
    };
  }

  revalidatePath('/professor/modelos-treino');

  return { ok: true, message: 'Modelo criado.', id: workout.id };
}

/**
 * Edita um MODELO. Atualiza o cabeçalho e regrava a lista de itens (apaga os
 * atuais e insere os enviados) — mais simples e previsível que diffs, e o RLS
 * impede tocar em modelos de outro tenant.
 */
export async function editarModelo(
  workoutId: string,
  entrada: ModeloInput
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode editar modelos.' };
  }

  const parsed = modeloSchema.safeParse(entrada);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { error: erroWorkout } = await supabase
    .from('workouts')
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .eq('id', workoutId);

  if (erroWorkout) {
    return { ok: false, message: `Não foi possível salvar: ${erroWorkout.message}` };
  }

  const { error: erroDelete } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', workoutId);

  if (erroDelete) {
    return { ok: false, message: `Não foi possível atualizar os itens: ${erroDelete.message}` };
  }

  const linhas = parsed.data.itens.map((item, i) => itemModeloParaLinha(workoutId, item, i));
  const { error: erroItens } = await supabase.from('workout_exercises').insert(linhas);

  if (erroItens) {
    return { ok: false, message: `Não foi possível salvar os exercícios: ${erroItens.message}` };
  }

  revalidatePath('/professor/modelos-treino');
  revalidatePath(`/professor/modelos-treino/${workoutId}`);

  return { ok: true, message: 'Modelo atualizado.', id: workoutId };
}

/** Exclui um MODELO (itens caem por `on delete cascade`). */
export async function excluirModelo(workoutId: string): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode excluir modelos.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId);

  if (error) {
    return { ok: false, message: `Não foi possível excluir: ${error.message}` };
  }

  revalidatePath('/professor/modelos-treino');

  return { ok: true, message: 'Modelo excluído.', id: workoutId };
}

// =============================================================================
// FICHAS (workout_plans)
// =============================================================================

/**
 * Cria uma FICHA por aluno (`workout_plans` em `draft`) e grava seus itens em
 * `workout_plan_items`. Carimba `tenant_id`/`trainer_id` do professor. A ficha
 * nasce em `draft` — só fica visível ao aluno quando o professor a libera
 * (`released`), invariante garantida por RLS.
 */
export async function criarFicha(entrada: FichaInput): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode criar fichas.' };
  }

  const parsed = fichaSchema.safeParse(entrada);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { data: plan, error: erroPlan } = await supabase
    .from('workout_plans')
    .insert({
      tenant_id: professor.tenantId,
      trainer_id: professor.userId,
      student_id: parsed.data.student_id,
      name: parsed.data.name,
      status: 'draft',
      source_workout_id: parsed.data.source_workout_id ?? null,
    })
    .select('id')
    .single();

  if (erroPlan || !plan) {
    return {
      ok: false,
      message: `Não foi possível criar a ficha: ${erroPlan?.message ?? 'erro desconhecido'}`,
    };
  }

  const linhas = parsed.data.itens.map((item, i) => itemFichaParaLinha(plan.id, item, i));
  const { error: erroItens } = await supabase.from('workout_plan_items').insert(linhas);

  if (erroItens) {
    await supabase.from('workout_plans').delete().eq('id', plan.id);
    return {
      ok: false,
      message: `Não foi possível salvar os exercícios: ${erroItens.message}`,
    };
  }

  revalidatePath('/professor/treinos');

  return { ok: true, message: 'Ficha criada.', id: plan.id };
}

/**
 * Edita uma FICHA (cabeçalho + regrava itens). Não altera `status` nem
 * `released_at` — isso é feito por `alterarStatusFicha`.
 */
export async function editarFicha(
  planId: string,
  entrada: FichaInput
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode editar fichas.' };
  }

  const parsed = fichaSchema.safeParse(entrada);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { error: erroPlan } = await supabase
    .from('workout_plans')
    .update({
      student_id: parsed.data.student_id,
      name: parsed.data.name,
      source_workout_id: parsed.data.source_workout_id ?? null,
    })
    .eq('id', planId);

  if (erroPlan) {
    return { ok: false, message: `Não foi possível salvar: ${erroPlan.message}` };
  }

  const { error: erroDelete } = await supabase
    .from('workout_plan_items')
    .delete()
    .eq('plan_id', planId);

  if (erroDelete) {
    return { ok: false, message: `Não foi possível atualizar os itens: ${erroDelete.message}` };
  }

  const linhas = parsed.data.itens.map((item, i) => itemFichaParaLinha(planId, item, i));
  const { error: erroItens } = await supabase.from('workout_plan_items').insert(linhas);

  if (erroItens) {
    return { ok: false, message: `Não foi possível salvar os exercícios: ${erroItens.message}` };
  }

  revalidatePath('/professor/treinos');
  revalidatePath(`/professor/treinos/${planId}`);

  return { ok: true, message: 'Ficha atualizada.', id: planId };
}

/** Exclui uma FICHA (itens caem por `on delete cascade`). */
export async function excluirFicha(planId: string): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode excluir fichas.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('workout_plans').delete().eq('id', planId);

  if (error) {
    return { ok: false, message: `Não foi possível excluir: ${error.message}` };
  }

  revalidatePath('/professor/treinos');

  return { ok: true, message: 'Ficha excluída.', id: planId };
}

/**
 * Cria uma FICHA a partir de um MODELO: copia os itens de `workout_exercises`
 * do modelo (`source_workout_id`) para `workout_plan_items` da nova ficha,
 * preservando ordem e prescrição. Os itens do modelo não têm `weekday`, então
 * entram sem dia definido (o professor organiza depois). A ficha nasce em
 * `draft` com `source_workout_id` preenchido.
 */
export async function criarFichaDeModelo(
  sourceWorkoutId: string,
  studentId: string,
  nome?: string
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode criar fichas.' };
  }

  const supabase = await createClient();

  // Lê o modelo (RLS garante que é do tenant) + seus itens.
  const { data: modelo, error: erroModelo } = await supabase
    .from('workouts')
    .select('id, name, is_template')
    .eq('id', sourceWorkoutId)
    .single();

  if (erroModelo || !modelo) {
    return { ok: false, message: 'Modelo não encontrado.' };
  }

  const { data: itensModelo, error: erroItensModelo } = await supabase
    .from('workout_exercises')
    .select('exercise_id, order_index, sets, reps, rest_seconds, target_load, notes')
    .eq('workout_id', sourceWorkoutId)
    .order('order_index', { ascending: true });

  if (erroItensModelo) {
    return { ok: false, message: `Não foi possível ler o modelo: ${erroItensModelo.message}` };
  }

  if (!itensModelo || itensModelo.length === 0) {
    return { ok: false, message: 'O modelo não possui exercícios para copiar.' };
  }

  const { data: plan, error: erroPlan } = await supabase
    .from('workout_plans')
    .insert({
      tenant_id: professor.tenantId,
      trainer_id: professor.userId,
      student_id: studentId,
      name: nome?.trim() || modelo.name,
      status: 'draft',
      source_workout_id: sourceWorkoutId,
    })
    .select('id')
    .single();

  if (erroPlan || !plan) {
    return {
      ok: false,
      message: `Não foi possível criar a ficha: ${erroPlan?.message ?? 'erro desconhecido'}`,
    };
  }

  const linhas = itensModelo.map((item, i) => ({
    plan_id: plan.id,
    exercise_id: item.exercise_id,
    weekday: null,
    order_index: item.order_index ?? i,
    sets: item.sets,
    reps: item.reps,
    rest_seconds: item.rest_seconds,
    target_load: item.target_load,
    notes: item.notes,
  }));

  const { error: erroItens } = await supabase.from('workout_plan_items').insert(linhas);

  if (erroItens) {
    await supabase.from('workout_plans').delete().eq('id', plan.id);
    return { ok: false, message: `Não foi possível copiar os exercícios: ${erroItens.message}` };
  }

  revalidatePath('/professor/treinos');

  return { ok: true, message: 'Ficha criada a partir do modelo.', id: plan.id };
}

/**
 * Cria uma FICHA a partir de MÚLTIPLOS modelos, um por divisão (A/B/C/D/E). Para
 * cada modelo recebido (na ordem), copia os itens de `workout_exercises` para
 * `workout_plan_items` carimbando `division = modelo.division` e `weekday = null`.
 * O `order_index` é GLOBAL e CONTÍNUO na ficha inteira (0..N-1), atribuído na
 * ordem das divisões e, dentro de cada divisão, na ordem dos itens do modelo —
 * `division` é apenas um rótulo e `order_index` nunca repete na mesma ficha.
 *
 * `source_workout_id`: igual ao único modelo quando há apenas um; `null` quando
 * há mais de um (ficha multi-origem não tem procedência única). A ficha nasce em
 * `draft`; o aluno só a vê quando liberada (RLS).
 */
export async function criarFichaMultiModelo(
  entrada: CriarFichaMultiModeloInput
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode criar fichas.' };
  }

  const parsed = criarFichaMultiModeloSchema.safeParse(entrada);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  // Lê os itens de cada modelo (RLS garante que são do tenant) e monta as
  // linhas de workout_plan_items já carimbando a divisão, com order_index
  // GLOBAL e contínuo na ordem das divisões (A antes de B antes de C...).
  const linhas: Array<Omit<ReturnType<typeof itemFichaParaLinha>, 'plan_id'>> = [];
  let ordemGlobal = 0;
  for (const modelo of parsed.data.modelos) {
    const { data: itensModelo, error: erroItensModelo } = await supabase
      .from('workout_exercises')
      .select('exercise_id, order_index, sets, reps, rest_seconds, target_load, notes')
      .eq('workout_id', modelo.source_workout_id)
      .order('order_index', { ascending: true });

    if (erroItensModelo) {
      return { ok: false, message: `Não foi possível ler o modelo: ${erroItensModelo.message}` };
    }

    if (!itensModelo || itensModelo.length === 0) {
      return {
        ok: false,
        message: `O modelo da divisão "${modelo.division}" não possui exercícios para copiar.`,
      };
    }

    for (const item of itensModelo) {
      linhas.push({
        exercise_id: item.exercise_id,
        weekday: null,
        division: modelo.division,
        order_index: ordemGlobal,
        sets: item.sets,
        reps: item.reps,
        rest_seconds: item.rest_seconds,
        target_load: item.target_load,
        notes: item.notes,
      });
      ordemGlobal += 1;
    }
  }

  const { data: plan, error: erroPlan } = await supabase
    .from('workout_plans')
    .insert({
      tenant_id: professor.tenantId,
      trainer_id: professor.userId,
      student_id: parsed.data.student_id,
      name: parsed.data.name,
      status: 'draft',
      source_workout_id:
        parsed.data.modelos.length === 1
          ? parsed.data.modelos[0].source_workout_id
          : null,
    })
    .select('id')
    .single();

  if (erroPlan || !plan) {
    return {
      ok: false,
      message: `Não foi possível criar a ficha: ${erroPlan?.message ?? 'erro desconhecido'}`,
    };
  }

  const { error: erroItens } = await supabase
    .from('workout_plan_items')
    .insert(linhas.map((linha) => ({ ...linha, plan_id: plan.id })));

  if (erroItens) {
    await supabase.from('workout_plans').delete().eq('id', plan.id);
    return { ok: false, message: `Não foi possível copiar os exercícios: ${erroItens.message}` };
  }

  revalidatePath('/professor/treinos');

  return { ok: true, message: 'Ficha criada a partir dos modelos.', id: plan.id };
}

// =============================================================================
// Reordenação de itens
// =============================================================================

/**
 * Persiste a nova ordem dos itens de um MODELO (`workout_exercises`).
 * `novaOrdem` é a lista de ids de item na ordem desejada; cada um recebe o
 * `order_index` correspondente ao seu índice. Usado pelos controles acessíveis
 * subir/descer (um reordenamento é só uma troca de posições na lista).
 */
export async function reordenarItensModelo(
  workoutId: string,
  novaOrdem: string[]
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode reordenar.' };
  }

  const supabase = await createClient();

  for (let i = 0; i < novaOrdem.length; i += 1) {
    const { error } = await supabase
      .from('workout_exercises')
      .update({ order_index: i })
      .eq('id', novaOrdem[i])
      .eq('workout_id', workoutId);

    if (error) {
      return { ok: false, message: `Não foi possível reordenar: ${error.message}` };
    }
  }

  revalidatePath(`/professor/modelos-treino/${workoutId}`);

  return { ok: true, message: 'Ordem atualizada.', id: workoutId };
}

/**
 * Persiste a nova ordem dos itens de uma FICHA (`workout_plan_items`).
 * Mesmo contrato de `reordenarItensModelo`, mas para a tabela de ficha.
 */
export async function reordenarItensFicha(
  planId: string,
  novaOrdem: string[]
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode reordenar.' };
  }

  const supabase = await createClient();

  for (let i = 0; i < novaOrdem.length; i += 1) {
    const { error } = await supabase
      .from('workout_plan_items')
      .update({ order_index: i })
      .eq('id', novaOrdem[i])
      .eq('plan_id', planId);

    if (error) {
      return { ok: false, message: `Não foi possível reordenar: ${error.message}` };
    }
  }

  revalidatePath(`/professor/treinos/${planId}`);

  return { ok: true, message: 'Ordem atualizada.', id: planId };
}

// =============================================================================
// Status da ficha (plan_status)
// =============================================================================

/**
 * Altera o `status` de uma ficha respeitando as transições válidas
 * (`schemas/treino.ts`). Quando entra em `released`, carimba `released_at`; ao
 * sair de `released` (ex.: arquivar), mantém o histórico de liberação.
 *
 * A invariante "aluno só vê `released`" é do RLS — aqui apenas controlamos o
 * fluxo de trabalho do professor.
 */
export async function alterarStatusFicha(
  planId: string,
  novoStatus: PlanStatus
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode mudar o status.' };
  }

  const supabase = await createClient();

  const { data: plan, error: erroLeitura } = await supabase
    .from('workout_plans')
    .select('id, status')
    .eq('id', planId)
    .single();

  if (erroLeitura || !plan) {
    return { ok: false, message: 'Ficha não encontrada.' };
  }

  const atual = plan.status as PlanStatus;

  if (atual === novoStatus) {
    return { ok: true, message: 'O status já é esse.', id: planId };
  }

  if (!transicaoPermitida(atual, novoStatus)) {
    return { ok: false, message: 'Transição de status inválida.' };
  }

  const patch: { status: PlanStatus; released_at?: string } = { status: novoStatus };
  if (novoStatus === 'released') {
    patch.released_at = new Date().toISOString();
  }

  const { error } = await supabase.from('workout_plans').update(patch).eq('id', planId);

  if (error) {
    return { ok: false, message: `Não foi possível atualizar o status: ${error.message}` };
  }

  revalidatePath('/professor/treinos');
  revalidatePath(`/professor/treinos/${planId}`);

  return { ok: true, message: 'Status atualizado.', id: planId };
}

// =============================================================================
// Liberação programada da ficha
// =============================================================================

/**
 * Agenda OU libera imediatamente uma ficha (só a partir de `draft`).
 *
 * - `agora`: UPDATE DIRETO `status='released'` + `released_at=now` +
 *   `scheduled_release_at=null`. Atalho DELIBERADO `draft→released` FORA da
 *   máquina de transições — NÃO passa por `alterarStatusFicha`/`transicaoPermitida`
 *   (que recusariam `draft→released`). Ver design §2/§6.1.
 * - `data`: grava `scheduled_release_at = data` mantendo `status='draft'`.
 * - `dias`: grava `scheduled_release_at = now() do servidor + N dias`, `draft`.
 *
 * A RLS (`workout_plans_update`) garante tenant/posse — não filtramos
 * `tenant_id` à mão (padrão do arquivo, `createClient()` com RLS ativo).
 */
export async function programarLiberacao(
  planId: string,
  entrada: AgendamentoInput
): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode programar a liberação.' };
  }

  const parsed = agendamentoSchema.safeParse(entrada);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os campos destacados.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { data: plan, error: erroLeitura } = await supabase
    .from('workout_plans')
    .select('id, status')
    .eq('id', planId)
    .single();

  if (erroLeitura || !plan) {
    return { ok: false, message: 'Ficha não encontrada.' };
  }

  if ((plan.status as PlanStatus) !== 'draft') {
    return {
      ok: false,
      message: 'Só é possível agendar ou liberar uma ficha em rascunho.',
    };
  }

  let patch: {
    status?: PlanStatus;
    released_at?: string;
    scheduled_release_at: string | null;
  };
  let mensagem: string;

  switch (parsed.data.modo) {
    case 'agora': {
      patch = {
        status: 'released',
        released_at: new Date().toISOString(),
        scheduled_release_at: null,
      };
      mensagem = 'Ficha liberada agora.';
      break;
    }
    case 'data': {
      const iso = parsed.data.data.toISOString();
      patch = { status: 'draft', scheduled_release_at: iso };
      mensagem = `Liberação agendada para ${formatarDataBr(iso)}.`;
      break;
    }
    case 'dias': {
      const iso = resolverPrazoParaData(new Date(), parsed.data.dias).toISOString();
      patch = { status: 'draft', scheduled_release_at: iso };
      mensagem = `Liberação agendada para ${formatarDataBr(iso)}.`;
      break;
    }
  }

  const { error } = await supabase.from('workout_plans').update(patch).eq('id', planId);

  if (error) {
    return { ok: false, message: `Não foi possível programar a liberação: ${error.message}` };
  }

  revalidatePath('/professor/treinos');
  revalidatePath(`/professor/treinos/${planId}`);

  return { ok: true, message: mensagem, id: planId };
}

/**
 * Remove o agendamento de liberação: zera `scheduled_release_at` mantendo
 * `status='draft'`. NÃO libera a ficha — apenas a devolve a rascunho sem
 * liberação futura (operação distinta de `programarLiberacao(…,{modo:'agora'})`,
 * que libera). Ver design §6.2.
 */
export async function desmarcarLiberacao(planId: string): Promise<EstadoAcao> {
  const professor = await getSessionUser();
  if (!professor || professor.role !== 'trainer') {
    return { ok: false, message: 'Apenas o professor pode remover o agendamento.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('workout_plans')
    .update({ scheduled_release_at: null })
    .eq('id', planId);

  if (error) {
    return { ok: false, message: `Não foi possível remover o agendamento: ${error.message}` };
  }

  revalidatePath('/professor/treinos');
  revalidatePath(`/professor/treinos/${planId}`);

  return { ok: true, message: 'Agendamento removido.', id: planId };
}
