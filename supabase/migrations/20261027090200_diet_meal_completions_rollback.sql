-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261027090200_diet_meal_completions.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Remove na ordem inversa: triggers, função wrapper, função de sync, tabela.
-- As policies de RLS caem junto da tabela (drop table). `if exists`.
-- =============================================================================

drop trigger if exists diet_meal_completions_gamification_insert on public.diet_meal_completions;
drop trigger if exists diet_meal_completions_gamification_delete on public.diet_meal_completions;

drop function if exists public.habit_diet_after_change();
drop function if exists public.gamification_sync_diet(uuid, uuid, date);

drop table if exists public.diet_meal_completions;
