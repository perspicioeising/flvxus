-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261027090100_water_goals_and_intake.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Remove na ordem inversa: triggers, função wrapper, função de sync, tabelas.
-- As policies de RLS caem junto das tabelas (drop table). `if exists`.
-- =============================================================================

drop trigger if exists water_intake_logs_gamification_insert on public.water_intake_logs;
drop trigger if exists water_intake_logs_gamification_delete on public.water_intake_logs;

drop function if exists public.habit_water_after_change();
drop function if exists public.gamification_sync_water_goal(uuid, date);

drop table if exists public.water_intake_logs;
drop table if exists public.water_goals;
