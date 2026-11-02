-- =============================================================================
-- ROLLBACK de 20261029090000_tenant_leaderboard_min_2.sql
-- Restaura o gate do ranking do tenant para 5 participantes (versão de
-- 20261026090300). `create or replace`, idempotente, somente leitura.
-- =============================================================================
create or replace function public.gamification_tenant_leaderboard(p_season text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id    uuid;
  v_period_key   text;
  v_season_id    uuid;
  v_participantes integer;
  v_linhas       jsonb;
begin
  v_tenant_id := public.app_tenant_id();
  if v_tenant_id is null then
    return jsonb_build_object(
      'active', false, 'participantes', 0, 'minimo', 5, 'linhas', '[]'::jsonb
    );
  end if;

  v_period_key := coalesce(
    p_season,
    to_char(public.gamification_sp_date(now()), 'YYYY-MM')
  );

  select id into v_season_id
  from public.gamification_seasons
  where scope = 'monthly' and period_key = v_period_key;

  if v_season_id is null then
    return jsonb_build_object(
      'active', false, 'participantes', 0, 'minimo', 5, 'linhas', '[]'::jsonb
    );
  end if;

  with ranked as (
    select
      ev.user_id,
      p.full_name,
      sum(ev.points)::int as season_xp,
      row_number() over (
        order by sum(ev.points) desc, ev.user_id asc
      )::int as posicao
    from public.gamification_events ev
    join public.profiles p on p.user_id = ev.user_id
    where ev.tenant_id = v_tenant_id
      and ev.season_id = v_season_id
      and p.role = 'student'
    group by ev.user_id, p.full_name
  )
  select
    count(*)::int,
    coalesce(jsonb_agg(
      jsonb_build_object(
        'posicao',   posicao,
        'full_name', full_name,
        'season_xp', season_xp,
        'user_id',   user_id
      ) order by posicao
    ), '[]'::jsonb)
  into v_participantes, v_linhas
  from ranked;

  return jsonb_build_object(
    'active',        v_participantes >= 5,
    'participantes', v_participantes,
    'minimo',        5,
    'linhas',        v_linhas
  );
end;
$$;
