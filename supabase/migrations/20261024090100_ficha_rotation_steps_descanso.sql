-- =============================================================================
-- Flvxus v2 — FEAT-003: dias de descanso na rotação da ficha
-- Contrato: design.md §Melhoria 3 (decisão 3a) · requirements RF3.1–RF3.6,
-- critérios 9–11 · design-review RNF3 (sem vazamento entre tenants).
--
-- ADITIVA e IDEMPOTENTE (forward 2x seguro):
--   1) workout_plans.rotation_steps jsonb  — sequência de rotação (divisões +
--      passos de descanso). NULL = ficha legada: rotação derivada atual intacta
--      (retrocompatibilidade, critério 10). NÃO contamina histórico/resumo.
--   2) workout_plan_rest_completions — marcador LEVE de "descanso cumprido" pelo
--      aluno/professor. Tabela própria: NÃO toca workout_sessions (RLS/resumo/
--      histórico de sessões permanecem byte-a-byte como hoje).
--
-- RLS por COMANDO (nunca `for all`), espelhando o padrão das filhas de
-- workout_plans (ver 20261022090400). DELETE/UPDATE NÃO são expostos.
-- Rollback em 20261024090100_ficha_rotation_steps_descanso_rollback.sql.
-- =============================================================================

-- 1) Sequência de rotação na ficha (NULL = legado, rotação derivada atual).
alter table public.workout_plans
  add column if not exists rotation_steps jsonb;

-- 2) Marcador de descanso cumprido (tabela própria, fora de workout_sessions).
create table if not exists public.workout_plan_rest_completions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  student_id uuid not null references public.profiles(user_id) on delete cascade,
  rest_step_index int not null check (rest_step_index >= 0),
  completed_at timestamptz not null default now()
);

-- Consulta quente: "último descanso cumprido deste (plano, aluno)".
create index if not exists workout_plan_rest_completions_plan_student_idx
  on public.workout_plan_rest_completions (plan_id, student_id, completed_at desc);

alter table public.workout_plan_rest_completions enable row level security;

-- -----------------------------------------------------------------------------
-- RLS por comando. INSERT/SELECT expostos; DELETE/UPDATE NÃO (sem policy).
--
-- Dois atores podem gravar/ler um descanso:
--   (a) o ALUNO dono da ficha released, gravando/lendo o PRÓPRIO descanso
--       (p.student_id = auth.uid() AND p.status = 'released'
--        AND student_id = auth.uid());
--   (b) o TRAINER do tenant (autoria por módulo 'workouts', como nas filhas de
--       workout_plans), gravando/lendo o descanso do aluno-alvo da ficha
--       (student_id = p.student_id).
-- -----------------------------------------------------------------------------
drop policy if exists workout_plan_rest_completions_insert
  on public.workout_plan_rest_completions;
create policy workout_plan_rest_completions_insert
  on public.workout_plan_rest_completions
  for insert to authenticated
  with check (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_rest_completions.plan_id
      and (
        -- (a) aluno dono de ficha released gravando o próprio descanso.
        (
          p.student_id = auth.uid()
          and p.status = 'released'
          and workout_plan_rest_completions.student_id = auth.uid()
        )
        -- (b) trainer do tenant gravando o descanso do aluno da ficha.
        or (
          p.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('workouts')
            or p.trainer_id = auth.uid()
          )
          and workout_plan_rest_completions.student_id = p.student_id
        )
      )
  ));

drop policy if exists workout_plan_rest_completions_select
  on public.workout_plan_rest_completions;
create policy workout_plan_rest_completions_select
  on public.workout_plan_rest_completions
  for select to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_rest_completions.plan_id
      and (
        -- (a) aluno dono vê o próprio descanso (ficha released).
        (
          p.student_id = auth.uid()
          and p.status = 'released'
          and workout_plan_rest_completions.student_id = auth.uid()
        )
        -- (b) trainer do tenant vê o descanso do aluno da ficha.
        or (
          p.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('workouts')
            or p.trainer_id = auth.uid()
          )
        )
      )
  ));
