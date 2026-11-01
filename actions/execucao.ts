'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { SerieLog } from '@/lib/treino/progresso';
import {
  proximoTreinoDaFicha,
  type FichaInicio,
  type PassoRotacao,
} from '@/lib/treino/inicio';
import type { Database } from '@/types/database.types';
import {
  cancelarSessaoSchema,
  finalizarSessaoSchema,
  iniciarSessaoSchema,
  registrarSerieSchema,
  type CancelarSessaoInput,
  type FinalizarSessaoInput,
  type RegistrarSerieEntrada,
} from '@/schemas/execucao';
import { rotationStepsSchema } from '@/schemas/treino';

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
 * Mapa `planItemId -> {reps, load}` do ÚLTIMO realizado casado por exercício,
 * devolvido pela `carregarUltimosRegistros` para o pré-preenchimento (FEAT-001).
 */
export type UltimosRegistros = Record<
  string,
  { reps: number | null; load: number | null }
>;

/**
 * Linha achatada do `select` aninhado de `workout_set_logs`: além das colunas de
 * reps/carga, traz o `exercise_id` do item (via join) e o `finished_at` da
 * sessão (via join), para resolver o mais recente por exercício no servidor.
 */
interface RegistroComExercicio {
  reps_done: number | null;
  load_done: number | null;
  plan_item: { exercise_id: string } | null;
  workout_sessions: { finished_at: string | null } | null;
}

/**
 * Carrega o ÚLTIMO realizado (reps/carga) de cada exercício para PRÉ-PREENCHER a
 * execução, casando por `exercise_id` (o histórico é herdado ENTRE fichas, não
 * só por `plan_item_id`). Recebe os itens visíveis `{planItemId, exerciseId}` e
 * devolve `Record<planItemId, {reps, load}>` — mapeado de volta por item de
 * ENTRADA para que a UI semeie cada série sem reconstruir o casamento.
 *
 * Apenas LEITURA: não cria schema nem muta estado. Só olha séries
 * `completed = true` de sessões FINALIZADAS (`finished_at is not null`) do
 * aluno-alvo, reduzindo no servidor ao registro mais recente por exercício
 * (ordenado por `finished_at desc`).
 *
 * Autorização de papel IDÊNTICA a `carregarSessaoAberta`/`iniciarSessao`: sem
 * `targetStudentId` = fluxo do próprio aluno (`role==='student'`, alvo =
 * `auth.uid()`); com = fluxo do professor (`role==='trainer'`, alvo =
 * `targetStudentId`). Roda sob `createClient()` (RLS ativo) — um aluno nunca
 * enxerga o histórico de outro. Sem dados → `{ok:true, data:{}}`.
 */
