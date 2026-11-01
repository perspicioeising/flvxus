-- =============================================================================
-- Flvxus v2 — Abandono do treino: DELETE da sessão aberta pelo ALUNO DONO
-- Contexto: ao "abandonar o treino" (X na execução), a sessão ABERTA e seus
-- `workout_set_logs` são DESCARTADOS (action `cancelarSessao` em
-- actions/execucao.ts), voltando ao estado "não iniciado".
--
-- As policies de DELETE originais (20261020090800_rls_policies.sql) eram
-- TRAINER-ONLY, então o fluxo do ALUNO (role 'student') casava ZERO linhas e o
-- abandono virava no-op silencioso. Esta migration amplia o DELETE para incluir
-- o ALUNO DONO — espelhando o ramo `student_id = auth.uid()` que já existe nos
-- verbos INSERT/UPDATE dessas tabelas (aluno e professor presencial precisam
-- gravar). Isolamento de tenant preservado no ramo trainer.
--
-- IDEMPOTENTE: drop policy if exists + create policy. Reverte em
-- 20261023090100_rls_sessions_student_delete_rollback.sql (recria as policies
-- TRAINER-ONLY originais). Sem mudança em types/database.types.ts (só policies).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- workout_sessions — DELETE: trainer do tenant OU aluno dono.
-- -----------------------------------------------------------------------------
drop policy if exists workout_sessions_delete on public.workout_sessions;
create policy workout_sessions_delete on public.workout_sessions
  for delete to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- workout_set_logs — DELETE: segue a posse da sessão pai (trainer OU aluno dono).
-- -----------------------------------------------------------------------------
drop policy if exists workout_set_logs_delete on public.workout_set_logs;
create policy workout_set_logs_delete on public.workout_set_logs
  for delete to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and (
        (s.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or s.student_id = auth.uid()
      )
  ));
