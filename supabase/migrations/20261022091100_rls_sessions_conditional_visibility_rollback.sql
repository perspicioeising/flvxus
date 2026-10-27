-- =============================================================================
-- Rollback de 20261022091100_rls_sessions_conditional_visibility.sql
-- Recria workout_sessions_select e workout_set_logs_select VERBATIM da migration
-- 20261020090800_rls_policies.sql (ramo trainer tenant-wide, SEM gate de módulo).
-- IDEMPOTENTE: drop policy if exists + create policy.
-- =============================================================================

drop policy if exists workout_sessions_select on public.workout_sessions;
create policy workout_sessions_select on public.workout_sessions
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

drop policy if exists workout_set_logs_select on public.workout_set_logs;
create policy workout_set_logs_select on public.workout_set_logs
  for select to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and (
        (s.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or s.student_id = auth.uid()
      )
  ));
