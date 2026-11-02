-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261025090000_account_type.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Ordem inversa: trigger, function, coluna, tipo. Tudo `if exists`.
-- =============================================================================

drop trigger if exists profiles_enforce_self_managed on public.profiles;

drop function if exists public.enforce_self_managed_no_students();

alter table public.profiles drop column if exists account_type;

drop type if exists public.account_type;
