-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261105090100_plans_stripe_price_ids_seed.sql
-- APLICADO À MÃO. Zera os price IDs SOMENTE onde o valor é exatamente o semeado
-- (não toca em valores editados à mão).
-- LIMITAÇÃO: NÃO restaura price_monthly_cents, price_yearly_cents nem is_active
-- (o seed os sobrescreve; os valores semeados são os preços oficiais).
-- =============================================================================
update public.plans set stripe_price_id_monthly = null
where (tier = 'individual' and stripe_price_id_monthly = 'price_1UYFXIFVM32R4q9lSAvbZEEe')
   or (tier = 'personal'   and stripe_price_id_monthly = 'price_1UYFYqFVM32R4q9lOi2nj7d3')
   or (tier = 'assessoria' and stripe_price_id_monthly = 'price_1UYFcfFVM32R4q9lOZ5d4yoo');

update public.plans set stripe_price_id_yearly = null
where (tier = 'individual' and stripe_price_id_yearly = 'price_1UYFXIFVM32R4q9lQJR8i0yZ')
   or (tier = 'personal'   and stripe_price_id_yearly = 'price_1UYFa6FVM32R4q9l6qAc3WKe')
   or (tier = 'assessoria' and stripe_price_id_yearly = 'price_1UYFcfFVM32R4q9lkULnJvme');
