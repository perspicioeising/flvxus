-- =============================================================================
-- Flvxus v2 — Fase B (4/6): colunas de billing em plans + seed dos novos tiers
-- Contrato: requirements FR-B2.3 · depende de 20261025090100 (labels do enum).
--
-- ADITIVA e IDEMPOTENTE. Acrescenta colunas de preco/franquia/trial a plans,
-- desativa os tiers legados (solo/team/gym) e semeia os 3 tiers da Fase B.
-- Os novos labels do enum plan_tier (individual/personal/assessoria) ja existem
-- (migration anterior, arquivo separado) — aqui e permitido usa-los.
--
-- Rollback em 20261025090200_plans_billing_fase_b_rollback.sql.
--
-- Valores (FR-B2.3), cents BRL:
--   individual  1990/11880   ai 50    max_affiliates 0
--   personal   12990/118800  ai 300   max_affiliates 5
--   assessoria 24990/238800  ai NULL   max_affiliates NULL (ilimitado)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Colunas novas (todas aditivas e idempotentes).
-- -----------------------------------------------------------------------------
alter table public.plans add column if not exists price_monthly_cents integer;
alter table public.plans add column if not exists price_yearly_cents integer;
alter table public.plans add column if not exists stripe_price_id_monthly text;
alter table public.plans add column if not exists stripe_price_id_yearly text;
alter table public.plans add column if not exists ai_quota_monthly integer;
alter table public.plans add column if not exists trial_days integer not null default 14;

comment on column public.plans.price_monthly_cents is
  'Preco mensal em centavos (BRL). TODO(comercial): confirmar valores finais.';
comment on column public.plans.price_yearly_cents is
  'Preco anual em centavos (BRL). TODO(comercial): confirmar valores finais.';
comment on column public.plans.stripe_price_id_monthly is
  'Price ID do Stripe (ciclo mensal, modo TEST). TODO(comercial): preencher no painel.';
comment on column public.plans.stripe_price_id_yearly is
  'Price ID do Stripe (ciclo anual, modo TEST). TODO(comercial): preencher no painel.';
comment on column public.plans.ai_quota_monthly is
  'Franquia mensal de geracoes de IA. NULL = ilimitado. TODO(comercial): confirmar.';
comment on column public.plans.trial_days is
  'Dias de trial padrao do plano (trial_period_days no checkout). Default 14.';

-- -----------------------------------------------------------------------------
-- Desativa os tiers legados (Fase 3) — nao sao mais ofertados na Fase B. Linhas
-- preservadas (FKs de subscriptions existentes), apenas is_active=false.
-- -----------------------------------------------------------------------------
update public.plans set is_active = false where tier in ('solo', 'team', 'gym');

-- -----------------------------------------------------------------------------
-- Seed dos 3 tiers da Fase B. Idempotente (on conflict (tier) do nothing).
-- -----------------------------------------------------------------------------
insert into public.plans (
  tier, name, max_affiliates, price_monthly_cents, price_yearly_cents,
  ai_quota_monthly, is_active
)
values
  ('individual', 'Individual', 0,    1990,  11880,  50,   true),  -- TODO(comercial): valores finais
  ('personal',   'Personal',   5,    12990, 118800, 300,  true),  -- TODO(comercial): valores finais
  ('assessoria', 'Assessoria', null, 24990, 238800, null, true)   -- TODO(comercial): valores finais
on conflict (tier) do nothing;
