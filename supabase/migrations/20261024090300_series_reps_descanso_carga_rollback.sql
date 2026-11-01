-- =============================================================================
-- ROLLBACK de 20261024090300_series_reps_descanso_carga.sql
--
-- Remove apenas a coluna rest_seconds de cada tabela de série (idempotente via
-- `drop column if exists`). O backfill de target_reps/target_load — colunas
-- PRÉ-EXISTENTES (criadas em 20261024090000) — NÃO é revertido: foi uma cópia
-- não destrutiva e idempotente (coalesce só completou NULLs), sem como
-- distinguir o valor herdado de um valor digitado depois.
-- =============================================================================

alter table public.workout_plan_item_sets drop column if exists rest_seconds;
alter table public.workout_exercise_sets drop column if exists rest_seconds;
