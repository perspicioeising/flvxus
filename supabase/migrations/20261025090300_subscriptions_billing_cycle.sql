-- =============================================================================
-- Flvxus v2 — Fase B (5/6): ciclo de cobranca em subscriptions
-- Contrato: requirements FR-B2 · depende de 20261022090500 (subscriptions).
--
-- ADITIVA e IDEMPOTENTE. Enum billing_cycle (monthly/yearly) + coluna em
-- subscriptions (default 'monthly' preserva as assinaturas existentes).
--
-- Rollback em 20261025090300_subscriptions_billing_cycle_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enum billing_cycle — guarda idempotente (NIT #6).
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'billing_cycle') then
    create type public.billing_cycle as enum ('monthly', 'yearly');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- subscriptions.billing_cycle — ciclo escolhido no checkout. Sincronizado pelo
-- webhook do Stripe junto com status/plan_id.
-- -----------------------------------------------------------------------------
alter table public.subscriptions
  add column if not exists billing_cycle public.billing_cycle
    not null default 'monthly';

comment on column public.subscriptions.billing_cycle is
  'Ciclo de cobranca da assinatura (monthly/yearly). Escolhido no checkout e '
  'espelhado pelo webhook do Stripe. Default monthly preserva assinaturas antigas.';
