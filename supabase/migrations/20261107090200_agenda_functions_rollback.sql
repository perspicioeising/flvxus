-- =============================================================================
-- Flvxus — ROLLBACK de 20261107090200_agenda_functions.sql
-- APLICADO À MÃO. Remove o trigger de desvínculo e as funções da Agenda.
-- Não toca em dados. Rode ANTES do rollback de 20261107090100_agenda_core.
-- =============================================================================
drop trigger if exists profiles_agenda_on_student_unlink on public.profiles;
drop function if exists public.agenda_on_student_unlink();
drop function if exists public.agenda_cancel(uuid, text, date, text);
drop function if exists public.agenda_update(uuid, text, date, text, text, text, timestamptz, timestamptz, text, smallint[], date);
drop function if exists public.agenda_create(public.appointment_kind, uuid, text, text, text, timestamptz, timestamptz, text, smallint[], date);
drop function if exists public.agenda_next_occurrence(uuid, timestamptz);
drop function if exists public.agenda_is_occurrence(uuid, date);
drop function if exists public.agenda_occurrence_on(uuid, date);
drop function if exists public.agenda_can_manage(public.appointments, public.profiles);
drop function if exists public.agenda_check_fields(public.appointment_kind, text, text, text, timestamptz, timestamptz);
drop function if exists public.agenda_caller();
