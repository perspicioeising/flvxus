-- =============================================================================
-- Flvxus — Agenda Fase 1 (core): appointments evoluida + RLS + timezone + água.
-- Design: .agents/tasks/agenda-fase1/design.md §4, §5.1 (+ §17).
-- APLICADO À MÃO no painel do Supabase. REQUER 20261107090000 já commitada
-- (valor 'agenda' do enum visibility_module).
-- ADITIVA e IDEMPOTENTE: add column if not exists, drop ... if exists + add,
-- on conflict do nothing, create or replace.
-- Rollback (DESTRUTIVO, ver cabeçalho): 20261107090100_agenda_core_rollback.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Enum do tipo de compromisso.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'appointment_kind'
  ) then
    create type public.appointment_kind as enum
      ('in_person', 'online', 'assessment', 'personal', 'block');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2) Função de validação de fuso (nome IANA). Erra se o nome for inválido.
--    Sem subconsulta em CHECK: validação por trigger.
-- -----------------------------------------------------------------------------
create or replace function public.profiles_validate_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform now() at time zone new.timezone;
  return new;
end;
$$;

create or replace function public.appointments_validate_tz()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform now() at time zone new.tz;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) appointments — colunas novas (todas nullable/com default nesta etapa).
-- -----------------------------------------------------------------------------
alter table public.appointments
  add column if not exists owner_id        uuid references public.profiles (user_id) on delete cascade,
  add column if not exists kind            public.appointment_kind,
  add column if not exists title           text,
  add column if not exists location        text,
  add column if not exists tz              text not null default 'America/Sao_Paulo',
  add column if not exists recur_freq      text,
  add column if not exists recur_weekdays  smallint[],
  add column if not exists recur_until     date,
  add column if not exists series_id       uuid references public.appointments (id) on delete cascade,
  add column if not exists original_date   date,
  add column if not exists canceled_reason text,
  add column if not exists canceled_at     timestamptz;

-- trainer_id deixa de ser obrigatório (personal/bloqueio não têm professor).
-- Precisa vir ANTES da conversão em bloqueio (que zera trainer_id).
alter table public.appointments alter column trainer_id drop not null;

-- -----------------------------------------------------------------------------
-- 4) BACKFILL — ANTES de qualquer CHECK (sem validação adiada; achado 1 do design).
--    (1) dono = professor; tipo = presencial.
--    (2) linhas sem aluno (a FK original era `on delete set null`) viram
--        BLOQUEIO: o horário do professor continua reservado, sem expor nada.
--    (3) ends_at obrigatório: +1h quando ausente/invertido.
-- -----------------------------------------------------------------------------
update public.appointments set owner_id = trainer_id where owner_id is null;
update public.appointments set kind = 'in_person' where kind is null;

update public.appointments
   set kind = 'block',
       title = 'Bloqueio',
       trainer_id = null,
       student_id = null
 where kind in ('in_person', 'online', 'assessment')
   and student_id is null;

update public.appointments
   set ends_at = starts_at + interval '1 hour'
 where ends_at is null or ends_at <= starts_at;

alter table public.appointments alter column owner_id set not null;
alter table public.appointments alter column kind set not null;
alter table public.appointments alter column ends_at set not null;

-- -----------------------------------------------------------------------------
-- 5) FK student_id: de `on delete set null` para `on delete cascade` (por nome).
--    O CHECK de participantes exige aluno em atendimentos; coerente com
--    workout_plans (cascade) e com exclusão de conta/LGPD.
-- -----------------------------------------------------------------------------
do $$
declare
  v_name text;
  v_del  "char";
begin
  select c.conname, c.confdeltype into v_name, v_del
  from pg_constraint c
  where c.conrelid = 'public.appointments'::regclass
    and c.contype = 'f'
    and c.confrelid = 'public.profiles'::regclass
    and c.conkey = array[
      (select a.attnum from pg_attribute a
        where a.attrelid = 'public.appointments'::regclass and a.attname = 'student_id')
    ]
  limit 1;
  if v_name is not null and v_del <> 'c' then
    execute format('alter table public.appointments drop constraint %I', v_name);
    v_name := null;
  end if;
  if v_name is null then
    alter table public.appointments
      add constraint appointments_student_id_fkey
      foreign key (student_id) references public.profiles (user_id) on delete cascade;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 6) CHECKs (drop if exists + add).
-- -----------------------------------------------------------------------------
alter table public.appointments drop constraint if exists appointments_ends_after_starts_chk;
alter table public.appointments add constraint appointments_ends_after_starts_chk
  check (ends_at > starts_at);

alter table public.appointments drop constraint if exists appointments_kind_participants_chk;
alter table public.appointments add constraint appointments_kind_participants_chk
  check (
    (kind in ('in_person', 'online', 'assessment')
       and trainer_id is not null and student_id is not null)
    or (kind in ('personal', 'block')
       and trainer_id is null and student_id is null)
  );

