-- =============================================================================
-- Flvxus — índice para "última sessão do mesmo treino/divisão" (resumo pós-treino)
--
-- Aditivo e idempotente (create index if not exists). Acelera a busca da sessão
-- anterior comparável no resumo pós-treino do aluno, que filtra por
-- (plan_id, division) + finished_at not null e ordena por finished_at desc.
--
-- Sem DROP de dados, sem coluna/tabela nova, sem mudança em types/database.types.ts.
-- Aplicação MANUAL no Supabase do usuário (sem Docker); reexecutar não falha.
-- NÃO usar `create index concurrently` neste arquivo versionado — CONCURRENTLY
-- não roda dentro de bloco transacional. Para tabelas grandes em produção, o
-- CONCURRENTLY deve ser executado à mão, fora de transação (runbook).
-- =============================================================================
create index if not exists workout_sessions_plan_division_finished_idx
  on public.workout_sessions (plan_id, division, finished_at desc);

comment on index public.workout_sessions_plan_division_finished_idx is
  'Lookup da última sessão concluída do mesmo (plan_id, division) para comparação no resumo pós-treino.';
