-- =============================================================================
-- Flvxus v2 — Arena G1 (2/5): catálogo de tipos, motor SECURITY DEFINER,
-- triggers e BACKFILL idempotente.
-- Contrato: design.md §Esquema de dados (engine) / §Streak / §Detecção de PR /
-- §Temporadas / §Reconciliação (MEDIUM-5) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO OBRIGATÓRIA: aplicar 20261026090000_gamification_core.sql
-- ANTES deste (as tabelas gamification_* precisam existir). Esta migration
-- recria award_points_on_session_finish já na forma nova e, na MESMA transação,
-- faz o backfill — fechando a janela de dobro/sumiço de XP (MEDIUM-5).
--
-- ORDEM INTERNA OBRIGATÓRIA (MEDIUM-5):
--   (a) funções do motor;
--   (b) recriação do trigger legado award_points_on_session_finish (deixa de
--       somar profiles.total_points += 10; passa a emitir workout_completed);
--   (c) backfill idempotente de workout_completed para sessões passadas.
--
-- ADITIVA e IDEMPOTENTE: `create ... if not exists`, `create or replace`,
-- `insert ... on conflict do nothing`, `do $$ ... if not exists`. Toda função
-- é SECURITY DEFINER + `set search_path = ''`. Rollback em
-- 20261026090100_gamification_engine_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- (a0) gamification_event_types — catálogo de configuração (ponto único de
-- verdade dos valores de XP e limite diário). Os três active=false são os
-- ganchos INERTES (sem fonte de dados na G1): zero evento, zero XP.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_event_types (
  event_type  text primary key,
  base_points integer not null,
  daily_cap   smallint not null default 1,
  active      boolean not null default true,
  description text
);

comment on table public.gamification_event_types is
  'Catálogo de tipos de evento da Arena: valores de XP e limite diário por tipo. '
  'active=false => gancho inerte (sem fonte na G1): nunca gera evento.';

insert into public.gamification_event_types (event_type, base_points, daily_cap, active, description)
values
  ('workout_completed', 30, 1, true,  'Sessão de treino concluída (>=1 série completed).'),
  ('load_progression',  10, 5, true,  'PR de carga/volume no fecho da sessão (até 5/dia).'),
  ('physical_evolution',15, 1, true,  'Avaliação física registrada (mín. 7 dias entre pontuáveis).'),
  ('diet_day',          20, 1, false, 'Gancho inerte: adesão de dieta (sem fonte na G1).'),
  ('water_goal',        10, 1, false, 'Gancho inerte: meta de hidratação (sem fonte na G1).'),
  ('daily_checkin',      5, 1, false, 'Gancho inerte: check-in diário (sem fonte na G1).')
on conflict (event_type) do nothing;

-- -----------------------------------------------------------------------------
-- (a1) gamification_level_for_xp — nível a partir do XP acumulado.
-- Limiares: 0/500/1500/3000/6000/12000 (níveis 0..5). Espelhada em TS por
-- lib/arena/niveis.ts (FEAT-002) com a MESMA tabela de limiares.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_level_for_xp(p_xp integer)
returns smallint
language sql
immutable
set search_path = ''
as $$
  select case
    when p_xp >= 12000 then 5
    when p_xp >=  6000 then 4
    when p_xp >=  3000 then 3
    when p_xp >=  1500 then 2
    when p_xp >=   500 then 1
    else 0
  end::smallint
$$;

