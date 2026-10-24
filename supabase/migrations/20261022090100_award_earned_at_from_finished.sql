-- =============================================================================
-- Flvxus — carimbar earned_at = new.finished_at ao conceder conquistas
-- Contrato: docs/architecture.md §6.3 · ADR 0013 · FEAT resumo pós-treino
--
-- MOTIVO (design-review HIGH #1): started_at/finished_at são gravados pelo
-- relógio do NODE (new Date() em iniciar/finalizarSessao), mas earned_at usava
-- o default now() do POSTGRES — relógios distintos. A janela temporal
-- [started_at, finished_at + Ns] para achar "conquistas desta sessão" era
-- frágil (podia descartar uma conquista real ou captar de uma sessão paralela).
--
-- FIX: o trigger carimba earned_at EXPLICITAMENTE com new.finished_at (o mesmo
-- instante gravado na sessão). O resumo então filtra conquistas por igualdade
-- (earned_at = session.finished_at) — relógio único, determinístico, sem
-- mudança de schema. Idêntico a 20261021091000_gamificacao_conquistas.sql,
-- mudando SÓ o insert em user_achievements para fixar earned_at.
--
-- Aditivo e idempotente (create or replace). SECURITY DEFINER + search_path=''
-- preservados. Aplicação MANUAL no Supabase do usuário (sem Docker).
-- =============================================================================
create or replace function public.award_points_on_session_finish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id       uuid;
  v_finish_date     date;
  v_total_points    integer;
  v_sessions_total  integer;
  v_sessions_week   integer;
  v_streak          integer;
  v_cursor          date;
  a                 record;
begin
  if new.finished_at is null or old.finished_at is not null then
    return new;
  end if;

  v_finish_date := (new.finished_at at time zone 'UTC')::date;

  -- Pontos e data do último treino (comportamento original), capturando o total.
  update public.profiles
    set total_points      = total_points + 10,
        last_workout_date = v_finish_date
    where user_id = new.student_id
    returning tenant_id, total_points into v_tenant_id, v_total_points;

  if v_tenant_id is null then
    return new;
  end if;

  -- Sessões concluídas do aluno (inclui a atual, já com finished_at).
  select count(*) into v_sessions_total
  from public.workout_sessions s
  where s.student_id = new.student_id
    and s.finished_at is not null;

  -- Sessões concluídas na mesma semana (seg..dom) da data da sessão.
  select count(*) into v_sessions_week
  from public.workout_sessions s
  where s.student_id = new.student_id
    and s.finished_at is not null
    and date_trunc('week', (s.finished_at at time zone 'UTC')::date)
        = date_trunc('week', v_finish_date);

  -- Streak: conta dias consecutivos com >= 1 sessão terminando em v_finish_date.
  v_streak := 0;
  v_cursor := v_finish_date;
  loop
    if exists (
      select 1
      from public.workout_sessions s
      where s.student_id = new.student_id
        and s.finished_at is not null
        and (s.finished_at at time zone 'UTC')::date = v_cursor
    ) then
      v_streak := v_streak + 1;
      v_cursor := v_cursor - 1;
    else
      exit;
    end if;
  end loop;

  -- Avalia cada conquista do tenant e concede as elegíveis (idempotente).
  -- earned_at é carimbado com new.finished_at (relógio único; HIGH #1) para
  -- que o resumo possa filtrar por igualdade exata com a sessão.
  for a in
    select id, rule
    from public.achievements
    where tenant_id = v_tenant_id
      and rule is not null
  loop
    if (
      (a.rule ->> 'type' = 'first_session' and v_sessions_total = 1)
      or (a.rule ->> 'type' = 'sessions_in_week'
          and v_sessions_week >= coalesce((a.rule ->> 'count')::int, 1))
      or (a.rule ->> 'type' = 'streak_days'
          and v_streak >= coalesce((a.rule ->> 'days')::int, 1))
      or (a.rule ->> 'type' = 'points_total'
          and v_total_points >= coalesce((a.rule ->> 'total')::int, 0))
    ) then
      insert into public.user_achievements (tenant_id, student_id, achievement_id, earned_at)
      values (v_tenant_id, new.student_id, a.id, new.finished_at)
      on conflict (student_id, achievement_id) do nothing;
    end if;
  end loop;

  return new;
end;
$$;
