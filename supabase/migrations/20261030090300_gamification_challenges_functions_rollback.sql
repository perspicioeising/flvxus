-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261030090300_gamification_challenges_functions.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
--
-- Dropa as 5 funções de desafio E recria gamification_award de volta ao ramo
-- LITERAL 'season_champion' (estado de 20261026090100_gamification_engine.sql).
-- =============================================================================

drop function if exists public.gamification_settle_challenge(uuid);
drop function if exists public.gamification_challenge_scoreboard(uuid);
drop function if exists public.gamification_create_coach_challenge(uuid[], smallint, text, text, text);
drop function if exists public.gamification_respond_duel(uuid, boolean);
drop function if exists public.gamification_create_duel(uuid, smallint);

-- Recria gamification_award com o ramo literal 'season_champion' (pré-G3).
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
  select tenant_id into v_tenant_id
  from public.profiles
  where user_id = p_user;

  if v_tenant_id is null then
    return;
  end if;

  insert into public.gamification_profiles (user_id, tenant_id)
  values (p_user, v_tenant_id)
  on conflict (user_id) do nothing;

  if p_event_type = 'season_champion' then
    v_season_id := public.gamification_resolve_season(p_occurred_on);

    insert into public.gamification_events
      (user_id, tenant_id, event_type, points, reference_id, season_id, occurred_on)
    values (p_user, v_tenant_id, p_event_type, 0, p_reference_id, v_season_id, p_occurred_on)
    on conflict (user_id, event_type, reference_id) do nothing
    returning id into v_event_id;

    if v_event_id is null then
      return;
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

  select base_points, daily_cap, active
    into v_base_points, v_daily_cap, v_active
  from public.gamification_event_types
  where event_type = p_event_type;

  if v_base_points is null or v_active is distinct from true then
    return;
  end if;

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

  select count(*) into v_day_count
  from public.gamification_events
  where user_id = p_user
    and event_type = p_event_type
    and occurred_on = p_occurred_on;

  if v_day_count >= v_daily_cap then
    return;
  end if;

  insert into public.gamification_events
    (user_id, tenant_id, event_type, points, reference_id, season_id, occurred_on)
  values (p_user, v_tenant_id, p_event_type, v_base_points, p_reference_id, v_season_id, p_occurred_on)
  on conflict (user_id, event_type, reference_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return;
  end if;

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

  for a in
    select id, rule
    from public.achievements
    where tenant_id = v_tenant_id
      and rule is not null
  loop
    if (
      (a.rule ->> 'type' = 'first_session'
        and p_event_type = 'workout_completed'
        and coalesce((select (stats ->> 'workouts')::int
                        from public.gamification_profiles
                        where user_id = p_user), 0) = 1)
      or (a.rule ->> 'type' = 'sessions_in_week'
        and p_event_type = 'workout_completed'
        and (select count(*)
               from public.gamification_events e
               where e.user_id = p_user
                 and e.event_type = 'workout_completed'
                 and date_trunc('week', e.occurred_on)
                     = date_trunc('week', p_occurred_on))
            >= coalesce((a.rule ->> 'count')::int, 1))
      or (a.rule ->> 'type' = 'streak_days'
        and coalesce((select current_streak
                        from public.gamification_profiles
                        where user_id = p_user), 0)
            >= coalesce((a.rule ->> 'days')::int, 1))
      or (a.rule ->> 'type' = 'xp_total'
        and coalesce(v_total_xp, 0) >= coalesce((a.rule ->> 'total')::int, 0))
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
