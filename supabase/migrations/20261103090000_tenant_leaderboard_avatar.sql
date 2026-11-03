-- =============================================================================
-- Flvxus v2 — Arena: adiciona avatar_url à projeção do ranking do tenant.
--
-- ORDEM DE APLICAÇÃO: depois de 20261029090000 (última versão da função).
--
-- Motivação: o ranking da Academia (tenant) e, por tabela, o pódio dos 3
-- primeiros não exibiam a foto do atleta — só iniciais — porque
-- gamification_tenant_leaderboard NÃO projetava avatar_url. Os rankings GLOBAIS
-- (gamification_global_leaderboard) e o de amigos já projetam avatar_url; esta
-- migration alinha o ranking do tenant ao MESMO contrato público.
--
-- Reaplica `gamification_tenant_leaderboard` via `create or replace`, IDÊNTICA à
-- versão de 20261029090000 EXCETO por adicionar `p.avatar_url` ao CTE `ranked` e
-- ao jsonb de cada linha. NADA MAIS muda: ordenação estável, gate de 2
-- participantes, filtro de tenant (app_tenant_id), filtro p.role='student' e a
-- temporada vigente seguem iguais. avatar_url é dado PÚBLICO de competição (já
-- exposto nos rankings globais/amigos) — não expõe nenhum campo privado novo.
--
-- SECURITY DEFINER + search_path='' preservados. Somente leitura. Idempotente.
-- Rollback em 20261103090000_tenant_leaderboard_avatar_rollback.sql (restaura a
-- versão sem avatar_url, com gate 2).
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
      'active', false, 'participantes', 0, 'minimo', 2, 'linhas', '[]'::jsonb
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
      'active', false, 'participantes', 0, 'minimo', 2, 'linhas', '[]'::jsonb
    );
  end if;

  -- Agrega XP da temporada por aluno do tenant, com posição estável.
  with ranked as (
    select
      ev.user_id,
      p.full_name,
      p.avatar_url,
      sum(ev.points)::int as season_xp,
      row_number() over (
        order by sum(ev.points) desc, ev.user_id asc
      )::int as posicao
    from public.gamification_events ev
    join public.profiles p on p.user_id = ev.user_id
    where ev.tenant_id = v_tenant_id
      and ev.season_id = v_season_id
      and p.role = 'student'
    group by ev.user_id, p.full_name, p.avatar_url
  )
  select
    count(*)::int,
    coalesce(jsonb_agg(
      jsonb_build_object(
        'posicao',    posicao,
        'full_name',  full_name,
        'avatar_url', avatar_url,
        'season_xp',  season_xp,
        'user_id',    user_id
      ) order by posicao
    ), '[]'::jsonb)
  into v_participantes, v_linhas
  from ranked;

  return jsonb_build_object(
    'active',        v_participantes >= 2,
    'participantes', v_participantes,
    'minimo',        2,
    'linhas',        v_linhas
  );
end;
$$;

revoke all on function public.gamification_tenant_leaderboard(text) from public;
grant execute on function public.gamification_tenant_leaderboard(text) to authenticated;
