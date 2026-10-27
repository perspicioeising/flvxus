'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { SerieLog } from '@/lib/treino/progresso';
import type { Database } from '@/types/database.types';
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
 * Helper INTERNO (não exportado como action). Resolve o id da sessão ABERTA
 * (`finished_at is null`) de `(plan_id, student_id, division)`, ou `null` quando
 * não há. Roda sob RLS (`createClient()` já carrega a identidade do chamador),
 * então NÃO refiltramos posse manualmente. `division` usa `.eq` quando informada
 * e `.is(null)` quando ausente (espelha a semântica do balde "divisão única").
 * Ordena `started_at desc` para, por garantia, retornar a mais recente — na
 * prática o índice único parcial (FEAT-001) garante no máximo uma aberta.
 */
async function buscarSessaoAberta(
  supabase: SupabaseClient<Database>,
  args: { planId: string; studentId: string; division?: string }
): Promise<string | null> {
  let query = supabase
    .from('workout_sessions')
    .select('id')
    .eq('plan_id', args.planId)
    .eq('student_id', args.studentId)
    .is('finished_at', null);

  query = args.division !== undefined
    ? query.eq('division', args.division)
    : query.is('division', null);

  const { data } = await query
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

/**
 * Leitura retornada à UI pela `carregarSessaoAberta`: o id da sessão aberta e os
 * logs já persistidos (resolução + logs num ÚNICO round-trip — a UI nunca
 * precisa de duas chamadas).
 */
export interface SessaoAbertaCarregada {
  sessionId: string;
  logs: SerieLog[];
}

/**
 * Inicia uma sessão de treino a partir de uma ficha liberada. Confirma por
 * query que o plano é do aluno (RLS) e está `released` — senão recusa, para não
 * abrir sessão de rascunho. Carimba `tenant_id`/`student_id` do aluno logado e
 * `started_at` (default do banco cobre, mas deixamos explícito). Quando a ficha
 * é por divisão, carimba também `division` (A/B/C/…); fichas legadas por
 * weekday não passam `division` e gravam `null`. Retorna o id da sessão criada.
 */
export async function iniciarSessao(
  planId: string,
  division?: string,
  targetStudentId?: string
): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }

  const parsed = iniciarSessaoSchema.safeParse({
    plan_id: planId,
    division,
    target_student_id: targetStudentId,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Ficha inválida.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  // Resolve o aluno-alvo e autoriza o fluxo. Sem `target_student_id` = fluxo do
  // próprio aluno (exige role 'student', grava para si). Com `target_student_id`
  // = fluxo do professor (exige role 'trainer'; grava em nome do aluno). A posse
  // real é garantida pela RLS (trainer do tenant OU aluno dono).
  let studentIdAlvo: string;
  if (parsed.data.target_student_id === undefined) {
    if (usuario.role !== 'student') {
      return { ok: false, message: 'Apenas o aluno pode iniciar um treino.' };
    }
    studentIdAlvo = usuario.userId;
  } else {
    if (usuario.role !== 'trainer') {
      return {
        ok: false,
        message: 'Apenas o professor pode registrar treino em nome do aluno.',
      };
    }
    studentIdAlvo = parsed.data.target_student_id;
  }

  const supabase = await createClient();

  // RLS já limita a fichas que o chamador pode ver; aqui garantimos que está
  // liberada. No fluxo do professor, reconfirmamos que a ficha é DAQUELE aluno.
  let fichaQuery = supabase
    .from('workout_plans')
    .select('id, status')
    .eq('id', parsed.data.plan_id);

  if (parsed.data.target_student_id !== undefined) {
    fichaQuery = fichaQuery.eq('student_id', studentIdAlvo);
  }

  const { data: plano, error: erroPlano } = await fichaQuery.maybeSingle();

  if (erroPlano) {
    return { ok: false, message: `Não foi possível abrir a ficha: ${erroPlano.message}` };
  }

  if (!plano || plano.status !== 'released') {
    return { ok: false, message: 'Esta ficha não está disponível para treino.' };
  }

  // RESOLVER-ANTES-DE-INSERIR: se já existe uma sessão ABERTA desta
  // `(plan, division, student)`, retoma-a em vez de criar outra. Isso elimina a
  // duplicação de sessão mesmo quando a UI chama `iniciarSessao` direto; o
  // índice único parcial (FEAT-001) é a última linha de defesa contra corrida.
  const abertaExistente = await buscarSessaoAberta(supabase, {
    planId: plano.id,
    studentId: studentIdAlvo,
    division: parsed.data.division,
  });
  if (abertaExistente) {
    return { ok: true, message: 'Treino em andamento retomado.', id: abertaExistente };
  }

  const { data: sessao, error: erroSessao } = await supabase
    .from('workout_sessions')
    .insert({
      tenant_id: usuario.tenantId,
      student_id: studentIdAlvo,
      plan_id: plano.id,
      division: parsed.data.division ?? null,
      started_at: new Date().toISOString(),
      // SEMPRE quem está logado (aluno no fluxo normal; professor no presencial).
      recorded_by: usuario.userId,
    })
    .select('id')
    .single();

  if (erroSessao || !sessao) {
    // Corrida: duas requisições passaram pela checagem acima e o índice único
    // parcial recusou o INSERT perdedor (23505). Traduz a mensagem e re-resolve
    // a sessão aberta para devolver o id da vencedora, sem erro ao usuário.
    if (erroSessao?.code === '23505') {
      console.warn(
        'iniciarSessao: colisão de sessão aberta (23505), re-resolvendo a existente.'
      );
      const reaberta = await buscarSessaoAberta(supabase, {
        planId: plano.id,
        studentId: studentIdAlvo,
        division: parsed.data.division,
      });
      if (reaberta) {
        return { ok: true, message: 'Treino em andamento retomado.', id: reaberta };
      }
      return { ok: false, message: 'Já existe um treino em andamento desta divisão.' };
    }
    return {
      ok: false,
      message: `Não foi possível iniciar o treino: ${erroSessao?.message ?? 'erro desconhecido'}`,
    };
  }

  revalidatePath('/aluno/execucao');

  return { ok: true, message: 'Treino iniciado.', id: sessao.id };
}

/**
 * Resolve a sessão ABERTA de `(plan, division[, aluno-alvo])` e, havendo,
 * retorna seu id + os logs persistidos num ÚNICO round-trip (para a UI de
 * execução hidratar o estado a partir do banco). `data: null` = não há sessão
 * aberta (a UI inicia uma nova no primeiro toque).
 *
 * A autorização de papel é IDÊNTICA a `iniciarSessao`: sem `targetStudentId`
 * exige `role==='student'` (alvo = usuário logado); com, exige `role==='trainer'`
 * (alvo = `targetStudentId`). A posse real é da RLS — um aluno tentando resolver
 * a sessão de outro recebe vazio sob RLS (sem 500), e a UI inicia a própria.
 */
export async function carregarSessaoAberta(
  planId: string,
  division?: string,
  targetStudentId?: string
): Promise<EstadoAcao & { data?: SessaoAbertaCarregada | null }> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }

  const parsed = iniciarSessaoSchema.safeParse({
    plan_id: planId,
    division,
    target_student_id: targetStudentId,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Ficha inválida.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  // Mesma resolução/autorização de papel de `iniciarSessao`.
  let studentIdAlvo: string;
  if (parsed.data.target_student_id === undefined) {
    if (usuario.role !== 'student') {
      return { ok: false, message: 'Apenas o aluno pode iniciar um treino.' };
    }
    studentIdAlvo = usuario.userId;
  } else {
    if (usuario.role !== 'trainer') {
      return {
        ok: false,
        message: 'Apenas o professor pode registrar treino em nome do aluno.',
      };
    }
    studentIdAlvo = parsed.data.target_student_id;
  }

  const supabase = await createClient();

  const sessionId = await buscarSessaoAberta(supabase, {
    planId: parsed.data.plan_id,
    studentId: studentIdAlvo,
    division: parsed.data.division,
  });

  if (!sessionId) {
    return { ok: true, data: null };
  }

  const { data: logs, error: erroLogs } = await supabase
    .from('workout_set_logs')
    .select('set_number, reps_done, load_done, completed, plan_item_id')
    .eq('session_id', sessionId);

  if (erroLogs) {
    console.error('carregarSessaoAberta: erro ao buscar logs', erroLogs);
    return { ok: false, message: `Não foi possível retomar o treino: ${erroLogs.message}` };
  }

  return {
    ok: true,
    data: {
      sessionId,
      logs: (logs ?? []) as SerieLog[],
    },
  };
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
  // Qualquer usuário logado pode chamar; a posse (aluno dono OU trainer do
  // tenant) é imposta pela RLS de workout_set_logs/workout_sessions via
  // session_id. Isso habilita o professor a registrar em nome do aluno sem
  // afrouxar a segurança.
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
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
  // Qualquer usuário logado pode chamar; a RLS garante que só finaliza a sessão
  // cujo dono é (aluno dono OU trainer do tenant). Habilita o fluxo presencial.
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
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
