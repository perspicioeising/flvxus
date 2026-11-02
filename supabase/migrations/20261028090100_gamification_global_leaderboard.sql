-- =============================================================================
-- Flvxus v2 — Arena G2 (2/2): ranking GLOBAL (cross-tenant) — leaderboard.
-- Contrato: FEAT-001 (ranking global). ORDEM: depois de 20261028090000.
--
-- gamification_global_leaderboard(p_period, p_season, p_limit) é SECURITY
-- DEFINER e SOMENTE LEITURA. Diferente de gamification_tenant_leaderboard: SEM
-- filtro de tenant, SEM filtro de role, SEM gate de 5 participantes. Agrega XP
-- de TODOS os atletas que pontuaram no período (cross-tenant) e ordena por XP
-- do período desc com desempate estável (user_id asc).
--
-- NUNCA chama public.gamification_resolve_season (caminho de ESCRITA): a season
-- mensal é resolvida por SELECT PURO; se não existir, retorna vazio.
--
-- RETORNO (jsonb) — shape para FEAT-002:
--   {
--     "period":     'monthly' | 'yearly',
--     "period_key": text,                 -- 'YYYY-MM' (mensal) ou 'YYYY' (anual)
--     "total":      int,                  -- atletas distintos com XP no período
--     "me":         { "posicao": int, "points": int, "user_id": uuid } | null,
--     "linhas": [ { "posicao": int, "points": int, "display_name": text,
--                   "avatar_url": text, "level": int, "user_id": uuid }, ... ]
--   }
--
-- p_period fora de ('monthly','yearly') => 'monthly'. p_limit clamp [1,200].
--
-- ADITIVA e IDEMPOTENTE: `create or replace`. SECURITY DEFINER + search_path=''.
-- Rollback em 20261028090100_gamification_global_leaderboard_rollback.sql.
-- =============================================================================
create or replace function public.gamification_global_leaderboard(
  p_period text default 'monthly',
  p_season text default null,
  p_limit  integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period      text;
  v_limit       integer;
  v_period_key  text;
  v_season_id   uuid;
  v_year        integer;
  v_total       integer;
  v_me          jsonb;
  v_linhas      jsonb;
begin
  -- Período: só 'monthly'/'yearly'; qualquer outro valor cai em 'monthly'.
  v_period := case when p_period in ('monthly', 'yearly') then p_period else 'monthly' end;

  -- Limite: clamp [1, 200], default 100.
  v_limit := greatest(1, least(200, coalesce(p_limit, 100)));

  if v_period = 'monthly' then
    -- period_key: parâmetro 'YYYY-MM' válido ou o mês-SP vigente.
    v_period_key := case
      when p_season ~ '^\d{4}-\d{2}$' then p_season
      else to_char(public.gamification_sp_date(now()), 'YYYY-MM')
    end;

    -- Resolve a season mensal por SELECT PURO (NUNCA cria season).
    select id into v_season_id
    from public.gamification_seasons
    where scope = 'monthly' and period_key = v_period_key;

    -- Sem season => período vazio.
    if v_season_id is null then
      return jsonb_build_object(
        'period', 'monthly',
        'period_key', v_period_key,
        'total', 0,
        'me', null,
        'linhas', '[]'::jsonb
      );
    end if;

    with agg as (
      select ev.user_id, sum(ev.points)::int as period_xp
      from public.gamification_events ev
      where ev.season_id = v_season_id
      group by ev.user_id
      having sum(ev.points) > 0
    ),
    ranked as (
      select
        agg.user_id,
        agg.period_xp,
        row_number() over (order by agg.period_xp desc, agg.user_id asc)::int as posicao,
        coalesce(nullif(btrim(p.full_name), ''), 'Atleta') as display_name,
        p.avatar_url,
        coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int as level
      from agg
      left join public.profiles p on p.user_id = agg.user_id
      left join public.gamification_profiles gp on gp.user_id = agg.user_id
    )
    select
      (select count(*)::int from agg),
      (
        select case when exists (
            select 1 from ranked r where r.user_id = auth.uid()
          )
          then (
            select jsonb_build_object(
              'posicao', r.posicao,
              'points',  r.period_xp,
              'user_id', r.user_id
            )
            from ranked r where r.user_id = auth.uid()
          )
          else null
        end
      ),
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'posicao',      r.posicao,
            'points',       r.period_xp,
            'display_name', r.display_name,
            'avatar_url',   r.avatar_url,
            'level',        r.level,
            'user_id',      r.user_id
          ) order by r.posicao
        )
        from (select * from ranked order by posicao asc limit v_limit) r
      ), '[]'::jsonb)
    into v_total, v_me, v_linhas;

    return jsonb_build_object(
      'period', 'monthly',
      'period_key', v_period_key,
      'total', v_total,
      'me', v_me,
      'linhas', v_linhas
    );
  else
    -- Anual: ano parametrizado 'YYYY' válido ou o ano-SP vigente.
    v_year := case
      when p_season ~ '^\d{4}$' then p_season::int
      else extract(year from public.gamification_sp_date(now()))::int
    end;
    v_period_key := v_year::text;

    with agg as (
      select ev.user_id, sum(ev.points)::int as period_xp
      from public.gamification_events ev
      where ev.occurred_on >= make_date(v_year, 1, 1)
        and ev.occurred_on <  make_date(v_year + 1, 1, 1)
      group by ev.user_id
      having sum(ev.points) > 0
    ),
    ranked as (
      select
        agg.user_id,
        agg.period_xp,
        row_number() over (order by agg.period_xp desc, agg.user_id asc)::int as posicao,
        coalesce(nullif(btrim(p.full_name), ''), 'Atleta') as display_name,
        p.avatar_url,
        coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int as level
      from agg
      left join public.profiles p on p.user_id = agg.user_id
      left join public.gamification_profiles gp on gp.user_id = agg.user_id
    )
    select
      (select count(*)::int from agg),
      (
        select case when exists (
            select 1 from ranked r where r.user_id = auth.uid()
          )
          then (
            select jsonb_build_object(
              'posicao', r.posicao,
              'points',  r.period_xp,
              'user_id', r.user_id
            )
            from ranked r where r.user_id = auth.uid()
          )
          else null
        end
      ),
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'posicao',      r.posicao,
            'points',       r.period_xp,
            'display_name', r.display_name,
            'avatar_url',   r.avatar_url,
            'level',        r.level,
            'user_id',      r.user_id
          ) order by r.posicao
        )
        from (select * from ranked order by posicao asc limit v_limit) r
      ), '[]'::jsonb)
    into v_total, v_me, v_linhas;

    return jsonb_build_object(
      'period', 'yearly',
      'period_key', v_period_key,
      'total', v_total,
      'me', v_me,
      'linhas', v_linhas
    );
  end if;
end;
$$;

revoke all on function public.gamification_global_leaderboard(text, text, integer) from public;
grant execute on function public.gamification_global_leaderboard(text, text, integer) to authenticated;
