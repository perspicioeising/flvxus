-- =============================================================================
-- Flvxus v2 — Fase 3 (2/5): visibilidade por módulo (enum + tabela + RLS) +
-- handle_new_user final (semeia a visibilidade do novo tenant)
-- Contrato: design.md §3, §9 item 2 · requirements FR3 · design-review HIGH #1,
-- MED #2, MED #5, NIT #6.
--
-- ADITIVA e IDEMPOTENTE. Depende da migration 1 (app_is_master, is_tenant_master).
-- Rollback em 20261022090200_tenant_module_visibility_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enum visibility_module — módulos governados pela visibilidade por tenant.
-- Guarda idempotente (NIT #6): `create type` não aceita `if not exists`, então
-- envolvemos em um DO que só cria se o tipo não existir (reaplicar não falha).
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visibility_module') then
    create type public.visibility_module as enum (
      'students', 'workouts', 'assessments', 'diets', 'exercises'
    );
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- tenant_module_visibility — config por (tenant, módulo).
--  is_open = TRUE  => LIBERADO: todos os personais do tenant veem TODOS os
--                     registros do módulo (comportamento atual / visão geral).
--  is_open = FALSE => BLOQUEADO: cada filiado vê APENAS os registros que ele
--                     mesmo cadastrou. O MASTER sempre vê tudo (RLS condicional).
-- Default TRUE preserva o comportamento atual para módulos não configurados.
-- -----------------------------------------------------------------------------
create table if not exists public.tenant_module_visibility (
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  module     public.visibility_module not null,
  is_open    boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, module)
);

comment on table public.tenant_module_visibility is
  'Config de visibilidade por (tenant, módulo). is_open=true => visão geral do '
  'tenant; is_open=false => filiado vê só o que ele mesmo cadastrou. Master '
  'sempre vê tudo. Só o master lê/escreve (RLS abaixo).';

-- Trigger de updated_at (função genérica existente).
drop trigger if exists tenant_module_visibility_set_updated_at
  on public.tenant_module_visibility;
create trigger tenant_module_visibility_set_updated_at
  before update on public.tenant_module_visibility
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Seed/backfill: 5 linhas (is_open=true) por tenant existente. Idempotente via
-- on conflict do nothing. enum_range depende do tipo existir — já criado acima.
-- -----------------------------------------------------------------------------
insert into public.tenant_module_visibility (tenant_id, module, is_open)
select t.id, m.module, true
from public.tenants t
cross join (
  select unnest(enum_range(null::public.visibility_module)) as module
) m
on conflict (tenant_id, module) do nothing;

-- -----------------------------------------------------------------------------
-- app_module_is_open(module) — helper RLS: TRUE se o módulo está LIBERADO no
-- tenant do usuário. Ausência de config => TRUE (comportamento atual). Mesma
-- forma dos demais helpers (stable, security definer, search_path vazio).
-- -----------------------------------------------------------------------------
create or replace function public.app_module_is_open(p_module public.visibility_module)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select v.is_open
       from public.tenant_module_visibility v
      where v.tenant_id = public.app_tenant_id()
        and v.module = p_module),
    true  -- ausência de config => comportamento atual (visão geral)
  );
$$;

comment on function public.app_module_is_open(public.visibility_module) is
  'TRUE se o módulo está LIBERADO (visão geral) no tenant do usuário. Ausência '
  'de config => TRUE. Usada pela RLS condicional por módulo (Fase 3).';

-- -----------------------------------------------------------------------------
-- RLS da tabela de config: só o MASTER do tenant lê/escreve. O filiado nem vê.
-- INSERT só via trigger/service_role (seed) — sem policy de insert para
-- authenticated.
-- -----------------------------------------------------------------------------
alter table public.tenant_module_visibility enable row level security;

drop policy if exists tmv_select on public.tenant_module_visibility;
create policy tmv_select on public.tenant_module_visibility
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_is_master());

drop policy if exists tmv_update on public.tenant_module_visibility;
create policy tmv_update on public.tenant_module_visibility
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_is_master())
  with check (tenant_id = public.app_tenant_id() and public.app_is_master());

-- -----------------------------------------------------------------------------
-- handle_new_user() — FORMA FINAL (design-review HIGH #1 + MED #2 + MED #5).
-- Agora que tenant_module_visibility existe, acrescentamos a semeadura das 5
-- linhas de visibilidade do novo tenant, PRESERVANDO: as guardas (filiado ANTES
-- de criar tenant, depois aluno, depois idempotência), o insert do profile
-- MASTER e a chamada seed_achievements_for_tenant. Este é o corpo COMPLETO e
-- definitivo da função (não fragmento).
-- -----------------------------------------------------------------------------
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
