-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261030090200_gamification_social_functions.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- =============================================================================

drop function if exists public.gamification_friends_leaderboard(text, text);
drop function if exists public.gamification_list_friends();
drop function if exists public.gamification_respond_friend_request(uuid, text);
drop function if exists public.gamification_friend_request_by_handle(text);
