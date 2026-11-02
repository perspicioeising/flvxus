-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261026090400_gamification_seed_achievements.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Restaura seed_achievements_for_tenant à forma legada (4 conquistas,
-- 20261021091000_gamificacao_conquistas.sql) e reverte o reapontamento de
-- points_100 (xp_total -> points_total). NÃO deleta as conquistas G1 já semeadas
-- (preserva user_achievements): a limpeza de catálogo, se desejada, é manual.
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
        'Treine por 7 dias seguidos.',
        'Flame',
        50,
        '{"type":"streak_days","code":"streak_7","days":7}'::jsonb
      ),
      (
        '100 pontos',
        'Acumule 100 pontos de gamificação.',
        'Star',
        0,
        '{"type":"points_total","code":"points_100","total":100}'::jsonb
      )
  ) as v(name, description, icon, points, rule)
  where not exists (
    select 1
    from public.achievements a
    where a.tenant_id = p_tenant_id
      and a.rule ->> 'code' = v.rule ->> 'code'
  );
end;
$$;

-- Reverte o reapontamento de points_100 (xp_total -> points_total). Idempotente.
update public.achievements
  set rule = jsonb_set(rule, '{type}', '"points_total"')
  where rule ->> 'code' = 'points_100'
    and rule ->> 'type' is distinct from 'points_total';
