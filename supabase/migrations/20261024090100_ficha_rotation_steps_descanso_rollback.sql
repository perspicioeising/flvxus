-- =============================================================================
-- Rollback de 20261024090100_ficha_rotation_steps_descanso.sql
-- Remove o marcador de descanso e a coluna de rotação. IDEMPOTENTE.
-- As policies caem junto com a tabela (drop table).
-- =============================================================================

drop table if exists public.workout_plan_rest_completions;

alter table public.workout_plans
  drop column if exists rotation_steps;
