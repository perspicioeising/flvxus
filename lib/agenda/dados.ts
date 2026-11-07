/**
 * Carga SERVER da Agenda (RLS ativo, `createClient` do usuário; nunca
 * `service_role`). Quatro leitores independentes em `Promise.all`:
 * compromissos gravados, treinos, refeições e água. Os derivados (treino,
 * refeição, água) existem só para o PRÓPRIO espectador que tem ficha/dieta/
 * hábitos: aluno vinculado e autônomo — professor profissional não tem.
 * Design: §8 e §17 (M3, N5).
 */
import type { SessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { diaLocal, janelaDaVisao, somarDias, validarTz, type JanelaVisao, type VisaoAgenda } from '@/lib/agenda/fuso';
import { expandir, ocorrenciaAvulsa, type OcorrenciaExpandida } from '@/lib/agenda/recorrencia';
import { perfilAgenda, podeAgenda, ehAtendimento, type PerfilAgenda } from '@/lib/agenda/permissoes';
import { projetarTreinos } from '@/lib/agenda/treino';
import { projetarRefeicoes, type DietaVigenteAgenda } from '@/lib/agenda/refeicoes';
import { CONFIG_AGUA_PADRAO, projetarAgua, type ConfigAgua } from '@/lib/agenda/agua';
import type { AppointmentKind, CompromissoRow, EventoAgenda, MetaCompromisso } from '@/lib/agenda/tipos';
import type { FichaInicio, UltimoEventoRotacao } from '@/lib/treino/inicio';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const FUSO_PADRAO_AGENDA = 'America/Sao_Paulo';

/** Rótulo fixo do professor para o aluno (a RLS não deixa o aluno ler o perfil do professor — N5). */
export const ROTULO_PROFESSOR = 'Seu professor';
/** Rótulo do aluno quando o embed de nome vier nulo (filiado sem acesso a `students` — M3). */
export const ROTULO_ALUNO = 'Aluno';

export interface ContextoAgenda {
  supabase: Supabase;
  usuario: SessionUser;
  perfil: PerfilAgenda;
  /** Fuso do espectador (`profiles.timezone`). */
  tz: string;
  janela: JanelaVisao;
  /** Hoje (`YYYY-MM-DD`) no fuso do espectador. */
  hoje: string;
  agora: Date;
}

export interface ResultadoAgenda {
  eventos: EventoAgenda[];
  fichasSemDia: { id: string; name: string }[];
  tz: string;
  hoje: string;
  janela: JanelaVisao;
  perfil: PerfilAgenda;
}

function falha(origem: string, erro: { code?: string | null } | null): never {
  // Sem dados pessoais no log; a página mostra o ErrorState com retry.
  console.error('[agenda]', origem, erro?.code ?? 'desconhecido');
  throw new Error(`agenda_carga_${origem}`);
}

const ROTULO_TIPO: Record<AppointmentKind, string> = {
  in_person: 'Atendimento presencial',
  online: 'Atendimento online',
  assessment: 'Avaliação física',
  personal: 'Compromisso pessoal',
  block: 'Bloqueio',
};

const COLUNAS_COMPROMISSO =
  'id, owner_id, kind, trainer_id, student_id, title, location, notes, starts_at, ends_at, status, tz, recur_freq, recur_weekdays, recur_until, series_id, original_date';

/** Compromissos gravados na janela (avulsos, mestres recorrentes expandidos e overrides). */
export async function carregarCompromissos(ctx: ContextoAgenda): Promise<EventoAgenda[]> {
  const { supabase, usuario, perfil, tz, janela, agora } = ctx;
  const iniISO = janela.inicio.toISOString();
  const fimISO = janela.fim.toISOString();
  const de = somarDias(janela.diaInicio, -1);
  const ate = somarDias(janela.diaFim, 1);

  const [avulsosRes, mestresRes, overridesRes] = await Promise.all([
    // (1) Avulsos e overrides com início na janela.
    supabase
      .from('appointments')
      .select(COLUNAS_COMPROMISSO)
      .is('recur_freq', null)
      .gte('starts_at', iniISO)
      .lt('starts_at', fimISO),
    // (2) Mestres que podem ter ocorrências na janela.
    supabase
      .from('appointments')
      .select(COLUNAS_COMPROMISSO)
      .not('recur_freq', 'is', null)
      .is('series_id', null)
      .lt('starts_at', fimISO)
      .or(`recur_until.is.null,recur_until.gte.${janela.diaInicio}`),
    // (3) Overrides com `original_date` na janela ±1 dia (cobre mover para dentro/fora).
    supabase
      .from('appointments')
      .select(COLUNAS_COMPROMISSO)
      .not('series_id', 'is', null)
      .gte('original_date', de)
      .lte('original_date', ate),
  ]);
  if (avulsosRes.error) falha('avulsos', avulsosRes.error);
  if (mestresRes.error) falha('mestres', mestresRes.error);
  if (overridesRes.error) falha('overrides', overridesRes.error);

  const avulsosEOverrides = (avulsosRes.data ?? []) as CompromissoRow[];
  const mestres = new Map<string, CompromissoRow>();
  for (const m of (mestresRes.data ?? []) as CompromissoRow[]) mestres.set(m.id, m);
  const overrides = new Map<string, CompromissoRow>();
  for (const o of (overridesRes.data ?? []) as CompromissoRow[]) overrides.set(o.id, o);
  const avulsos: CompromissoRow[] = [];
  for (const l of avulsosEOverrides) {
    if (l.series_id !== null) overrides.set(l.id, l);
    else avulsos.push(l);
  }

  // Mestres de overrides que entraram na janela mas cujo mestre não veio em (2).
  const faltantes = [
    ...new Set([...overrides.values()].map((o) => o.series_id).filter((id): id is string => !!id && !mestres.has(id))),
  ];
  if (faltantes.length > 0) {
    const { data, error } = await supabase.from('appointments').select(COLUNAS_COMPROMISSO).in('id', faltantes);
    if (error) falha('mestres_override', error);
    for (const m of (data ?? []) as CompromissoRow[]) mestres.set(m.id, m);
  }

  const ocorrencias: OcorrenciaExpandida[] = [
    ...avulsos.map((l) => ocorrenciaAvulsa(l, tz)),
    ...expandir({ inicio: janela.inicio, fim: janela.fim }, [...mestres.values()], [...overrides.values()], tz),
  ];

  // Nomes dos alunos (só o professor; para o aluno o rótulo é fixo, sem join — N5).
  const nomes = new Map<string, string>();
  if (perfil === 'professor') {
    const ids = [...new Set(ocorrencias.map((o) => o.linha.student_id).filter((id): id is string => !!id))];
    if (ids.length > 0) {
      const { data, error } = await supabase.from('profiles').select('user_id, full_name').in('user_id', ids);
      if (error) falha('nomes', error);
      for (const p of data ?? []) if (p.full_name) nomes.set(p.user_id, p.full_name);
    }
  }
  // Responsável desativado (só o master vê atendimentos de outros personais).
  const desativados = new Set<string>();
  if (perfil === 'professor' && usuario.isMaster) {
    const ids = [
      ...new Set(
        ocorrencias.map((o) => o.linha.trainer_id).filter((id): id is string => !!id && id !== usuario.userId)
      ),
    ];
    if (ids.length > 0) {
      const { data } = await supabase.from('profiles').select('user_id, deactivated_at').in('user_id', ids);
      for (const p of data ?? []) if (p.deactivated_at) desativados.add(p.user_id);
    }
  }

  return ocorrencias.map((o) => {
    const l = o.linha;
    const atendimento = ehAtendimento(l.kind);
    const ehDono = l.owner_id === usuario.userId;
    let alunoRotulo: string | null = null;
    if (atendimento) {
      if (perfil === 'professor') alunoRotulo = (l.student_id && nomes.get(l.student_id)) || ROTULO_ALUNO;
      else alunoRotulo = ROTULO_PROFESSOR;
    }
    const base = l.title?.trim() || ROTULO_TIPO[l.kind];
    const titulo = atendimento && l.title === null && alunoRotulo ? `${base} · ${alunoRotulo}` : base;
    const compromissoId = o.serieId ?? l.id;
    const meta: MetaCompromisso & Record<string, unknown> = {
      compromissoId,
      serieId: o.serieId,
      dataOriginal: o.dataOriginal,
      tzSerie: o.tzSerie,
      kind: l.kind,
      tituloGravado: l.title,
      local: l.location,
      notas: l.notes,
      alunoRotulo,
      alunoId: perfil === 'professor' ? l.student_id : null,
      ehDono,
      responsavelDesativado: !!l.trainer_id && desativados.has(l.trainer_id),
      recorrente: o.serieId !== null,
      podeEditar: podeAgenda(perfil, l.kind, 'editar', {
        ehDono,
        ehMaster: usuario.isMaster,
        ehTrainerDoAtendimento: l.trainer_id === usuario.userId,
      }),
    };
    const status: EventoAgenda['status'] =
      l.status === 'canceled' || l.status === 'no_show'
        ? 'cancelado'
        : l.status === 'done'
          ? 'concluido'
          : o.inicio.getTime() > agora.getTime()
            ? 'previsto'
            : 'pendente';
    return {
      chave: `compromisso:${compromissoId}:${o.dataOriginal}${o.ehOverride ? ':o' : ''}`,
      origem: 'compromisso' as const,
      titulo,
      dia: o.dia,
      inicio: o.inicio.toISOString(),
      fim: o.fim.toISOString(),
      status,
      acao: null,
      meta,
    };
  });
}

/** Treinos projetados das fichas liberadas DO espectador (`.eq('student_id', userId)` explícito). */
export async function carregarTreinos(
  ctx: ContextoAgenda
): Promise<{ eventos: EventoAgenda[]; fichasSemDia: { id: string; name: string }[] }> {
  const { supabase, usuario, tz, janela, hoje, agora } = ctx;
  const [fichasRes, sessoesRes, descansosRes] = await Promise.all([
    supabase
      .from('workout_plans')
      .select(
        'id, name, status, rotation_steps, workout_plan_items(id, weekday, division, order_index, sets, reps, exercises(name, muscle_groups))'
      )
      .eq('student_id', usuario.userId)
      .eq('status', 'released')
      .order('released_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('id, plan_id, division, finished_at')
      .eq('student_id', usuario.userId)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .order('id', { ascending: false }),
    supabase
      .from('workout_plan_rest_completions')
      .select('plan_id, rest_step_index, completed_at')
      .eq('student_id', usuario.userId)
      .order('completed_at', { ascending: false }),
  ]);
  if (fichasRes.error) falha('fichas', fichasRes.error);
  if (sessoesRes.error) falha('sessoes', sessoesRes.error);
  if (descansosRes.error) falha('descansos', descansosRes.error);

  const fichas = (fichasRes.data ?? []) as unknown as FichaInicio[];
  const sessoes = (sessoesRes.data ?? [])
    .filter((s): s is typeof s & { plan_id: string; finished_at: string } => !!s.plan_id && !!s.finished_at)
    .map((s) => ({ id: s.id, planId: s.plan_id, division: s.division ?? null, finishedAt: s.finished_at }));

  // Estado de rotação por ficha: mesmas entradas do `aluno/page.tsx` (já em ordem desc).
  const estados: Record<string, { ultimaConcluida?: string | null; ultimoEvento?: UltimoEventoRotacao }> = {};
  for (const s of sessoes) {
    const e = (estados[s.planId] ??= {});
    if (e.ultimaConcluida === undefined) {
      e.ultimaConcluida = s.division;
      e.ultimoEvento = { ...(e.ultimoEvento ?? {}), ultimaDivisao: { label: s.division, finishedAt: s.finishedAt } };
    }
  }
  for (const d of descansosRes.data ?? []) {
    if (!d.plan_id) continue;
    const e = (estados[d.plan_id] ??= {});
    if (!e.ultimoEvento?.ultimoDescanso) {
      e.ultimoEvento = {
        ...(e.ultimoEvento ?? {}),
        ultimoDescanso: { restStepIndex: d.rest_step_index, completedAt: d.completed_at },
      };
    }
  }

  return projetarTreinos({
    fichas,
    sessoes,
    estados,
    diaInicio: janela.diaInicio,
    diaFim: janela.diaFim,
    hoje,
    tz,
    agora,
  });
}

/** Refeições da dieta liberada vigente DO espectador. */
export async function carregarRefeicoes(ctx: ContextoAgenda): Promise<EventoAgenda[]> {
  const { supabase, usuario, tz, janela, hoje, agora } = ctx;
  const { data: dieta, error } = await supabase
    .from('diets')
    .select('id, released_at, created_at, diet_meals(id, name, time, order_index)')
    .eq('student_id', usuario.userId)
    .eq('status', 'released')
    // Mesma ordenação total da tela de dieta (vigente = primeira).
    .order('released_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) falha('dieta', error);
  if (!dieta) return [];

  const vigente: DietaVigenteAgenda = {
    id: dieta.id,
    releasedAt: dieta.released_at ?? dieta.created_at,
    meals: (dieta.diet_meals ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      time: m.time,
      order_index: m.order_index,
    })),
  };
  const { data: feitos, error: erroFeitos } = await supabase
    .from('diet_meal_completions')
    .select('diet_id, meal_id, occurred_on')
    .eq('user_id', usuario.userId)
    .eq('diet_id', dieta.id)
    .gte('occurred_on', somarDias(janela.diaInicio, -1))
    .lte('occurred_on', somarDias(janela.diaFim, 1));
  if (erroFeitos) falha('cumprimentos', erroFeitos);

  return projetarRefeicoes({
    dieta: vigente,
    cumprimentos: feitos ?? [],
    diaInicio: janela.diaInicio,
    diaFim: janela.diaFim,
    hoje,
    tz,
    agora,
  });
}

/** Lembretes de água DO espectador (meta e janela de lembretes de `water_goals`). */
export async function carregarAgua(ctx: ContextoAgenda): Promise<EventoAgenda[]> {
  const { supabase, usuario, tz, janela, hoje, agora } = ctx;
  const [metaRes, logsRes] = await Promise.all([
    supabase
      .from('water_goals')
      .select('target_ml, reminder_interval_min, reminder_start_min, reminder_end_min')
      .eq('user_id', usuario.userId)
      .maybeSingle(),
    supabase
      .from('water_intake_logs')
      .select('occurred_on, amount_ml')
      .eq('user_id', usuario.userId)
      .gte('occurred_on', somarDias(janela.diaInicio, -1))
      .lte('occurred_on', somarDias(janela.diaFim, 1)),
  ]);
  if (metaRes.error) falha('meta_agua', metaRes.error);
  if (logsRes.error) falha('registros_agua', logsRes.error);

  const meta = metaRes.data;
  const config: ConfigAgua = meta
    ? {
        metaMl: meta.target_ml,
        inicioMin: meta.reminder_start_min,
        fimMin: meta.reminder_end_min,
        intervaloMin: meta.reminder_interval_min,
      }
    : CONFIG_AGUA_PADRAO;

  return projetarAgua({
    config,
    registros: logsRes.data ?? [],
    diaInicio: janela.diaInicio,
    diaFim: janela.diaFim,
    hoje,
    tz,
    agora,
  });
}

/**
 * Carga completa da agenda do usuário para a visão/dia pedidos. Lê o fuso do
 * perfil e dispara os leitores em paralelo; derivados só para aluno/autônomo.
 * Lança em falha de leitura (a página renderiza `ErrorState` com retry).
 */
export async function carregarAgenda(
  usuario: SessionUser,
  visao: VisaoAgenda,
  dia?: string
): Promise<ResultadoAgenda> {
  const supabase = await createClient();
  const { data: perfilDb, error } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', usuario.userId)
    .single();
  if (error || !perfilDb) falha('perfil', error);
  const tz = validarTz(perfilDb.timezone) ? perfilDb.timezone : FUSO_PADRAO_AGENDA;
  const agora = new Date();
  const hoje = diaLocal(agora, tz);
  const janela = janelaDaVisao(visao, dia ?? hoje, tz);
  const perfil = perfilAgenda(usuario.role, usuario.accountType);
  const ctx: ContextoAgenda = { supabase, usuario, perfil, tz, janela, hoje, agora };

  const comDerivados = perfil !== 'professor';
  const vazioTreinos = Promise.resolve({ eventos: [] as EventoAgenda[], fichasSemDia: [] as { id: string; name: string }[] });
  const [compromissos, treinos, refeicoes, agua] = await Promise.all([
    carregarCompromissos(ctx),
    comDerivados ? carregarTreinos(ctx) : vazioTreinos,
    comDerivados ? carregarRefeicoes(ctx) : Promise.resolve([] as EventoAgenda[]),
    comDerivados ? carregarAgua(ctx) : Promise.resolve([] as EventoAgenda[]),
  ]);

  return {
    eventos: [...compromissos, ...treinos.eventos, ...refeicoes, ...agua],
    fichasSemDia: treinos.fichasSemDia,
    tz,
    hoje,
    janela,
    perfil,
  };
}
