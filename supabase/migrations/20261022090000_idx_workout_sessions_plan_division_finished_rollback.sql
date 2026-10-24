-- Rollback do índice de comparação de sessões (resumo pós-treino).
-- Idempotente: drop if exists não falha se o índice não existir.
drop index if exists public.workout_sessions_plan_division_finished_idx;
