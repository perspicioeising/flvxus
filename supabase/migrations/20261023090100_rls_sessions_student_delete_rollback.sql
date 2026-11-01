-- =============================================================================
-- Rollback de 20261023090100_rls_sessions_student_delete.sql
-- Recria workout_sessions_delete e workout_set_logs_delete VERBATIM da migration
-- 20261020090800_rls_policies.sql (TRAINER-ONLY, sem o ramo do aluno dono).
-- IDEMPOTENTE: drop policy if exists + create policy.
-- =============================================================================

drop policy if exists workout_sessions_delete on public.workout_sessions;
create policy workout_sessions_delete on public.workout_sessions
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists workout_set_logs_delete on public.workout_set_logs;
create policy workout_set_logs_delete on public.workout_set_logs
  for delete to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and s.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));
