-- =============================================================================
-- Rollback de 20261104090000_workout_set_logs_exercise_id.sql.
-- Remove o índice e a coluna exercise_id de workout_set_logs. IDEMPOTENTE
-- (`drop index/column if exists`): aplicável 2x sem erro. Como a migration é
-- aditiva, o rollback é simples remoção — não há dado pré-existente a perder
-- (a coluna não existia antes). Não há RLS própria a reverter (a coluna só
-- herdava as policies da tabela).
-- =============================================================================

drop index if exists public.workout_set_logs_exercise_id_idx;

alter table public.workout_set_logs
  drop column if exists exercise_id;
