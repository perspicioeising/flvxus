-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261025090200_plans_billing_fase_b.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Ordem inversa: remove as linhas dos novos tiers, reativa os legados e dropa
-- as colunas novas. Tudo `if exists`.
-- =============================================================================

delete from public.plans where tier in ('individual', 'personal', 'assessoria');

update public.plans set is_active = true where tier in ('solo', 'team', 'gym');

alter table public.plans drop column if exists trial_days;
alter table public.plans drop column if exists ai_quota_monthly;
alter table public.plans drop column if exists stripe_price_id_yearly;
alter table public.plans drop column if exists stripe_price_id_monthly;
alter table public.plans drop column if exists price_yearly_cents;
alter table public.plans drop column if exists price_monthly_cents;
