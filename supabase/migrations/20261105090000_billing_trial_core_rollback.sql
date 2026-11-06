-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261105090000_billing_trial_core.sql
-- APLICADO À MÃO. Restaura as funções às formas anteriores ANTES de remover
-- colunas/RPC. Não remove linhas de subscriptions criadas pelo backfill
-- (válidas no modelo antigo).
-- =============================================================================

-- handle_new_user: forma de 20261025090050_handle_new_user_account_type.sql
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
  if coalesce(new.raw_user_meta_data ->> 'is_affiliate', '') = 'true' then
    return new;
  end if;
  if v_role = 'student' then
    return new;
  end if;
  if exists (select 1 from public.profiles p where p.user_id = new.id) then
    return new;
  end if;
  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);
  insert into public.tenants (owner_id, name)
  values (new.id, coalesce(v_full_name, 'Meu negócio'))
  returning id into v_tenant_id;
  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email, is_tenant_master, account_type)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email, true, v_account_type::public.account_type);
  perform public.seed_achievements_for_tenant(v_tenant_id);
  insert into public.tenant_module_visibility (tenant_id, module, is_open)
  select v_tenant_id, m.module, true
  from (select unnest(enum_range(null::public.visibility_module)) as module) m
  on conflict (tenant_id, module) do nothing;
  return new;
end;
$$;

-- can_add_affiliate: forma de 20261022090500_billing_plans_subscriptions.sql
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
      and exists (select 1 from lim) then true
    when not exists (select 1 from lim) then false
    else (select n from usados) < (select max_affiliates from lim)
  end;
$$;

grant execute on function public.can_add_affiliate() to authenticated;

drop function if exists public.billing_tenant_state();

alter table public.subscriptions drop constraint if exists subscriptions_stripe_event_kind_check;
alter table public.subscriptions drop column if exists stripe_event_kind;
alter table public.subscriptions drop column if exists stripe_event_at;
alter table public.subscriptions drop column if exists trial_ends_at;
