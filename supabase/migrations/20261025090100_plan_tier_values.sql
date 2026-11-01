-- =============================================================================
-- Flvxus v2 — Fase B (3/6): novos valores do enum plan_tier
-- Contrato: requirements FR-B2 · depende de 20261022090500 (enum plan_tier).
--
-- ADITIVA e IDEMPOTENTE. Acrescenta os 3 tiers da Fase B ao enum existente.
-- IMPORTANTE: `ALTER TYPE ... ADD VALUE` NAO pode ser usado no MESMO arquivo em
-- que os novos labels sao referenciados (limitacao do Postgres). Por isso o USO
-- dos novos tiers (seed em plans) fica em 20261025090200, arquivo separado.
--
-- Rollback em 20261025090100_plan_tier_values_rollback.sql (no-op: ADD VALUE e
-- irreversivel sem recriar o tipo).
-- =============================================================================

-- Guarda idempotente por label: so adiciona se ainda nao existir no enum.
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'plan_tier' and e.enumlabel = 'individual'
  ) then
    alter type public.plan_tier add value 'individual';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'plan_tier' and e.enumlabel = 'personal'
  ) then
    alter type public.plan_tier add value 'personal';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'plan_tier' and e.enumlabel = 'assessoria'
  ) then
    alter type public.plan_tier add value 'assessoria';
  end if;
end $$;
