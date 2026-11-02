-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261026090200_gamification_rls.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Dropa as policies e desliga o RLS das 4 tabelas (voltam ao estado sem RLS;
-- o drop das tabelas em si fica nos rollbacks de 090000/090100). `if exists`.
-- =============================================================================

drop policy if exists gamification_profiles_select    on public.gamification_profiles;
drop policy if exists gamification_events_select       on public.gamification_events;
drop policy if exists gamification_seasons_select      on public.gamification_seasons;
drop policy if exists gamification_event_types_select  on public.gamification_event_types;

alter table if exists public.gamification_profiles    disable row level security;
alter table if exists public.gamification_events       disable row level security;
alter table if exists public.gamification_seasons      disable row level security;
alter table if exists public.gamification_event_types  disable row level security;