export async function carregarUltimosRegistros(
  itens: { planItemId: string; exerciseId: string }[],
  targetStudentId?: string
): Promise<EstadoAcao & { data?: UltimosRegistros }> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }

  // Mesma resolução/autorização de papel de `carregarSessaoAberta`.
  let studentIdAlvo: string;
  if (targetStudentId === undefined) {
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
    studentIdAlvo = targetStudentId;
  }

  // `exercise_id` distintos dos itens de entrada. Sem itens (ou todos sem
  // exercício) não há o que buscar: devolve mapa vazio.
  const exerciseIds = Array.from(
    new Set(itens.map((i) => i.exerciseId).filter(Boolean))
  );
  if (exerciseIds.length === 0) {
    return { ok: true, data: {} };
  }

  const supabase = await createClient();

  // Uma query: séries concluídas de sessões FINALIZADAS do aluno-alvo cujo item
  // é de um dos exercícios pedidos. Os `!inner` filtram pelas colunas da sessão
  // (finished_at/student_id) e do item (exercise_id). Ordena por sessão
  // finalizada desc para que o PRIMEIRO registro visto de cada exercício seja o
  // mais recente (reduzimos no servidor abaixo). A posse real (aluno dono OU
  // trainer do tenant) é imposta pela RLS; `student_id` no join é defesa extra.
  const { data, error } = await supabase
    .from('workout_set_logs')
    .select(
      'reps_done, load_done, plan_item:workout_plan_items!inner(exercise_id), workout_sessions!inner(finished_at, student_id)'
    )
    .eq('completed', true)
    .not('workout_sessions.finished_at', 'is', null)
    .eq('workout_sessions.student_id', studentIdAlvo)
    .in('plan_item.exercise_id', exerciseIds)
    .order('finished_at', {
      referencedTable: 'workout_sessions',
      ascending: false,
    });

  if (error) {
    console.error('carregarUltimosRegistros: erro ao buscar histórico', error);
    return {
      ok: false,
      message: `Não foi possível carregar o histórico: ${error.message}`,
    };
  }

  // Reduz ao MAIS RECENTE por exercício: como os registros já vêm ordenados por
  // `finished_at desc`, o primeiro visto de cada `exercise_id` é o vencedor.
  const porExercicio = new Map<string, { reps: number | null; load: number | null }>();
  for (const linha of (data ?? []) as unknown as RegistroComExercicio[]) {
    const exerciseId = linha.plan_item?.exercise_id;
    if (!exerciseId || porExercicio.has(exerciseId)) continue;
    porExercicio.set(exerciseId, {
      reps: linha.reps_done,
      load: linha.load_done,
    });
  }

  // Mapeia de volta cada planItemId de ENTRADA para o realizado do seu
  // exercício. Itens sem histórico simplesmente não entram no mapa.
  const resultado: UltimosRegistros = {};
  for (const item of itens) {
    const realizado = porExercicio.get(item.exerciseId);
    if (realizado) {
      resultado[item.planItemId] = realizado;
    }
  }

  return { ok: true, data: resultado };
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
        // `plan_item_id` continua apontando ao item PRESCRITO (retomada,
        // pré-preenchimento e progresso seguem por ele). A troca ad-hoc de
        // exercício (FEAT-002) vive em `substitute_exercise_id`: null = executou
        // o prescrito; preenchida = executou o alternativo escolhido na sessão.
        plan_item_id: dados.plan_item_id,
        set_number: dados.set_number,
        reps_done: dados.reps_done ?? null,
        load_done: dados.load_done ?? null,
        completed: dados.completed,
        substitute_exercise_id: dados.substitute_exercise_id ?? null,
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

/**
 * CANCELA (abandona) uma sessão ABERTA, voltando ao estado "não iniciado": o
 * aluno (ou o professor presencial que a abriu) desistiu do treino e o progresso
 * desta sessão é descartado — ela NÃO deve aparecer no histórico como treino
 * incompleto.
 *
 * Apaga os `workout_set_logs` da sessão e, em seguida, a própria
 * `workout_sessions`. Dois guards garantem que apenas sessões descartáveis sejam
 * tocadas:
 * - Só deleta quando `finished_at is null` (nunca mexe numa sessão já
 *   finalizada — o filtro no delete da sessão protege contra corrida).
 * - A posse (aluno dono OU trainer do tenant) é imposta pela RLS: um usuário que
 *   não pode ver/escrever a sessão simplesmente não afeta nenhuma linha.
 *
 * Idempotente: cancelar uma sessão já inexistente/finalizada retorna `ok:true`
 * sem efeito (o delete casa zero linhas). Isso cobre o double-click no "Abandonar
 * treino" e a UI que chama cancelar sem ter criado sessão.
 *
 * Detecção de descarte efetivo: o delete da sessão usa `.select('id')` e, se
 * RETORNOU linha (havia sessão aberta e ela foi removida), confirmamos o
 * sucesso. Se casou zero linhas tratamos como idempotente (nada a descartar).
 * Esse check protege contra o "sucesso silencioso": se a RLS recusasse o DELETE
 * (sem erro, zero linhas) com uma sessão ainda existente, não mascaramos como
 * ok — mas, como a RLS do aluno dono/trainer permite o DELETE (migration
 * 20261023090100), o caminho feliz remove a linha.
 */