-- -----------------------------------------------------------------------------
-- (a2) gamification_resolve_season — garante e devolve a temporada mensal de uma
-- data (upsert lazy por period_key SP). Sem cron: a virada é determinística.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_resolve_season(p_on date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period_key text;
  v_starts     timestamptz;
  v_ends       timestamptz;
  v_id         uuid;
begin
  v_period_key := to_char(p_on, 'YYYY-MM');
  -- Limites do mês de calendário no fuso SP, armazenados como timestamptz.
  v_starts := (date_trunc('month', p_on)::timestamp
                 at time zone 'America/Sao_Paulo');
  v_ends   := ((date_trunc('month', p_on) + interval '1 month')::timestamp
                 at time zone 'America/Sao_Paulo');

  insert into public.gamification_seasons (scope, period_key, starts_at, ends_at)
  values ('monthly', v_period_key, v_starts, v_ends)
  on conflict (scope, period_key) do nothing;

  select id into v_id
  from public.gamification_seasons
  where scope = 'monthly' and period_key = v_period_key;

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- (a3) gamification_close_season_and_award — concede season_champion ao 1º
-- colocado de uma temporada FECHADA. Caminho de ESCRITA (MEDIUM-2): NUNCA é
-- chamada pela leitura do leaderboard. Idempotente (reference_id = period_key).
-- Desempate estável: season_xp desc, user_id asc. Concede por tenant.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_close_season_and_award(p_period_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season_id uuid;
  r           record;
begin
  select id into v_season_id
  from public.gamification_seasons
  where scope = 'monthly' and period_key = p_period_key;

  if v_season_id is null then
    return;
  end if;

  -- 1º colocado (apenas alunos) de cada tenant na temporada fechada.
  for r in
    select e.tenant_id, e.user_id
    from (
      select
        ev.tenant_id,
        ev.user_id,
        sum(ev.points) as season_xp,
        row_number() over (
          partition by ev.tenant_id
          order by sum(ev.points) desc, ev.user_id asc
        ) as rn
      from public.gamification_events ev
      join public.profiles p on p.user_id = ev.user_id
      where ev.season_id = v_season_id
        and p.role = 'student'
      group by ev.tenant_id, ev.user_id
    ) e
    where e.rn = 1
  loop
    -- season_champion é concedido via award (idempotente por reference_id).
    -- occurred_on = fim do mês da temporada fechada (determinístico).
    perform public.gamification_award(
      r.user_id,
      'season_champion',
      p_period_key,
      (to_date(p_period_key, 'YYYY-MM') + interval '1 month - 1 day')::date,
      now()
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- (a4) gamification_award — coração do motor. SECURITY DEFINER.
-- Semeia perfil lazy, resolve temporada, fecha a anterior se virou, aplica
-- limite diário, insere evento idempotente, atualiza perfil (XP/nível/stats) e
-- concede conquistas elegíveis carimbando earned_at = p_earned_at (HIGH-1).
-- season_champion é tratado como CONQUISTA (sem exigir linha pontuável em
-- event_types) — ver ramo abaixo.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_award(
  p_user         uuid,
  p_event_type   text,
  p_reference_id text,
  p_occurred_on  date,
  p_earned_at    timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id   uuid;
  v_base_points integer;
  v_daily_cap   smallint;
  v_active      boolean;
  v_season_id   uuid;
  v_prev_season uuid;
  v_prev_period text;
  v_day_count   integer;
  v_event_id    uuid;
  v_total_xp    integer;
  v_stats_key   text;
  a             record;
begin
  -- Tenant do usuário (necessário para o evento e a RLS de ranking).
  select tenant_id into v_tenant_id
  from public.profiles
  where user_id = p_user;

  if v_tenant_id is null then
    return;
  end if;

  -- (1) Semeadura LAZY do perfil (MEDIUM-3).
  insert into public.gamification_profiles (user_id, tenant_id)
  values (p_user, v_tenant_id)
  on conflict (user_id) do nothing;

  -- season_champion é CONQUISTA (não um tipo pontuável do catálogo): concede a
  -- conquista e registra um evento de 0 ponto para idempotência/auditoria.
  if p_event_type = 'season_champion' then
    v_season_id := public.gamification_resolve_season(p_occurred_on);

    insert into public.gamification_events
      (user_id, tenant_id, event_type, points, reference_id, season_id, occurred_on)
    values (p_user, v_tenant_id, p_event_type, 0, p_reference_id, v_season_id, p_occurred_on)
    on conflict (user_id, event_type, reference_id) do nothing
    returning id into v_event_id;

    if v_event_id is null then
      return; -- já concedido
    end if;

    for a in
      select id from public.achievements
      where tenant_id = v_tenant_id
        and rule ->> 'type' = 'season_champion'
    loop
      insert into public.user_achievements (tenant_id, student_id, achievement_id, earned_at)
      values (v_tenant_id, p_user, a.id, p_earned_at)
      on conflict (student_id, achievement_id) do nothing;
    end loop;

    return;
  end if;

  -- (2) Tipo do catálogo: inexistente/inativo => no-op.
  select base_points, daily_cap, active
    into v_base_points, v_daily_cap, v_active
  from public.gamification_event_types
  where event_type = p_event_type;

  if v_base_points is null or v_active is distinct from true then
    return;
  end if;

  -- (3) Virada de temporada (MEDIUM-2): se a temporada resolvida difere da do
  -- último evento do usuário, fecha a anterior e concede season_champion.
  v_season_id := public.gamification_resolve_season(p_occurred_on);

  select e.season_id into v_prev_season
  from public.gamification_events e
  where e.user_id = p_user
    and e.season_id is not null
    and e.season_id <> v_season_id
  order by e.created_at desc
  limit 1;

  if v_prev_season is not null then
    select period_key into v_prev_period
    from public.gamification_seasons
    where id = v_prev_season;

    if v_prev_period is not null then
      perform public.gamification_close_season_and_award(v_prev_period);
    end if;
  end if;

  -- (4) Limite diário por (user, type, occurred_on).
  select count(*) into v_day_count
  from public.gamification_events
  where user_id = p_user
    and event_type = p_event_type
    and occurred_on = p_occurred_on;

  if v_day_count >= v_daily_cap then
    return; -- excedeu o teto do dia: não pontua
  end if;

  -- (5) Evento novo (idempotência estrutural).
  insert into public.gamification_events
    (user_id, tenant_id, event_type, points, reference_id, season_id, occurred_on)
  values (p_user, v_tenant_id, p_event_type, v_base_points, p_reference_id, v_season_id, p_occurred_on)
  on conflict (user_id, event_type, reference_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return; -- já pontuado
  end if;

  -- (6) Atualiza o cache derivado (XP/nível/stats).
  v_stats_key := case p_event_type
    when 'workout_completed'  then 'workouts'
    when 'load_progression'   then 'prs'
    when 'physical_evolution' then 'assessments'
    else null
  end;

  update public.gamification_profiles
    set total_xp   = total_xp + v_base_points,
        level      = public.gamification_level_for_xp(total_xp + v_base_points),
        stats      = case when v_stats_key is null then stats
                       else jsonb_set(
                              stats,
                              array[v_stats_key],
                              to_jsonb(coalesce((stats ->> v_stats_key)::int, 0) + 1)
                            )
                     end,
        updated_at = now()
    where user_id = p_user
    returning total_xp into v_total_xp;

  -- (7) Concede conquistas elegíveis do tenant (carimbo HIGH-1 em earned_at).
  for a in
    select id, rule
    from public.achievements
    where tenant_id = v_tenant_id
      and rule is not null
  loop
    if (
      -- primeira sessão concluída (um único workout_completed basta)
      (a.rule ->> 'type' = 'first_session'
        and p_event_type = 'workout_completed'
        and coalesce((select (stats ->> 'workouts')::int
                        from public.gamification_profiles
                        where user_id = p_user), 0) = 1)
      -- 3 treinos na mesma semana-SP (sessions_in_week)
      or (a.rule ->> 'type' = 'sessions_in_week'
        and p_event_type = 'workout_completed'
        and (select count(*)
               from public.gamification_events e
               where e.user_id = p_user
                 and e.event_type = 'workout_completed'
                 and date_trunc('week', e.occurred_on)
                     = date_trunc('week', p_occurred_on))
            >= coalesce((a.rule ->> 'count')::int, 1))
      -- streak de dias consecutivos (current_streak já recalculada no fecho)
      or (a.rule ->> 'type' = 'streak_days'
        and coalesce((select current_streak
                        from public.gamification_profiles
                        where user_id = p_user), 0)
            >= coalesce((a.rule ->> 'days')::int, 1))
      -- XP total (points_100 reapontada)
      or (a.rule ->> 'type' = 'xp_total'
        and coalesce(v_total_xp, 0) >= coalesce((a.rule ->> 'total')::int, 0))
      -- PR detectado
      or (a.rule ->> 'type' = 'pr_detected'
        and p_event_type = 'load_progression')
    ) then
      insert into public.user_achievements (tenant_id, student_id, achievement_id, earned_at)
      values (v_tenant_id, p_user, a.id, p_earned_at)
      on conflict (student_id, achievement_id) do nothing;
    end if;
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- (a5) gamification_recalc_streak — streak de ADERÊNCIA (não "dias com treino").
-- Um dia-SP conta se tem >=1 evento de aderência: sessão finalizada com >=1
-- série completed=true OU um workout_plan_rest_completions (descanso cumprido).
-- Caminha de hoje-SP para trás contando dias consecutivos; o dia de referência
-- sem evento NÃO quebra (congela). Atualiza gamification_profiles.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_recalc_streak(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_today     date;
  v_cursor    date;
  v_streak    integer;
  v_longest   integer;
  v_last      date;
  v_has_day   boolean;
begin
  select tenant_id into v_tenant_id from public.profiles where user_id = p_user;
  if v_tenant_id is null then
    return;
  end if;

  insert into public.gamification_profiles (user_id, tenant_id)
  values (p_user, v_tenant_id)
  on conflict (user_id) do nothing;

  v_today  := public.gamification_sp_date(now());
  v_streak := 0;
  v_cursor := v_today;

  -- Caminha para trás; conta dias-SP consecutivos com evento de aderência.
  loop
    select exists (
      select 1 from public.workout_sessions s
      where s.student_id = p_user
        and s.finished_at is not null
        and public.gamification_sp_date(s.finished_at) = v_cursor
        and exists (
          select 1 from public.workout_set_logs l
          where l.session_id = s.id and l.completed = true
        )
    ) or exists (
      select 1 from public.workout_plan_rest_completions rc
      where rc.student_id = p_user
        and public.gamification_sp_date(rc.completed_at) = v_cursor
    ) into v_has_day;

    if v_has_day then
      v_streak := v_streak + 1;
      v_cursor := v_cursor - 1;
    elsif v_cursor = v_today then
      -- dia de referência ainda sem evento: congela (não quebra), recua 1 dia.
      v_cursor := v_cursor - 1;
    else
      exit;
    end if;
  end loop;

  -- last_adherence_date: hoje se teve aderência hoje, senão ontem (se há streak).
  if v_streak > 0 then
    if exists (
      select 1 from public.workout_sessions s
      where s.student_id = p_user
        and s.finished_at is not null
        and public.gamification_sp_date(s.finished_at) = v_today
        and exists (select 1 from public.workout_set_logs l
                     where l.session_id = s.id and l.completed = true)
    ) or exists (
      select 1 from public.workout_plan_rest_completions rc
      where rc.student_id = p_user
        and public.gamification_sp_date(rc.completed_at) = v_today
    ) then
      v_last := v_today;
    else
      v_last := v_today - 1; -- hoje congelou; último de fato foi ontem
    end if;
  end if;

  select greatest(coalesce(longest_streak, 0), v_streak) into v_longest
  from public.gamification_profiles where user_id = p_user;

  update public.gamification_profiles
    set current_streak      = v_streak,
        longest_streak      = coalesce(v_longest, v_streak),
        last_adherence_date = v_last,
        updated_at          = now()
    where user_id = p_user;
end;
$$;

-- -----------------------------------------------------------------------------
-- (a6) gamification_check_prs_for_session — detecta PR de carga/volume NO FECHO
-- da sessão (HIGH-4), não a cada série. Para cada exercício efetivo distinto,
-- compara a melhor série completed da sessão contra o histórico do aluno
-- (excluindo a sessão corrente). Antifraude: load_done>0, reps 1..100, <=3x
-- recorde. v_exercise_id null => no-op (item apagado sem substituto).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_check_prs_for_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student   uuid;
  v_finished  timestamptz;
  v_on        date;
  r           record;
  v_best_load numeric;
  v_best_vol  numeric;
  v_hist_load numeric;
  v_hist_vol  numeric;
  v_is_pr     boolean;
begin
  select student_id, finished_at into v_student, v_finished
  from public.workout_sessions
  where id = p_session_id;

  if v_student is null or v_finished is null then
    return;
  end if;
  v_on := public.gamification_sp_date(v_finished);

  -- Exercícios efetivos distintos executados (completed/plausíveis) na sessão.
  for r in
    select distinct coalesce(
             wsl.substitute_exercise_id,
             (select wpi.exercise_id from public.workout_plan_items wpi
               where wpi.id = wsl.plan_item_id)
           ) as exercise_id
    from public.workout_set_logs wsl
    where wsl.session_id = p_session_id
      and wsl.completed = true
      and coalesce(wsl.load_done, 0) > 0
      and coalesce(wsl.reps_done, 0) between 1 and 100
  loop
    if r.exercise_id is null then
      continue; -- item prescrito apagado e sem substituto: no-op
    end if;

    -- Melhor carga e melhor volume da SESSÃO CORRENTE para o exercício.
    select max(wsl.load_done),
           max(wsl.load_done * wsl.reps_done)
      into v_best_load, v_best_vol
    from public.workout_set_logs wsl
    where wsl.session_id = p_session_id
      and wsl.completed = true
      and coalesce(wsl.load_done, 0) > 0
      and coalesce(wsl.reps_done, 0) between 1 and 100
      and coalesce(
            wsl.substitute_exercise_id,
            (select wpi.exercise_id from public.workout_plan_items wpi
              where wpi.id = wsl.plan_item_id)
          ) = r.exercise_id;

    -- Máximos históricos do próprio aluno, EXCLUINDO a sessão corrente.
    select max(wsl.load_done),
           max(wsl.load_done * wsl.reps_done)
      into v_hist_load, v_hist_vol
    from public.workout_set_logs wsl
    join public.workout_sessions s on s.id = wsl.session_id
    where s.student_id = v_student
      and s.finished_at is not null
      and s.id <> p_session_id
      and wsl.completed = true
      and coalesce(wsl.load_done, 0) > 0
      and coalesce(wsl.reps_done, 0) between 1 and 100
      and coalesce(
            wsl.substitute_exercise_id,
            (select wpi.exercise_id from public.workout_plan_items wpi
              where wpi.id = wsl.plan_item_id)
          ) = r.exercise_id;

    -- PR = supera carga OU volume histórico. Antifraude: não premia salto
    -- implausível (> 3x o recorde anterior de carga).
    v_is_pr := (
      (v_hist_load is null and v_best_load is not null)
      or (v_best_load is not null and v_hist_load is not null
          and v_best_load > v_hist_load
          and v_best_load <= v_hist_load * 3)
      or (v_hist_vol is null and v_best_vol is not null)
      or (v_best_vol is not null and v_hist_vol is not null
          and v_best_vol > v_hist_vol)
    );

    if v_is_pr then
      perform public.gamification_award(
        v_student,
        'load_progression',
        p_session_id::text || ':' || r.exercise_id::text,
        v_on,
        v_finished
      );
    end if;
  end loop;
end;
$$;

-- =============================================================================
-- (b) RECRIAÇÃO do trigger legado award_points_on_session_finish — forma NOVA.
-- DEIXA de somar profiles.total_points += 10 (congelado). Ao fechar a sessão
-- (finished_at null->não-null) com >=1 série completed: emite workout_completed
-- via gamification_award (carimbo earned_at = finished_at, HIGH-1), avalia PRs
-- da sessão e recalcula a streak. O corpo crítico é protegido para que uma
-- falha de gamificação NUNCA bloqueie o fecho do treino.
-- =============================================================================
create or replace function public.award_points_on_session_finish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.finished_at is null or old.finished_at is not null then
    return new;
  end if;

  begin
    -- Só pontua sessão com ao menos uma série concluída.
    if exists (
      select 1 from public.workout_set_logs l
      where l.session_id = new.id and l.completed = true
    ) then
      perform public.gamification_award(
        new.student_id,
        'workout_completed',
        new.id::text,
        public.gamification_sp_date(new.finished_at),
        new.finished_at
      );
      perform public.gamification_check_prs_for_session(new.id);
    end if;

    -- Streak sempre recalculada no fecho (descanso + sessões em dias-SP).
    perform public.gamification_recalc_streak(new.student_id);
  exception when others then
    -- A experiência de treino tem precedência sobre o XP: loga e segue.
    raise warning 'gamification award_points_on_session_finish falhou: %', sqlerrm;
  end;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Trigger de avaliação física: physical_evolution com antifraude (MEDIUM-4):
-- cap diário (catálogo) + intervalo mínimo de 7 dias entre avaliações
-- pontuáveis. A avaliação é SEMPRE gravada; só o XP respeita a janela.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_on_assessment_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_on date;
begin
  begin
    v_on := public.gamification_sp_date(new.assessed_at);

    -- Guarda de 7 dias: não pontua se houve physical_evolution recente.
    if not exists (
      select 1 from public.gamification_events e
      where e.user_id = new.student_id
        and e.event_type = 'physical_evolution'
        and e.occurred_on > v_on - 7
    ) then
      perform public.gamification_award(
        new.student_id,
        'physical_evolution',
        new.id::text,
        v_on,
        new.assessed_at
      );
    end if;
  exception when others then
    raise warning 'gamification on_assessment_insert falhou: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists physical_assessments_gamification on public.physical_assessments;
create trigger physical_assessments_gamification
  after insert on public.physical_assessments
  for each row execute function public.gamification_on_assessment_insert();

-- -----------------------------------------------------------------------------
-- Trigger de descanso cumprido: recalcula a streak (descanso mantém a streak).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_on_rest_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform public.gamification_recalc_streak(new.student_id);
  exception when others then
    raise warning 'gamification on_rest_completion falhou: %', sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists workout_plan_rest_completions_gamification
  on public.workout_plan_rest_completions;
create trigger workout_plan_rest_completions_gamification
  after insert on public.workout_plan_rest_completions
  for each row execute function public.gamification_on_rest_completion();

-- =============================================================================
-- (c) BACKFILL idempotente de workout_completed (MEDIUM-5).
-- Para toda workout_sessions finalizada com >=1 série completed=true, emite o
-- evento workout_completed via gamification_award (on conflict do nothing cobre
-- reexecução). O carimbo de earned_at usa finished_at. Recompõe total_xp/level/
-- stats a partir do ledger. A streak é recalculada UMA vez por aluno no fim.
-- =============================================================================
do $$
declare
  s record;
begin
  for s in
    select ws.id, ws.student_id, ws.finished_at
    from public.workout_sessions ws
    where ws.finished_at is not null
      and exists (
        select 1 from public.workout_set_logs l
        where l.session_id = ws.id and l.completed = true
      )
    order by ws.finished_at asc
  loop
    perform public.gamification_award(
      s.student_id,
      'workout_completed',
      s.id::text,
      public.gamification_sp_date(s.finished_at),
      s.finished_at
    );
  end loop;

  -- Recalcula a streak de cada aluno que recebeu backfill.
  for s in
    select distinct ws.student_id
    from public.workout_sessions ws
    where ws.finished_at is not null
  loop
    perform public.gamification_recalc_streak(s.student_id);
  end loop;
end;
$$;
