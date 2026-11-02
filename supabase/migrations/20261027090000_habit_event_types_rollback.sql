-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261027090000_habit_event_types.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Volta os três ganchos a inertes (active=false) e remove o tipo meal_logged do
-- catálogo. NÃO apaga eventos já concedidos no ledger (gamification_events é
-- append-only); apenas impede novas concessões. `where`/`if exists`.
-- =============================================================================

update public.gamification_event_types
  set active = false
  where event_type in ('water_goal', 'diet_day', 'daily_checkin');

delete from public.gamification_event_types
  where event_type = 'meal_logged';