export async function cancelarSessao(
  input: CancelarSessaoInput
): Promise<EstadoAcao> {
  // Qualquer usuário logado pode chamar; a RLS garante que só cancela a sessão
  // cujo dono é (aluno dono OU trainer do tenant). Habilita o fluxo presencial.
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }

  const parsed = cancelarSessaoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Não foi possível abandonar o treino.',
      fieldErrors: erroDeCampo(parsed.error.flatten()),
    };
  }

  const supabase = await createClient();

  // Apaga PRIMEIRO os logs de série (dependentes da sessão). A RLS limita ao
  // que o chamador pode escrever; se não houver logs, casa zero linhas (ok).
  const { error: erroLogs } = await supabase
    .from('workout_set_logs')
    .delete()
    .eq('session_id', parsed.data.session_id);

  if (erroLogs) {
    return {
      ok: false,
      message: `Não foi possível abandonar o treino: ${erroLogs.message}`,
    };
  }

  // Apaga a sessão SOMENTE se ainda está ABERTA (`finished_at is null`): nunca
  // remove uma sessão já finalizada (histórico), mesmo em corrida. O `.select`
  // devolve as linhas removidas, permitindo detectar o descarte efetivo.
  const { data: removidas, error: erroSessao } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', parsed.data.session_id)
    .is('finished_at', null)
    .select('id');

  if (erroSessao) {
    return {
      ok: false,
      message: `Não foi possível abandonar o treino: ${erroSessao.message}`,
    };
  }

  // Casar ZERO linhas é esperado e idempotente (sessão já inexistente/finalizada
  // ou double-click). Apenas registramos para observabilidade — não é erro.
  if (!removidas || removidas.length === 0) {
    console.info(
      'cancelarSessao: nenhuma sessão aberta descartada (já inexistente/finalizada).'
    );
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/execucao');

  return { ok: true, message: 'Treino abandonado.', id: parsed.data.session_id };
}

/**
 * Converte o jsonb `rotation_steps` lido do banco numa lista tipada de passos,
 * validando a forma com `rotationStepsSchema`. Retorna `null` quando ausente/
 * nulo/inválido (ficha legada: a rotação de descanso NÃO se aplica).
 */
function parseRotationSteps(valor: unknown): PassoRotacao[] | null {
  if (valor === null || valor === undefined) return null;
  const parsed = rotationStepsSchema.safeParse(valor);
  return parsed.success ? (parsed.data as PassoRotacao[]) : null;
}

/**
 * Confirma que o aluno (ou o professor, no treino presencial) CUMPRIU um dia de
 * descanso da rotação explícita da ficha. Grava um marcador leve em
 * `workout_plan_rest_completions` (tabela própria: NÃO toca o histórico de
 * sessões). Padrão `EstadoAcao`.
 *
 * Autorização de papel idêntica a `iniciarSessao`: sem `targetStudentId` =
 * fluxo do próprio aluno (`role==='student'`, grava `student_id = auth.uid()`);
 * com = fluxo do professor (`role==='trainer'`, grava o aluno-alvo). A posse
 * real é da RLS da tabela.
 *
 * IDEMPOTÊNCIA na ação: só INSERE se `restStepIndex` for de fato o PRÓXIMO passo
 * resolvido pela rotação neste momento (cruzando a última divisão concluída e o
 * último descanso cumprido). Caso contrário retorna `{ok:true}` SEM inserir
 * (toque repetido/estado já avançado não duplica). `restStepIndex` fora da faixa
 * de `rotation_steps` → `{ok:false}`.
 */
