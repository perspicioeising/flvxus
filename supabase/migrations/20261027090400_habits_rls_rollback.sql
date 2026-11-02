-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261027090400_habits_rls.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Dropa as policies e desliga o RLS das 4 tabelas (voltam ao estado sem RLS;
-- o drop das tabelas em si fica nos rollbacks de 090100/090200/090300).
-- `if exists`.
-- =============================================================================

drop policy if exists water_intake_logs_select on public.water_intake_logs;
drop policy if exists water_intake_logs_insert on public.water_intake_logs;
drop policy if exists water_intake_logs_delete on public.water_intake_logs;

drop policy if exists daily_checkins_select on public.daily_checkins;
drop policy if exists daily_checkins_insert on public.daily_checkins;
drop policy if exists daily_checkins_delete on public.daily_checkins;

drop policy if exists diet_meal_completions_select on public.diet_meal_completions;
drop policy if exists diet_meal_completions_insert on public.diet_meal_completions;
drop policy if exists diet_meal_completions_delete on public.diet_meal_completions;

drop policy if exists water_goals_select on public.water_goals;
drop policy if exists water_goals_insert on public.water_goals;
drop policy if exists water_goals_update on public.water_goals;

alter table if exists public.water_intake_logs    disable row level security;
alter table if exists public.daily_checkins        disable row level security;
alter table if exists public.diet_meal_completions disable row level security;
alter table if exists public.water_goals           disable row level security;
