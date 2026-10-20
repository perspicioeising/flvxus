-- =============================================================================
-- Flvxus v2 — Migration (b): núcleo (tenants, profiles) + funções + triggers
-- Contrato: docs/architecture.md §5.1, §5.3, §6.2, §6.3 · ADR 0004
-- Decisões do plano: profiles.user_id é PK e identidade (= auth.uid()); FKs de
-- negócio referenciam profiles(user_id). Funções RLS: app_tenant_id()/app_role().
-- =============================================================================

-- -----------------------------------------------------------------------------
-- tenants — conta do personal (multi-tenant: 1 tenant por personal)
-- -----------------------------------------------------------------------------
create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  plan          text not null default 'free',
  max_students  integer not null default 50,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index tenants_owner_id_idx on public.tenants (owner_id);

-- -----------------------------------------------------------------------------
-- profiles — 1:1 com auth.users. user_id é a identidade (= auth.uid()).
-- trainer_id (nulo para trainer) aponta para o professor dono do aluno.
-- -----------------------------------------------------------------------------
create table public.profiles (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  role              public.user_role not null,
  trainer_id        uuid references public.profiles (user_id) on delete set null,
  full_name         text,
  email             text,
  phone             text,
  avatar_url        text,
  -- dados de aluno (nulos para trainer)
  birth_date        date,
  gender            text,
  height_cm         numeric(5, 2),
  status            public.student_status,
  experience_level  public.experience_level,
  goal              public.goal_type,
  -- gamificação
  total_points      integer not null default 0,
  last_workout_date date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index profiles_tenant_id_idx  on public.profiles (tenant_id);
create index profiles_trainer_id_idx on public.profiles (trainer_id);
create index profiles_role_idx       on public.profiles (role);

comment on column public.profiles.trainer_id is
  'Professor dono do aluno. NULL quando role = trainer.';

-- -----------------------------------------------------------------------------
-- set_updated_at() — trigger genérico de updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_set_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- app_tenant_id() / app_role() — base do RLS (§5.3).
-- SECURITY DEFINER para ler profiles sem recursão de RLS. search_path fixo e
-- vazio evita sequestro de resolução de nome (schema-qualificar tudo).
-- -----------------------------------------------------------------------------
create or replace function public.app_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.tenant_id from public.profiles p where p.user_id = auth.uid();
$$;

create or replace function public.app_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.user_id = auth.uid();
$$;

comment on function public.app_tenant_id() is 'Tenant do usuário autenticado (base do RLS).';
comment on function public.app_role() is 'Papel do usuário autenticado (base do RLS).';

-- -----------------------------------------------------------------------------
-- handle_new_user() — no sign-up público (professor), cria tenant + profile.
-- Corrige a v1: todo professor nasce com um tenant dedicado e consistente.
-- Metadados opcionais vêm de raw_user_meta_data (full_name).
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
begin
  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);

  -- Cria o tenant do novo personal (o primeiro usuário é o owner).
  insert into public.tenants (owner_id, name)
  values (new.id, coalesce(v_full_name, 'Meu negócio'))
  returning id into v_tenant_id;

  -- Cria o profile como trainer, vinculado ao tenant recém-criado.
  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email);

  return new;
end;
$$;

-- Dispara após inserção em auth.users (cadastro público de professor).
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