alter table public.appointments drop constraint if exists appointments_recur_chk;
alter table public.appointments add constraint appointments_recur_chk
  check (
    (recur_freq is null and recur_weekdays is null and recur_until is null)
    or (recur_freq = 'weekly'
        and recur_weekdays is not null
        and cardinality(recur_weekdays) between 1 and 7
        and recur_weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[])
    or (recur_freq in ('daily', 'monthly') and recur_weekdays is null)
  );

alter table public.appointments drop constraint if exists appointments_recur_freq_chk;
alter table public.appointments add constraint appointments_recur_freq_chk
  check (recur_freq is null or recur_freq in ('daily', 'weekly', 'monthly'));

alter table public.appointments drop constraint if exists appointments_override_chk;
alter table public.appointments add constraint appointments_override_chk
  check (
    series_id is null
    or (original_date is not null and recur_freq is null and series_id <> id)
  );

alter table public.appointments drop constraint if exists appointments_title_chk;
alter table public.appointments add constraint appointments_title_chk
  check (
    (kind in ('personal', 'block') and coalesce(length(btrim(title)), 0) between 1 and 120)
    or (kind not in ('personal', 'block') and (title is null or length(title) <= 120))
  );

alter table public.appointments drop constraint if exists appointments_notes_len_chk;
alter table public.appointments add constraint appointments_notes_len_chk
  check (notes is null or length(notes) <= 1000);

alter table public.appointments drop constraint if exists appointments_location_len_chk;
alter table public.appointments add constraint appointments_location_len_chk
  check (location is null or length(location) <= 200);

-- -----------------------------------------------------------------------------
-- 7) Índices (os 3 antigos permanecem) + trigger de validação do tz da série.
-- -----------------------------------------------------------------------------
create unique index if not exists appointments_series_original_uidx
  on public.appointments (series_id, original_date)
  where series_id is not null;
create index if not exists appointments_owner_starts_idx   on public.appointments (owner_id, starts_at);
create index if not exists appointments_student_starts_idx on public.appointments (student_id, starts_at);
create index if not exists appointments_tenant_starts_idx  on public.appointments (tenant_id, starts_at);
create index if not exists appointments_series_idx         on public.appointments (series_id);

drop trigger if exists appointments_validate_tz on public.appointments;
create trigger appointments_validate_tz
  before insert or update of tz on public.appointments
  for each row execute function public.appointments_validate_tz();

-- -----------------------------------------------------------------------------
-- 8) profiles.timezone (fuso do usuário) + trigger de validação.
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists timezone text not null default 'America/Sao_Paulo';

drop trigger if exists profiles_validate_timezone on public.profiles;
create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function public.profiles_validate_timezone();

-- -----------------------------------------------------------------------------
-- 9) water_goals — configuração dos lembretes (minutos desde 00:00, fuso do usuário).
-- -----------------------------------------------------------------------------
alter table public.water_goals
  add column if not exists reminder_interval_min smallint not null default 60
    check (reminder_interval_min in (30, 60, 90, 120, 180)),
  add column if not exists reminder_start_min smallint not null default 480
    check (reminder_start_min between 0 and 1439),
  add column if not exists reminder_end_min smallint not null default 1320
    check (reminder_end_min between 1 and 1439);

alter table public.water_goals drop constraint if exists water_goals_reminder_window_chk;
alter table public.water_goals add constraint water_goals_reminder_window_chk
  check (reminder_end_min > reminder_start_min);

-- -----------------------------------------------------------------------------
-- 10) Visibilidade: seed idempotente do módulo 'agenda' por tenant.
-- -----------------------------------------------------------------------------
insert into public.tenant_module_visibility (tenant_id, module, is_open)
select t.id, m.module, true
from public.tenants t
cross join (select 'agenda'::public.visibility_module as module) m
on conflict (tenant_id, module) do nothing;

-- -----------------------------------------------------------------------------
-- 11) RLS — só SELECT para authenticated; escrita APENAS pelas funções
--     SECURITY DEFINER de 20261107090200_agenda_functions.sql.
--     Sem subconsulta em tabela sob RLS (sem risco de recursão 42P17).
--     personal/block NUNCA saem do dono.
-- -----------------------------------------------------------------------------
alter table public.appointments enable row level security;

drop policy if exists appointments_select on public.appointments;
drop policy if exists appointments_insert on public.appointments;
drop policy if exists appointments_update on public.appointments;
drop policy if exists appointments_delete on public.appointments;

create policy appointments_select on public.appointments
  for select to authenticated
  using (
    owner_id = auth.uid()
    or (
      kind in ('in_person', 'online', 'assessment')
      and (
        student_id = auth.uid()
        or (
          tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('agenda')
            or trainer_id = auth.uid()
          )
        )
      )
    )
  );

revoke insert, update, delete on public.appointments from authenticated, anon;
