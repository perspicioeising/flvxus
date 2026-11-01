-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261025090300_subscriptions_billing_cycle.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Ordem inversa: coluna, depois tipo. Tudo `if exists`.
-- =============================================================================

alter table public.subscriptions drop column if exists billing_cycle;

drop type if exists public.billing_cycle;
