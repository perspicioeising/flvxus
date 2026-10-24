-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261022090100_profiles_master_affiliate.sql
-- APLICADO À MÃO quando for preciso reverter. NÃO roda no fluxo forward-only.
--
-- Ordem inversa: restaura handle_new_user para o corpo da gamificação
-- (20261021091000), remove o helper e as colunas. O backfill de is_tenant_master
-- é LOSSY (não há como distinguir um master backfillado de um natural); por isso
-- o rollback apenas remove as colunas (o dado some junto). O comment de LEGADO
-- em tenants.plan é informativo; removê-lo é opcional (deixamos o reset abaixo).
-- Tudo `if exists` para ser seguro em reexecução.
-- =============================================================================

-- Restaura handle_new_user ao corpo vivo ANTES da Fase 3 (gamificação,
-- 20261021091000): sem a guarda de filiado e sem is_tenant_master.
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

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email);

  perform public.seed_achievements_for_tenant(v_tenant_id);

  return new;
end;
$$;

drop function if exists public.app_is_master();

comment on column public.tenants.plan is null;

alter table public.profiles drop column if exists deactivated_at;
alter table public.profiles drop column if exists is_tenant_master;
