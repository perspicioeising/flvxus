-- =============================================================================
-- Flvxus v2 — Billing: seed dos 6 price IDs do Stripe (3 tiers x 2 ciclos)
-- Depende de 20261025090200 (colunas de preço/ciclo em plans).
--
-- IDEMPOTENTE. `plans` tem UMA linha por tier; o ciclo vive nas colunas
-- stripe_price_id_monthly / stripe_price_id_yearly. Price IDs NÃO são segredo.
-- Não sobrescreve max_affiliates / ai_quota_monthly / trial_days de linhas
-- existentes. Rollback: 20261105090100_plans_stripe_price_ids_seed_rollback.sql
--
-- ATENÇÃO (manual): conferir no painel da Stripe que o price anual da Assessoria
-- (...kULnJvme) tem intervalo `year` (o painel o exibiu como "Por mês").
-- =============================================================================
insert into public.plans (
  tier, name, max_affiliates, ai_quota_monthly,
  price_monthly_cents, price_yearly_cents,
  stripe_price_id_monthly, stripe_price_id_yearly, is_active
)
values
  ('individual', 'Individual', 0,    50,   1990,  11880,  'price_1UYFXIFVM32R4q9lSAvbZEEe', 'price_1UYFXIFVM32R4q9lQJR8i0yZ', true),
  ('personal',   'Personal',   5,    300,  12990, 118800, 'price_1UYFYqFVM32R4q9lOi2nj7d3', 'price_1UYFa6FVM32R4q9l6qAc3WKe', true),
  ('assessoria', 'Assessoria', null, null, 24990, 238800, 'price_1UYFcfFVM32R4q9lOZ5d4yoo', 'price_1UYFcfFVM32R4q9lkULnJvme', true)
on conflict (tier) do update set
  stripe_price_id_monthly = excluded.stripe_price_id_monthly,
  stripe_price_id_yearly  = excluded.stripe_price_id_yearly,
  price_monthly_cents     = excluded.price_monthly_cents,
  price_yearly_cents      = excluded.price_yearly_cents,
  is_active               = true;
