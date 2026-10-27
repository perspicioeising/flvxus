-- =============================================================================
-- Flvxus v2 — FEAT-001 (2/2): RLS condicional do histórico (SELECT)
-- Contrato: requirements FR2.8/CA#4 · DECISÃO DO USUÁRIO (mensagem #1):
--   "o histórico de treinos ficará visível para o professor através do CADASTRO
--    do aluno; se o cadastro do aluno não estiver visível, ele não terá acesso."
--
-- Por isso o ramo TRAINER do SELECT de workout_sessions/workout_set_logs é
-- ancorado na MESMA regra de visibilidade do módulo "students" (alunos) já
-- aplicada em profiles (migration 20261022090400_rls_conditional_visibility):
--     app_is_master()                 -- master vê tudo, SEMPRE
--  OR app_module_is_open('students')  -- módulo alunos LIBERADO: todos do tenant
--  OR <o aluno da sessão é um aluno que o filiado PODE VER>  -- BLOQUEADO
-- onde "pode ver o aluno" = existe profiles st com st.user_id = student_id,
-- st.role = 'student' e st.trainer_id = auth.uid() (autoria do cadastro).
-- NÃO usamos recorded_by nem workout_plans.trainer_id: a chave é a visibilidade
-- do CADASTRO do aluno (student_id), por decisão do usuário.
--
-- Isolamento de tenant preservado (tenant_id = app_tenant_id() no ramo trainer).
-- Ramo ALUNO carregado VERBATIM (student_id = auth.uid()) — não regride.
-- INSERT/UPDATE/DELETE INALTERADOS (aluno e professor presencial precisam gravar
-- independentemente do gate de visibilidade; o gate trata só do SELECT/histórico).
--
-- IDEMPOTENTE: drop policy if exists + create policy. Reverte em
-- 20261022091100_rls_sessions_conditional_visibility_rollback.sql (recria as
-- policies originais de 20261020090800_rls_policies.sql, tenant-wide sem gate).
-- Sem mudança em types/database.types.ts (só policies).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- workout_sessions — SELECT: ramo trainer ancorado na visibilidade do cadastro
-- do aluno (módulo "students"); ramo aluno verbatim.
-- -----------------------------------------------------------------------------
drop policy if exists workout_sessions_select on public.workout_sessions;
create policy workout_sessions_select on public.workout_sessions
  for select to authenticated
  using (
    (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('students')
        or exists (
          select 1 from public.profiles st
          where st.user_id = workout_sessions.student_id
            and st.role = 'student'
            and st.trainer_id = auth.uid()
        )
      )
    )
    or student_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- workout_set_logs — SELECT: segue a sessão pai; mesmo predicado condicional.
-- -----------------------------------------------------------------------------
drop policy if exists workout_set_logs_select on public.workout_set_logs;
create policy workout_set_logs_select on public.workout_set_logs
  for select to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and (
        (
          s.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('students')
            or exists (
              select 1 from public.profiles st
              where st.user_id = s.student_id
                and st.role = 'student'
                and st.trainer_id = auth.uid()
            )
          )
        )
        or s.student_id = auth.uid()
      )
  ));
