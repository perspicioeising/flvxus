'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  finalizarSessaoSchema,
  iniciarSessaoSchema,
  registrarSerieSchema,
  type FinalizarSessaoInput,
  type RegistrarSerieEntrada,
} from '@/schemas/execucao';

/**
 * Server Actions da EXECUÇÃO DE TREINO do aluno (architecture.md §6.4).
 *
 * Mesmo molde de `actions/treinos.ts`: toda leitura/mutação usa `createClient()`
 * (RLS ativo). Não refiltramos posse manualmente — as policies garantem que o
 * aluno só enxerga/gravará o que é seu. Carimbamos `tenant_id`/`student_id` no
 * insert da sessão porque o `with check` das policies exige essas colunas.
 *
 * A invariante "aluno só treina ficha liberada" é checada aqui (plano precisa
 * estar `released`) E reforçada por RLS.
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

/**
 * Inicia uma sessão de treino a partir de uma ficha liberada. Confirma por
 * query que o plano é do aluno (RLS) e está `released` — senão recusa, para não
 * abrir sessão de rascunho. Carimba `tenant_id`/`student_id` do aluno logado e
 * `started_at` (default do banco cobre, mas deixamos explícito). Retorna o id
 * da sessão criada.
 */
export async function iniciarSessao(planId: string): Promise<EstadoAcao> {
  const aluno = await getSessionUser();
  if (!aluno || aluno.role !== 'student') {
    return { ok: false, message: 'Apenas o aluno pode iniciar um treino.' };
  }

  const parsed = iniciarSessaoSchema.safeParse({ plan_id: planId });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Ficha inválida.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  // RLS já limita a fichas do próprio aluno; aqui garantimos que está liberada.
  const { data: plano, error: erroPlano } = await supabase
    .from('workout_plans')
    .select('id, status')
    .eq('id', parsed.data.plan_id)
    .maybeSingle();

  if (erroPlano) {
    return { ok: false, message: `Não foi possível abrir a ficha: ${erroPlano.message}` };
  }

  if (!plano || plano.status !== 'released') {
    return { ok: false, message: 'Esta ficha não está disponível para treino.' };
  }

  const { data: sessao, error: erroSessao } = await supabase
    .from('workout_sessions')
    .insert({
      tenant_id: aluno.tenantId,
      student_id: aluno.userId,
      plan_id: plano.id,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (erroSessao || !sessao) {
    return {
      ok: false,
      message: `Não foi possível iniciar o treino: ${erroSessao?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/aluno/execucao');

  return { ok: true, message: 'Treino iniciado.', id: sessao.id };
}

/**
 * Registra (ou atualiza) uma série executada em `workout_set_logs`. Faz um
 * ÚNICO UPSERT por `(session_id, plan_item_id, set_number)` com
 * `onConflict` nessas colunas: se a série já existe, atualiza
 * `reps_done`/`load_done`/`completed`; caso contrário, insere. O índice único
 * `workout_set_logs_sessao_item_set_uidx` (migration 20261021090000) resolve o
 * conflito no banco, fechando a corrida que o antigo read-then-write deixava
 * aberta e tornando o toque idempotente (marcar/desmarcar não duplica linhas).
 */
export async function registrarSerie(input: RegistrarSerieEntrada): Promise<EstadoAcao> {
  const aluno = await getSessionUser();
  if (!aluno || aluno.role !== 'student') {
    return { ok: false, message: 'Apenas o aluno pode registrar séries.' };
  }

  const parsed = registrarSerieSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Verifique os dados da série.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const dados = parsed.data;
  const supabase = await createClient();

  const { data: registrada, error: erroUpsert } = await supabase
    .from('workout_set_logs')
    .upsert(
      {
        session_id: dados.session_id,
        plan_item_id: dados.plan_item_id,
        set_number: dados.set_number,
        reps_done: dados.reps_done ?? null,
        load_done: dados.load_done ?? null,
        completed: dados.completed,
      },
      { onConflict: 'session_id,plan_item_id,set_number' }
    )
    .select('id')
    .single();

  if (erroUpsert || !registrada) {
    return {
      ok: false,
      message: `Não foi possível registrar a série: ${erroUpsert?.message ?? 'erro desconhecido'}`,
    };
  }

  return { ok: true, message: 'Série registrada.', id: registrada.id };
}

/**
 * Finaliza uma sessão: carimba `finished_at = now()` e grava a nota e a
 * intensidade percebida (RPE 1..10) opcionais. RLS garante que o aluno só
 * finaliza a própria sessão.
 */
export async function finalizarSessao(input: FinalizarSessaoInput): Promise<EstadoAcao> {
  const aluno = await getSessionUser();
  if (!aluno || aluno.role !== 'student') {
    return { ok: false, message: 'Apenas o aluno pode finalizar o treino.' };
  }

  const parsed = finalizarSessaoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Não foi possível finalizar o treino.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('workout_sessions')
    .update({
      finished_at: new Date().toISOString(),
      notes: parsed.data.notes ?? null,
      perceived_intensity: parsed.data.perceived_intensity ?? null,
    })
    .eq('id', parsed.data.session_id);

  if (error) {
    return { ok: false, message: `Não foi possível finalizar o treino: ${error.message}` };
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/execucao');

  return { ok: true, message: 'Treino finalizado.', id: parsed.data.session_id };
}
