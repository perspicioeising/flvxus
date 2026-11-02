-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261030090100_gamification_social_rls.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- =============================================================================

drop policy if exists gamification_challenge_members_select on public.gamification_challenge_members;
drop policy if exists gamification_challenges_select on public.gamification_challenges;
drop policy if exists gamification_friends_select on public.gamification_friends;

alter table public.gamification_challenge_members disable row level security;
alter table public.gamification_challenges        disable row level security;
alter table public.gamification_friends           disable row level security;
