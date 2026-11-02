-- =============================================================================
-- Flvxus v2 — Arena G1 (5/5): catálogo de conquistas G1 (9 conquistas).
-- Contrato: design.md §Reconciliação (MEDIUM-6) / §seed · FEAT-001.
-- Base: 20261021091000_gamificacao_conquistas.sql.
--
-- ORDEM DE APLICAÇÃO: depois de 20261026090000..090300.
--
-- Estende seed_achievements_for_tenant para a LISTA FINAL de 9 conquistas,
-- idempotente por rule->>'code' (o seed já era idempotente por code):
--   Mantidas do legado: first_session, week_complete, streak_7.
--   Reapontada:         points_100 -> rule.type = 'xp_total' (lê total_xp).
--   Novas:              hydrated_7 (water_goal_streak, inerte),
--                       unstoppable_30 (streak_days, 30),
--                       discipline_30 (diet_streak, inerte),
--                       evolution_pr (pr_detected),
--                       season_champion (season_champion).
-- NENHUMA conquista legada é deletada (preserva user_achievements). A única
-- mutação sobre entrada legada é o reapontamento de points_100 (update por code).
-- Reaplica o seed a TODOS os tenants no mesmo do $$ ... loop.
--
-- ADITIVA e IDEMPOTENTE: `create or replace` + `where not exists` por code +
-- update idempotente. Rollback em
-- 20261026090400_gamification_seed_achievements_rollback.sql.
-- =============================================================================
create or replace function public.seed_achievements_for_tenant(p_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.achievements (tenant_id, name, description, icon, points, rule)
  select p_tenant_id, v.name, v.description, v.icon, v.points, v.rule
  from (
    values
      (
        'Primeiro treino',
        'Conclua sua primeira sessão de treino.',
        'Trophy',
        20,
        '{"type":"first_session","code":"first_session"}'::jsonb
      ),
      (
        'Semana cheia',
        'Conclua 3 sessões de treino na mesma semana.',
        'CalendarCheck',
        30,
        '{"type":"sessions_in_week","code":"week_complete","count":3}'::jsonb
      ),
      (
        'Sequência de 7 dias',
        'Treine (ou cumpra o descanso) por 7 dias seguidos.',
        'Flame',
        50,
        '{"type":"streak_days","code":"streak_7","days":7}'::jsonb
      ),
      (
        '100 pontos',
        'Acumule 100 pontos de XP na Arena.',
        'Star',
        0,
        '{"type":"xp_total","code":"points_100","total":100}'::jsonb
      ),
      (
        'Hidratado',
        'Cumpra a meta de hidratação por 7 dias seguidos.',
        'Droplet',
        30,
        '{"type":"water_goal_streak","code":"hydrated_7","days":7}'::jsonb
      ),
      (
        'Imparável',
        'Mantenha uma sequência de aderência de 30 dias.',
        'Flame',
        150,
        '{"type":"streak_days","code":"unstoppable_30","days":30}'::jsonb
      ),
      (
        'Disciplina',
        'Siga a dieta prescrita por 30 dias.',
        'Salad',
        150,
        '{"type":"diet_streak","code":"discipline_30","days":30}'::jsonb
      ),
      (
        'Evolução',
        'Bata um recorde pessoal de carga ou volume.',
        'TrendingUp',
        40,
        '{"type":"pr_detected","code":"evolution_pr"}'::jsonb
      ),
      (
        'Campeão da temporada',
        'Termine o mês em 1º lugar no ranking do seu estúdio.',
        'Crown',
        200,
        '{"type":"season_champion","code":"season_champion"}'::jsonb
      )
  ) as v(name, description, icon, points, rule)
  where not exists (
    select 1
    from public.achievements a
    where a.tenant_id = p_tenant_id
      and a.rule ->> 'code' = v.rule ->> 'code'
  );

  -- Reaponta points_100 do legado (points_total -> xp_total). Idempotente.
  update public.achievements
    set rule = jsonb_set(rule, '{type}', '"xp_total"')
    where tenant_id = p_tenant_id
      and rule ->> 'code' = 'points_100'
      and rule ->> 'type' is distinct from 'xp_total';
end;
$$;

-- Reaplica o seed estendido a TODOS os tenants existentes (idempotente).
do $$
declare
  r record;
begin
  for r in select id from public.tenants loop
    perform public.seed_achievements_for_tenant(r.id);
  end loop;
end;
$$;
