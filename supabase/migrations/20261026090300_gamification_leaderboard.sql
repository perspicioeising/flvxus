-- =============================================================================
-- Flvxus v2 — Arena G1 (4/5): ranking do tenant (leaderboard).
-- Contrato: design.md §Ranking (MEDIUM-1/MEDIUM-2) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO: depois de 20261026090000/090100/090200.
--
-- gamification_tenant_leaderboard(p_season) é SECURITY DEFINER e SOMENTE LEITURA
-- (NÃO concede season_champion — isso vive em gamification_close_season_and_award,
-- caminho de escrita, MEDIUM-2). Filtra tenant_id = public.app_tenant_id()
-- INTERNAMENTE (o aluno não parametriza outro tenant) e inclui só alunos
-- (profiles.role = 'student'). Ordena por season_xp desc com desempate estável
-- (user_id asc). Aplica o gate de 5 participantes distintos.
--
-- RETORNO (jsonb) — shape para FEAT-002/FEAT-003:
--   {
--     "active":        boolean,   -- há >= 5 participantes distintos
--     "participantes": int,       -- contagem de alunos distintos com XP na temporada
--     "minimo":        5,         -- gate fixo
--     "linhas": [ { "posicao": int, "full_name": text,
--                   "season_xp": int, "user_id": uuid }, ... ]
--   }
--
-- p_season NULL => temporada mensal vigente (period_key SP de now()).
--
-- ADITIVA e IDEMPOTENTE: `create or replace`. SECURITY DEFINER + search_path=''.
-- Rollback em 20261026090300_gamification_leaderboard_rollback.sql.
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

  -- Temporada: parâmetro ou vigente (period_key SP de now()).
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

  -- Agrega XP da temporada por aluno do tenant, com posição estável.
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
