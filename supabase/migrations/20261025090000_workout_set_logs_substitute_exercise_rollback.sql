-- =============================================================================
-- Rollback de 20261025090000_workout_set_logs_substitute_exercise.sql (FEAT-002).
-- Remove a coluna substitute_exercise_id de workout_set_logs. IDEMPOTENTE
-- (`drop column if exists`): aplicável 2x sem erro. Não há RLS própria a
-- reverter (a coluna só herdava as policies da tabela).
-- =============================================================================

alter table public.workout_set_logs
  drop column if exists substitute_exercise_id;
