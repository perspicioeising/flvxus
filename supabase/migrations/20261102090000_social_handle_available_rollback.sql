-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261102090000_social_handle_available.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- =============================================================================

drop function if exists public.gamification_social_handle_available(text);
