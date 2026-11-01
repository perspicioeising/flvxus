-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261025090050_handle_new_user_account_type.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Restaura a FORMA EXATA de handle_new_user de
-- 20261022090200_tenant_module_visibility.sql (sem account_type).
-- =============================================================================

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

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email, is_tenant_master)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email, true);

  -- Semeia o conjunto inicial de conquistas do novo tenant (PRESERVADO, HIGH #1).
  perform public.seed_achievements_for_tenant(v_tenant_id);

  -- Semeia as 5 linhas de visibilidade do novo tenant (LIBERADO por padrão).
  insert into public.tenant_module_visibility (tenant_id, module, is_open)
  select v_tenant_id, m.module, true
  from (select unnest(enum_range(null::public.visibility_module)) as module) m
  on conflict (tenant_id, module) do nothing;

  return new;
end;
$$;
