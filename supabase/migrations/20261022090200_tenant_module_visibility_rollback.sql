-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261022090200_tenant_module_visibility.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Ordem inversa: restaura handle_new_user à forma da migration 1 (com guarda de
-- filiado e master, SEM o seed de visibilidade), remove policies, helper,
-- trigger, tabela e enum. Tudo `if exists`. Após este rollback, a migration 1
-- continua válida.
-- =============================================================================

-- Restaura handle_new_user à forma da migration 1 (sem seed de visibilidade).
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
begin
  v_role := new.raw_user_meta_data ->> 'role';

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

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email, is_tenant_master)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email, true);

  perform public.seed_achievements_for_tenant(v_tenant_id);

  return new;
end;
$$;

drop policy if exists tmv_update on public.tenant_module_visibility;
drop policy if exists tmv_select on public.tenant_module_visibility;

drop function if exists public.app_module_is_open(public.visibility_module);

drop trigger if exists tenant_module_visibility_set_updated_at
  on public.tenant_module_visibility;

drop table if exists public.tenant_module_visibility;

drop type if exists public.visibility_module;
