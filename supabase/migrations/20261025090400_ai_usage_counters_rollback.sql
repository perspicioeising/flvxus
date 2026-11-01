-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261025090400_ai_usage_counters.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Dropar a tabela remove a policy junto. `if exists`.
-- =============================================================================

drop table if exists public.ai_usage_counters;
