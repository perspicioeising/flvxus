-- =============================================================================
-- Flvxus v2 — Fase B (1/6): tipo de conta (enum + coluna em profiles + guarda)
-- Contrato: requirements FR-B1 · design-review (billing aluno autonomo).
--
-- ADITIVA e IDEMPOTENTE. Depende de 20261022090100 (profiles.is_tenant_master).
-- Rollback em 20261025090000_account_type_rollback.sql.
--
-- account_type:
--   'professional' => conta normal (personal B2B que gere filiados/alunos).
--   'self_managed' => aluno autonomo: gere a propria rotina, SEM alunos sob si.
-- A guarda de negocio impede que um tenant self_managed ganhe filiados/alunos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enum account_type — guarda idempotente (NIT #6): `create type` nao aceita
-- `if not exists`, entao so cria se ainda nao existir.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type public.account_type as enum ('professional', 'self_managed');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- profiles.account_type — default 'professional' preserva o comportamento atual
-- de todos os profiles existentes (B2B). Preenchido no cadastro do master.
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists account_type public.account_type
    not null default 'professional';

comment on column public.profiles.account_type is
  'Tipo de conta do profile. professional = personal B2B (gere filiados/alunos); '
  'self_managed = aluno autonomo (gere so a propria rotina, sem alunos sob si). '
  'O master do tenant determina o tipo; a guarda impede alunos em tenant self_managed.';

-- -----------------------------------------------------------------------------
-- Guarda de negocio: um tenant cujo MASTER e self_managed nao pode receber
-- alunos (role='student'). Trigger BEFORE INSERT em profiles (security definer,
-- search_path vazio, tudo public.-qualificado). Levanta excecao quando o novo
-- profile e aluno e o master do tenant tem account_type='self_managed'.
-- -----------------------------------------------------------------------------
create or replace function public.enforce_self_managed_no_students()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'student' then
    if exists (
      select 1
      from public.profiles m
      where m.tenant_id = new.tenant_id
        and m.is_tenant_master = true
        and m.account_type = 'self_managed'
    ) then
      raise exception
        'Tenant self_managed nao pode ter alunos (account_type do master e self_managed).';
    end if;
  end if;
  return new;
end;
$$;

comment on function public.enforce_self_managed_no_students() is
  'BEFORE INSERT em profiles: bloqueia criar aluno (role=student) quando o master '
  'do tenant tem account_type=self_managed. Enforcement no backend (NFR-3).';

drop trigger if exists profiles_enforce_self_managed on public.profiles;
create trigger profiles_enforce_self_managed
  before insert on public.profiles
  for each row execute function public.enforce_self_managed_no_students();
