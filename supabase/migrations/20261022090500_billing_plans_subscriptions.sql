-- =============================================================================
-- Flvxus v2 — Fase 3 (5/5): billing (plans + subscriptions) + RPC de limite
-- Contrato: design.md §5, §6f, §9 item 5 · requirements FR5/FR6/FR8 ·
-- design-review NIT #6 (guarda idempotente de enums), MED #8 (can_add_affiliate).
--
-- ADITIVA e IDEMPOTENTE. Depende da migration 1 (is_tenant_master/deactivated_at).
-- Rollback em 20261022090500_billing_plans_subscriptions_rollback.sql.
--
-- NÃO contém segredos: stripe_price_id entra como placeholder (null) e é
-- preenchido depois sem mudar código. Preços/limites comerciais são do usuário.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enums (guarda idempotente NIT #6: `create type` não aceita `if not exists`).
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_tier') then
    create type public.plan_tier as enum ('solo', 'team', 'gym');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum (
      'trialing', 'active', 'past_due', 'canceled',
      'incomplete', 'incomplete_expired', 'unpaid'
    );
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- plans — tiers por NÚMERO DE FILIADOS. NÃO duplica max_students (design-review
-- MED #4: limite de alunos continua em tenants.max_students).
--  max_affiliates: NULL = ILIMITADO; 0 = Solo (só o master).
--  stripe_price_id: NULL até o usuário preencher no painel Stripe (modo TEST).
-- -----------------------------------------------------------------------------
create table if not exists public.plans (
  id              uuid primary key default gen_random_uuid(),
  tier            public.plan_tier not null unique,
  name            text not null,              -- rótulo pt-BR exibível
  max_affiliates  integer,                    -- NULL = ilimitado; 0 = Solo
  stripe_price_id text,                        -- preenchido depois (sem mudar código)
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.plans.max_affiliates is
  'Limite de filiados do plano. NULL = ILIMITADO; 0 = Solo (só o master). '
  'TODO(comercial): definir os limites reais — valor editável por UPDATE.';
comment on column public.plans.stripe_price_id is
  'Price ID do Stripe (modo TEST). TODO(comercial): preencher no painel Stripe. '
  'Fonte de verdade do price por plano — editável em runtime sem mudar código.';

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- Seed de PLACEHOLDERS com TODO(comercial). Idempotente (on conflict do nothing).
-- Os números e price IDs são decisão comercial do usuário — preencher depois.
insert into public.plans (tier, name, max_affiliates, stripe_price_id)
values
  ('solo', 'Solo',     0,    null),  -- TODO(comercial): preço/price_id (0 filiados)
  ('team', 'Equipe',   5,    null),  -- TODO(comercial): definir X filiados e price_id
  ('gym',  'Academia', null, null)   -- TODO(comercial): ilimitado? ou Y; price_id
on conflict (tier) do nothing;

-- -----------------------------------------------------------------------------
-- subscriptions — assinatura POR TENANT (PK = tenant_id). Cobrança do MASTER.
-- stripe_subscription_id unique => idempotência do webhook. Status espelha o
-- Stripe 1:1. Escrita só via service_role (webhook); sem policy de write.
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  tenant_id              uuid primary key references public.tenants (id) on delete cascade,
  plan_id                uuid references public.plans (id) on delete restrict,
  status                 public.subscription_status not null default 'incomplete',
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);

comment on table public.subscriptions is
  'Assinatura por tenant (cobrança do master). Sincronizada pelo webhook do '
  'Stripe (service_role). customer.subscription.* é autoritativo para status/plan_id.';

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
--  plans: catálogo legível por qualquer autenticado (a UI de planos lista);
--         não contém segredo. Escrita só service_role (sem policy de write).
--  subscriptions: SELECT só o MASTER do tenant. Escrita só service_role (webhook).
-- -----------------------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists plans_select on public.plans;
create policy plans_select on public.plans
  for select to authenticated
  using (is_active = true);

drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_is_master());

-- -----------------------------------------------------------------------------
-- can_add_affiliate() — enforcement de limite no banco (ponto de verdade único,
-- reusável por action e testável). Regra (design §6f / MED #8):
--  * exige assinatura com direito (status in active/trialing) E plan_id resolvido;
--  * max_affiliates = 0 (Solo) => sempre false (used < 0 nunca é verdade);
--  * max_affiliates NULL (ilimitado) com plano ativo => true;
--  * sem assinatura ativa => false (0 filiados);
--  * senão => (filiados ativos) < max_affiliates.
-- Filiados ativos = role='trainer' and is_tenant_master=false and deactivated_at IS NULL.
-- -----------------------------------------------------------------------------
create or replace function public.can_add_affiliate()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with lim as (
    select pl.max_affiliates
    from public.subscriptions s
    join public.plans pl on pl.id = s.plan_id
    where s.tenant_id = public.app_tenant_id()
      and s.plan_id is not null
      and s.status in ('active', 'trialing')
  ),
  usados as (
    select count(*)::int as n
    from public.profiles p
    where p.tenant_id = public.app_tenant_id()
      and p.role = 'trainer'
      and p.is_tenant_master = false
      and p.deactivated_at is null
  )
  select case
    when (select max_affiliates from lim) is null
      and exists (select 1 from lim) then true      -- ilimitado (plano ativo)
    when not exists (select 1 from lim) then false   -- sem assinatura ativa => 0
    else (select n from usados) < (select max_affiliates from lim)
  end;
$$;

comment on function public.can_add_affiliate() is
  'TRUE se o tenant do master autenticado pode adicionar mais um filiado, '
  'conforme o plano vigente (status active/trialing, plan_id resolvido). '
  'Solo (0) sempre false; NULL = ilimitado. Chamada pela action convidarFiliado.';

grant execute on function public.can_add_affiliate() to authenticated;