export async function confirmarDescanso(
  planId: string,
  restStepIndex: number,
  targetStudentId?: string
): Promise<EstadoAcao> {
  const usuario = await getSessionUser();
  if (!usuario) {
    return { ok: false, message: 'Sessão expirada.' };
  }

  // Mesma resolução/autorização de papel de `iniciarSessao`.
  let studentIdAlvo: string;
  if (targetStudentId === undefined) {
    if (usuario.role !== 'student') {
      return { ok: false, message: 'Apenas o aluno pode confirmar o descanso.' };
    }
    studentIdAlvo = usuario.userId;
  } else {
    if (usuario.role !== 'trainer') {
      return {
        ok: false,
        message: 'Apenas o professor pode registrar o descanso em nome do aluno.',
      };
    }
    studentIdAlvo = targetStudentId;
  }

  const supabase = await createClient();

  // Ficha (RLS limita ao que o chamador vê). No fluxo do professor, reconfirma
  // que é a ficha DAQUELE aluno. Precisa estar liberada e ter rotação explícita.
  let fichaQuery = supabase
    .from('workout_plans')
    .select(
      'id, status, rotation_steps, workout_plan_items(id, weekday, division, order_index, sets, reps, exercises(name, muscle_groups))'
    )
    .eq('id', planId);

  if (targetStudentId !== undefined) {
    fichaQuery = fichaQuery.eq('student_id', studentIdAlvo);
  }

  const { data: plano, error: erroPlano } = await fichaQuery.maybeSingle();

  if (erroPlano) {
    return { ok: false, message: `Não foi possível abrir a ficha: ${erroPlano.message}` };
  }

  if (!plano || plano.status !== 'released') {
    return { ok: false, message: 'Esta ficha não está disponível.' };
  }

  const steps = parseRotationSteps(plano.rotation_steps);
  if (steps === null || steps.length === 0) {
    return { ok: false, message: 'Esta ficha não tem dias de descanso configurados.' };
  }

  // `restStepIndex` precisa estar na faixa E apontar para um passo de descanso.
  if (
    !Number.isInteger(restStepIndex) ||
    restStepIndex < 0 ||
    restStepIndex >= steps.length ||
    steps[restStepIndex].type !== 'rest'
  ) {
    return { ok: false, message: 'Passo de descanso inválido.' };
  }

  // Resolve o PRÓXIMO passo da rotação agora (última divisão concluída + último
  // descanso cumprido, desempatando por timestamp) usando a MESMA lógica pura
  // da UI, para a ação ser idempotente e consistente.
  const [ultimaSessaoRes, ultimoDescansoRes] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('division, finished_at')
      .eq('plan_id', planId)
      .eq('student_id', studentIdAlvo)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('workout_plan_rest_completions')
      .select('rest_step_index, completed_at')
      .eq('plan_id', planId)
      .eq('student_id', studentIdAlvo)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const ficha: FichaInicio = {
    id: plano.id,
    name: '',
    workout_plan_items:
      (plano.workout_plan_items as FichaInicio['workout_plan_items']) ?? [],
    rotation_steps: steps,
  };

  const proximo = proximoTreinoDaFicha(ficha, undefined, undefined, {
    ultimaDivisao:
      ultimaSessaoRes.data && ultimaSessaoRes.data.finished_at
        ? {
            label: ultimaSessaoRes.data.division ?? null,
            finishedAt: ultimaSessaoRes.data.finished_at,
          }
        : null,
    ultimoDescanso: ultimoDescansoRes.data
      ? {
          restStepIndex: ultimoDescansoRes.data.rest_step_index,
          completedAt: ultimoDescansoRes.data.completed_at,
        }
      : null,
  });

  // Idempotência: só grava se o passo pedido é mesmo o próximo descanso agora.
  if (!proximo || !proximo.descanso || proximo.restStepIndex !== restStepIndex) {
    return { ok: true, message: 'Descanso já registrado.' };
  }

  const { error: erroInsert } = await supabase
    .from('workout_plan_rest_completions')
    .insert({
      plan_id: planId,
      student_id: studentIdAlvo,
      rest_step_index: restStepIndex,
    });

  if (erroInsert) {
    return {
      ok: false,
      message: `Não foi possível registrar o descanso: ${erroInsert.message}`,
    };
  }

  revalidatePath('/aluno');
  revalidatePath('/aluno/treinos');

  return { ok: true, message: 'Descanso registrado.' };
}
