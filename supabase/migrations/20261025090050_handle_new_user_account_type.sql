-- =============================================================================
-- Flvxus v2 — Fase B (2/6): handle_new_user propaga account_type do master
-- Contrato: requirements FR-B1 · depende de 20261025090000 (account_type).
--
-- ADITIVA e IDEMPOTENTE (create or replace). Parte da FORMA EXATA de
-- 20261022090200_tenant_module_visibility.sql, acrescentando SO a leitura de
-- v_account_type (default 'professional') e o ::public.account_type no INSERT do
-- profile MASTER. Preserva verbatim a ordem das guardas (filiado -> aluno ->
-- idempotencia -> master) e os seeds (seed_achievements_for_tenant e
-- tenant_module_visibility). Tudo public.-qualificado.
--
-- Rollback em 20261025090050_handle_new_user_account_type_rollback.sql, que
-- restaura a forma EXATA de 20261022090200.
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

  return new;
end;
$$;
