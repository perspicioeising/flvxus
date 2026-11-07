-- =============================================================================
-- Flvxus — ROLLBACK de 20261107090100_agenda_core.sql
-- APLICADO À MÃO.
-- *** ROLLBACK DESTRUTIVO ***
-- Para restaurar `trainer_id not null` e a FK `student_id on delete set null`,
-- este script APAGA primeiro:
--   - todas as linhas de appointments com kind in ('personal','block');
--   - todas as demais linhas com trainer_id nulo.
-- Isso inclui bloqueios criados pela migration (inclusive os convertidos de
-- atendimentos sem aluno) e os compromissos pessoais de alunos/autônomos.
-- A perda NÃO é recuperável. Faça backup antes de rodar.
-- Também remove profiles.timezone e as colunas de lembrete de water_goals
-- (configurações perdidas). O valor 'agenda' do enum visibility_module
-- permanece (Postgres não remove valor de enum).
-- ORDEM: rode primeiro o rollback de 20261107090200_agenda_functions (as
-- funções e o trigger dependem destas colunas).
-- =============================================================================

-- 1) Dados que não existiam no esquema original (perda documentada acima).
delete from public.appointments
 where kind in ('personal', 'block') or trainer_id is null;

-- 2) Policies originais de volta; privilégios de escrita devolvidos.
drop policy if exists appointments_select on public.appointments;
drop policy if exists appointments_insert on public.appointments;
drop policy if exists appointments_update on public.appointments;
drop policy if exists appointments_delete on public.appointments;

create policy appointments_select on public.appointments
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );
create policy appointments_insert on public.appointments
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');
create policy appointments_update on public.appointments
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');
create policy appointments_delete on public.appointments
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

grant insert, update, delete on public.appointments to authenticated;

-- 3) Triggers, constraints, índices.
drop trigger if exists appointments_validate_tz on public.appointments;
alter table public.appointments drop constraint if exists appointments_ends_after_starts_chk;
alter table public.appointments drop constraint if exists appointments_kind_participants_chk;
alter table public.appointments drop constraint if exists appointments_recur_chk;
alter table public.appointments drop constraint if exists appointments_recur_freq_chk;
alter table public.appointments drop constraint if exists appointments_override_chk;
alter table public.appointments drop constraint if exists appointments_title_chk;
alter table public.appointments drop constraint if exists appointments_notes_len_chk;
alter table public.appointments drop constraint if exists appointments_location_len_chk;
drop index if exists public.appointments_series_original_uidx;
drop index if exists public.appointments_owner_starts_idx;
drop index if exists public.appointments_student_starts_idx;
drop index if exists public.appointments_tenant_starts_idx;
drop index if exists public.appointments_series_idx;

-- 4) FK original de student_id (on delete set null) e nulidades originais.
alter table public.appointments drop constraint if exists appointments_student_id_fkey;
alter table public.appointments
  add constraint appointments_student_id_fkey
  foreign key (student_id) references public.profiles (user_id) on delete set null;
alter table public.appointments alter column ends_at drop not null;
alter table public.appointments alter column trainer_id set not null;

-- 5) Colunas novas.
alter table public.appointments
  drop column if exists owner_id,
  drop column if exists kind,
  drop column if exists title,
  drop column if exists location,
  drop column if exists tz,
  drop column if exists recur_freq,
  drop column if exists recur_weekdays,
  drop column if exists recur_until,
  drop column if exists series_id,
  drop column if exists original_date,
  drop column if exists canceled_reason,
  drop column if exists canceled_at;

drop function if exists public.appointments_validate_tz();
drop type if exists public.appointment_kind;

-- 6) Visibilidade do módulo agenda.
delete from public.tenant_module_visibility where module = 'agenda';

-- 7) profiles.timezone.
drop trigger if exists profiles_validate_timezone on public.profiles;
drop function if exists public.profiles_validate_timezone();
alter table public.profiles drop column if exists timezone;

-- 8) water_goals: lembretes.
alter table public.water_goals drop constraint if exists water_goals_reminder_window_chk;
alter table public.water_goals
  drop column if exists reminder_interval_min,
  drop column if exists reminder_start_min,
  drop column if exists reminder_end_min;
