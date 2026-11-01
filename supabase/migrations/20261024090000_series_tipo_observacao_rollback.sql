-- =============================================================================
-- ROLLBACK de 20261024090000_series_tipo_observacao.sql
-- Remove as tabelas de séries detalhadas e o enum set_kind. As policies caem
-- junto com as tabelas. Idempotente (if exists).
-- =============================================================================

drop table if exists public.workout_plan_item_sets;
drop table if exists public.workout_exercise_sets;
drop type if exists public.set_kind;
