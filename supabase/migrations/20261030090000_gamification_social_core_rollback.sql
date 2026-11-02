-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261030090000_gamification_social_core.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
-- Ordem inversa: tabelas (members -> challenges -> friends) antes de coluna/enums.
-- =============================================================================

drop table if exists public.gamification_challenge_members;
drop table if exists public.gamification_challenges;
drop table if exists public.gamification_friends;

alter table public.profiles drop constraint if exists profiles_social_handle_format;
drop index if exists public.profiles_social_handle_lower_uidx;
alter table public.profiles drop column if exists social_handle;

drop type if exists public.challenge_member_result;
drop type if exists public.challenge_status;
drop type if exists public.challenge_kind;
drop type if exists public.friend_status;
