-- =============================================================================
-- Flvxus v2 — Hábitos G2 (1/5): ativação dos ganchos inertes + tipo meal_logged.
-- Contrato: FEAT-001 · consome o motor da Arena (gamification_award), não o
-- duplica.
--
-- ORDEM DE APLICAÇÃO OBRIGATÓRIA: aplicar DEPOIS de
-- 20261026090100_gamification_engine.sql (a tabela gamification_event_types e o
-- motor gamification_award precisam existir). Esta sequência de migrations de
-- hábito (20261027090000..090400) é sequencial e deve ser aplicada em ordem.
--
-- O QUE FAZ: liga os três ganchos que nasceram inertes (active=false) na Arena
-- G1 — water_goal, diet_day, daily_checkin — e acrescenta o tipo meal_logged
-- (pontua a 1ª refeição marcada do dia). Zero alteração no ledger: eventos são
-- append-only; ativar um tipo só passa a permitir novas concessões.
--
-- ADITIVA e IDEMPOTENTE: `update ... set active=true`, `insert ... on conflict
-- do nothing`. Rollback em 20261027090000_habit_event_types_rollback.sql.
-- =============================================================================

-- Liga os ganchos inertes da Arena G1: a partir daqui gamification_award deixa
-- de ser no-op para estes tipos.
update public.gamification_event_types
  set active = true
  where event_type in ('water_goal', 'diet_day', 'daily_checkin');

-- Novo tipo: 1ª refeição marcada no dia (até 1/dia). base_points 10.
insert into public.gamification_event_types (event_type, base_points, daily_cap, active, description)
values
  ('meal_logged', 10, 1, true, 'Primeira refeição marcada no dia (cumprimento de dieta).')
on conflict (event_type) do nothing;
