-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261022090500_billing_plans_subscriptions.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Ordem inversa: RPC, policies, triggers, tabelas (subscriptions antes de plans
-- por FK), enums. Tudo `if exists`.
-- =============================================================================

drop function if exists public.can_add_affiliate();

drop policy if exists subscriptions_select on public.subscriptions;
drop policy if exists plans_select on public.plans;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
drop trigger if exists plans_set_updated_at on public.plans;

drop table if exists public.subscriptions;
drop table if exists public.plans;

drop type if exists public.subscription_status;
drop type if exists public.plan_tier;
