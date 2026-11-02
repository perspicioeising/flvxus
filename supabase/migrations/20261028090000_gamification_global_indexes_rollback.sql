-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261028090000_gamification_global_indexes.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- =============================================================================

drop index if exists public.gamification_events_season_points_idx;
drop index if exists public.gamification_events_occurred_on_points_idx;
