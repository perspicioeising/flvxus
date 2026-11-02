-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261026090300_gamification_leaderboard.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- =============================================================================

drop function if exists public.gamification_tenant_leaderboard(text);
