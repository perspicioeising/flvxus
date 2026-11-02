-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261028090100_gamification_global_leaderboard.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- =============================================================================

drop function if exists public.gamification_global_leaderboard(text, text, integer);
