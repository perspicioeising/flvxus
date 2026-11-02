-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261026090000_gamification_core.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Ordem inversa de aplicação: reverter PRIMEIRO 090400..090100 e SÓ ENTÃO este,
-- pois as funções/triggers de 090100 referenciam estas tabelas. Dropar as
-- tabelas remove índices/policies junto. `if exists`.
-- =============================================================================

drop table if exists public.gamification_events;
drop table if exists public.gamification_profiles;
drop table if exists public.gamification_seasons;
drop function if exists public.gamification_sp_date(timestamptz);
