-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261027090300_daily_checkins.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Remove na ordem inversa: trigger, função wrapper, tabela.
-- A policy de RLS cai junto da tabela (drop table). `if exists`.
-- =============================================================================

drop trigger if exists daily_checkins_gamification_insert on public.daily_checkins;

drop function if exists public.habit_checkin_after_insert();

drop table if exists public.daily_checkins;
