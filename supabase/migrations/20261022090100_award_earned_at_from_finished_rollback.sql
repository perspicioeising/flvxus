-- =============================================================================
-- Rollback: restaura award_points_on_session_finish SEM o earned_at explícito
-- (volta ao default now() do Postgres em user_achievements), idêntica à versão
-- de 20261021091000_gamificacao_conquistas.sql. Idempotente (create or replace).
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

  update public.profiles
    set total_points      = total_points + 10,
        last_workout_date = v_finish_date
    where user_id = new.student_id
    returning tenant_id, total_points into v_tenant_id, v_total_points;

  if v_tenant_id is null then
    return new;
  end if;

  select count(*) into v_sessions_total
  from public.workout_sessions s
  where s.student_id = new.student_id
    and s.finished_at is not null;

  select count(*) into v_sessions_week
  from public.workout_sessions s
  where s.student_id = new.student_id
    and s.finished_at is not null
    and date_trunc('week', (s.finished_at at time zone 'UTC')::date)
        = date_trunc('week', v_finish_date);

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
      insert into public.user_achievements (tenant_id, student_id, achievement_id)
      values (v_tenant_id, new.student_id, a.id)
      on conflict (student_id, achievement_id) do nothing;
    end if;
  end loop;

  return new;
end;
$$;
