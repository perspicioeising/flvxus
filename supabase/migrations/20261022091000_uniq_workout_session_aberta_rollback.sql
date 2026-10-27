-- =============================================================================
-- Rollback de 20261022091000_uniq_workout_session_aberta.sql
-- Remove apenas o índice único parcial. O saneamento de duplicatas abertas
-- (finished_at = now()) é intencional e irreversível por natureza (não dá para
-- "desfinalizar" sessões com segurança), então NÃO é desfeito aqui. IDEMPOTENTE.
-- =============================================================================
drop index if exists public.workout_sessions_aberta_uidx;
