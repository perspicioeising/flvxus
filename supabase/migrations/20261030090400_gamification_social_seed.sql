-- =============================================================================
-- Flvxus v2 — Arena G3 (5/5): seed da conquista challenge_winner (por tenant).
-- Contrato: design.md §Seed de conquista (migration 5) · FEAT-001.
-- Base: 20261026090400_gamification_seed_achievements.sql.
--
-- ORDEM DE APLICAÇÃO: depois de 20261030090300 (a apuração concede a conquista).
--
-- OBRIGATÓRIO estender seed_achievements_for_tenant (via create or replace),
-- acrescentando a conquista challenge_winner à lista `values` existente — NÃO um
-- bloco avulso. handle_new_user chama seed_achievements_for_tenant a cada novo
-- tenant; estender a função faz todo tenant FUTURO herdar a conquista. O do $$
-- loop reaplica aos tenants EXISTENTES. Dedupe por rule->>'code' (challenge_winner).
--
-- ADITIVA e IDEMPOTENTE: `create or replace` + `where not exists` por code.
-- Rollback em 20261030090400_gamification_social_seed_rollback.sql.
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
      ),
      -- G3: conquista de vitória em desafio individual da Arena. Concedida pelo
      -- motor (gamification_award) como CONQUISTA de 0 ponto na apuração do duelo.
      (
        'Campeão de desafio',
        'Vença um desafio individual da Arena.',
        'Medal',
        0,
        '{"type":"challenge_winner","code":"challenge_winner"}'::jsonb
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
