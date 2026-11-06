-- =============================================================================
-- Flvxus v2 — Billing: trial de 14 dias controlado pelo app + estado de acesso
-- Depende de 20261022090500 (plans/subscriptions), 20261025090050
-- (handle_new_user com account_type) e 20261025090200 (plans.trial_days).
--
-- ADITIVA e IDEMPOTENTE. Aplicada À MÃO no SQL Editor do Supabase ANTES do
-- deploy do código novo (o app chama billing_tenant_state()).
-- Rollback: 20261105090000_billing_trial_core_rollback.sql
--
-- 1) colunas novas em subscriptions (trial_ends_at, stripe_event_at/kind);
-- 2) RPC billing_tenant_state() — estado de acesso legível por QUALQUER membro
--    do tenant (aluno vinculado/filiado) sem afrouxar a RLS de subscriptions;
-- 3) can_add_affiliate() ciente da expiração do trial;
-- 4) handle_new_user() cria o trial (14 dias, sem cartão) no cadastro;
-- 5) backfill idempotente das contas existentes.
-- =============================================================================

-- 1) Colunas ---------------------------------------------------------------
alter table public.subscriptions add column if not exists trial_ends_at timestamptz;
alter table public.subscriptions add column if not exists stripe_event_at timestamptz;
alter table public.subscriptions add column if not exists stripe_event_kind text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscriptions_stripe_event_kind_check'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_stripe_event_kind_check
      check (stripe_event_kind is null or stripe_event_kind in ('subscription', 'invoice'));
  end if;
end $$;

comment on column public.subscriptions.trial_ends_at is
  'Fim do trial controlado pelo app (sem cartão). Só vale quando não há stripe_subscription_id.';
comment on column public.subscriptions.stripe_event_at is
  'event.created do último evento de status do Stripe aplicado (ordenação do webhook).';
comment on column public.subscriptions.stripe_event_kind is
  'Família do último evento aplicado (subscription|invoice); desempate do webhook.';

-- 2) RPC de leitura do estado de acesso do tenant ----------------------------
create or replace function public.billing_tenant_state()
returns table (
  status public.subscription_status,
  tier public.plan_tier,
  billing_cycle public.billing_cycle,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  has_stripe_subscription boolean,
  has_stripe_customer boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.status, p.tier, s.billing_cycle, s.trial_ends_at, s.current_period_end,
         s.cancel_at_period_end,
         s.stripe_subscription_id is not null,
         s.stripe_customer_id is not null
  from public.subscriptions s
  left join public.plans p on p.id = s.plan_id
  where s.tenant_id = public.app_tenant_id();
$$;

revoke all on function public.billing_tenant_state() from public;
grant execute on function public.billing_tenant_state() to authenticated;

-- 3) can_add_affiliate(): trial expirado não dá direito ---------------------
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
      and (
        s.status = 'active'
        or (
          s.status = 'trialing'
          and (s.stripe_subscription_id is not null or s.trial_ends_at > now())
        )
      )
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
    when not exists (select 1 from lim) then false   -- sem direito => 0
    else (select n from usados) < (select max_affiliates from lim)
  end;
$$;

grant execute on function public.can_add_affiliate() to authenticated;

-- 4) handle_new_user(): cria o trial no cadastro -----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_full_name text;
  v_role text;
  v_account_type text;
begin
  v_role := new.raw_user_meta_data ->> 'role';
  v_account_type := coalesce(new.raw_user_meta_data ->> 'account_type', 'professional');

  -- Filiado convidado pelo MASTER: NÃO cria tenant nem profile aqui (MED #5).
  if coalesce(new.raw_user_meta_data ->> 'is_affiliate', '') = 'true' then
    return new;
  end if;

  -- Aluno convidado pelo professor: NÃO cria tenant nem profile aqui.
  if v_role = 'student' then
    return new;
  end if;

  -- Idempotência: profile já existe (retry/corrida) => não duplica.
  if exists (select 1 from public.profiles p where p.user_id = new.id) then
    return new;
  end if;

  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);

  -- Cadastro público de PROFESSOR: cria o tenant (owner) e o profile MASTER.
  insert into public.tenants (owner_id, name)
  values (new.id, coalesce(v_full_name, 'Meu negócio'))
  returning id into v_tenant_id;

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email, is_tenant_master, account_type)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email, true, v_account_type::public.account_type);

  -- Semeia o conjunto inicial de conquistas do novo tenant (PRESERVADO, HIGH #1).
  perform public.seed_achievements_for_tenant(v_tenant_id);

  -- Semeia as 5 linhas de visibilidade do novo tenant (LIBERADO por padrão).
  insert into public.tenant_module_visibility (tenant_id, module, is_open)
  select v_tenant_id, m.module, true
  from (select unnest(enum_range(null::public.visibility_module)) as module) m
  on conflict (tenant_id, module) do nothing;

  -- Trial de 14 dias (sem cartão). Nunca derruba o cadastro: em caso de falha
  -- a conta nasce sem trial (recuperável rodando o backfill desta migration).
  begin
    insert into public.subscriptions (tenant_id, plan_id, status, trial_ends_at)
    select v_tenant_id, p.id, 'trialing', now() + make_interval(days => coalesce(p.trial_days, 14))
    from public.plans p
    where p.tier = (case when v_account_type = 'self_managed' then 'individual' else 'personal' end)::public.plan_tier
    on conflict (tenant_id) do nothing;
  exception when others then
    raise warning 'handle_new_user: falha ao criar trial do tenant %: %', v_tenant_id, sqlerrm;
  end;

  return new;
end;
$$;

-- 5) Backfill idempotente ----------------------------------------------------
-- (a) tenants com master e SEM linha de assinatura => trial de 14 dias a partir de agora.
insert into public.subscriptions (tenant_id, plan_id, status, trial_ends_at)
select pr.tenant_id, p.id, 'trialing', now() + make_interval(days => coalesce(p.trial_days, 14))
from public.profiles pr
join public.plans p
  on p.tier = (case when pr.account_type = 'self_managed' then 'individual' else 'personal' end)::public.plan_tier
where pr.is_tenant_master = true
  and pr.role = 'trainer'
  and not exists (select 1 from public.subscriptions s where s.tenant_id = pr.tenant_id)
on conflict (tenant_id) do nothing;

-- (b) linhas sem assinatura real e sem trial_ends_at, em 'incomplete' (só-customer)
--     ou 'trialing' => trial de 14 dias a partir de agora. Nunca toca em
--     assinaturas reais (stripe_subscription_id) nem active/past_due/canceled.
update public.subscriptions s
set status = 'trialing',
    plan_id = p.id,
    trial_ends_at = now() + make_interval(days => coalesce(p.trial_days, 14))
from public.profiles pr, public.plans p
where pr.tenant_id = s.tenant_id
  and pr.is_tenant_master = true
  and pr.role = 'trainer'
  and p.tier = (case when pr.account_type = 'self_managed' then 'individual' else 'personal' end)::public.plan_tier
  and s.stripe_subscription_id is null
  and s.trial_ends_at is null
  and s.status in ('incomplete', 'trialing');
