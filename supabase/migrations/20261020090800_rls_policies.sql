-- =============================================================================
-- Flvxus v2 — Migration (i): RLS — ENABLE + policies
-- Contrato: docs/architecture.md §5.3 (matriz por tabela/verbo), §5.4 · ADR 0004
--
-- Invariantes garantidas aqui (a camada de dados é a dona):
--  * Isolamento de tenant: tenant_id = app_tenant_id() em TODA policy.
--  * Professor: CRUD dentro do seu tenant (app_role() = 'trainer').
--  * Aluno: só os PRÓPRIOS dados (student_id/user_id = auth.uid()).
--  * Aluno só vê workout_plans/diets quando status = 'released' (nunca rascunho).
--  * Escritas de IA (ai_usage_logs/ai_generations INSERT) só via service_role
--    (que ignora RLS); por isso NÃO há policy de INSERT para esses verbos —
--    nenhum papel autenticado pode inseri-los diretamente.
--
-- Observação: service_role ignora RLS (§4.4) e carimba tenant_id na aplicação.
-- As policies abaixo valem para usuários autenticados (role anon/authenticated).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Habilita RLS em TODAS as tabelas de negócio
-- -----------------------------------------------------------------------------
alter table public.tenants                enable row level security;
alter table public.profiles               enable row level security;
alter table public.exercises              enable row level security;
alter table public.workouts               enable row level security;
alter table public.workout_exercises      enable row level security;
alter table public.workout_plans          enable row level security;
alter table public.workout_plan_items     enable row level security;
alter table public.workout_sessions       enable row level security;
alter table public.workout_set_logs       enable row level security;
alter table public.physical_assessments   enable row level security;
alter table public.posture_assessments    enable row level security;
alter table public.diets                  enable row level security;
alter table public.diet_meals             enable row level security;
alter table public.diet_meal_foods        enable row level security;
alter table public.diet_shopping_lists    enable row level security;
alter table public.diet_history           enable row level security;
alter table public.appointments           enable row level security;
alter table public.achievements           enable row level security;
alter table public.user_achievements      enable row level security;
alter table public.ai_usage_logs          enable row level security;
alter table public.ai_generations         enable row level security;
alter table public.consent_records        enable row level security;
alter table public.data_requests          enable row level security;

-- =============================================================================
-- tenants — SELECT owner/trainer do tenant; UPDATE owner; INSERT via trigger
-- (handle_new_user roda como SECURITY DEFINER e não é barrado por estas policies).
-- =============================================================================
create policy tenants_select on public.tenants
  for select to authenticated
  using (id = public.app_tenant_id());

create policy tenants_update on public.tenants
  for update to authenticated
  using (id = public.app_tenant_id() and owner_id = auth.uid())
  with check (id = public.app_tenant_id() and owner_id = auth.uid());

-- =============================================================================
-- profiles
--  SELECT: próprio; trainer vê todos do seu tenant (inclui seus alunos).
--  INSERT: via trigger/service_role (sem policy de insert para authenticated).
--  UPDATE: próprio; trainer atualiza alunos do seu tenant (status, trainer_id).
--  DELETE: trainer desativa aluno (preferir status; delete restrito ao trainer).
-- =============================================================================
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (
    user_id = auth.uid()
    or (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  )
  with check (
    user_id = auth.uid()
    or (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  );

create policy profiles_delete on public.profiles
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and role = 'student'
  );

-- =============================================================================
-- exercises
--  SELECT: catálogo global (tenant_id IS NULL) para qualquer autenticado;
--          + exercícios do tenant do usuário (trainer e aluno).
--  INSERT/UPDATE/DELETE: trainer, sempre no seu tenant (nunca mexe no global).
-- =============================================================================
create policy exercises_select on public.exercises
  for select to authenticated
  using (tenant_id is null or tenant_id = public.app_tenant_id());

create policy exercises_insert on public.exercises
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy exercises_update on public.exercises
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy exercises_delete on public.exercises
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- workouts — modelo: só o trainer do tenant (CRUD)
-- =============================================================================
create policy workouts_select on public.workouts
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy workouts_insert on public.workouts
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy workouts_update on public.workouts
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy workouts_delete on public.workouts
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- workout_exercises — itens de modelo; segue a posse do workout pai (trainer).
-- =============================================================================
create policy workout_exercises_select on public.workout_exercises
  for select to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

create policy workout_exercises_insert on public.workout_exercises
  for insert to authenticated
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

create policy workout_exercises_update on public.workout_exercises
  for update to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ))
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

create policy workout_exercises_delete on public.workout_exercises
  for delete to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

-- =============================================================================
-- workout_plans
--  SELECT: trainer do tenant; aluno dono SÓ se status = 'released'.
--  INSERT/UPDATE/DELETE: trainer do tenant.
-- =============================================================================
create policy workout_plans_select on public.workout_plans
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or (student_id = auth.uid() and status = 'released')
  );

create policy workout_plans_insert on public.workout_plans
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy workout_plans_update on public.workout_plans
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy workout_plans_delete on public.workout_plans
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- workout_plan_items — segue a posse/liberação do plano pai.
--  Aluno só vê itens de planos liberados; trainer CRUD no seu tenant.
-- =============================================================================
create policy workout_plan_items_select on public.workout_plan_items
  for select to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and (
        (p.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or (p.student_id = auth.uid() and p.status = 'released')
      )
  ));

create policy workout_plan_items_insert on public.workout_plan_items
  for insert to authenticated
  with check (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

create policy workout_plan_items_update on public.workout_plan_items
  for update to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ))
  with check (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

create policy workout_plan_items_delete on public.workout_plan_items
  for delete to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

-- =============================================================================
-- workout_sessions
--  SELECT: trainer do tenant; aluno dono.
--  INSERT/UPDATE: aluno dono + trainer. DELETE: trainer.
-- =============================================================================
create policy workout_sessions_select on public.workout_sessions
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

create policy workout_sessions_insert on public.workout_sessions
  for insert to authenticated
  with check (
    tenant_id = public.app_tenant_id()
    and (
      student_id = auth.uid()
      or public.app_role() = 'trainer'
    )
  );

create policy workout_sessions_update on public.workout_sessions
  for update to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  )
  with check (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

create policy workout_sessions_delete on public.workout_sessions
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- workout_set_logs — segue a posse da sessão pai.
--  INSERT/UPDATE pelo aluno dono (da sessão) + trainer; DELETE trainer.
-- =============================================================================
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

create policy workout_set_logs_insert on public.workout_set_logs
  for insert to authenticated
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and (
        (s.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or s.student_id = auth.uid()
      )
  ));

create policy workout_set_logs_update on public.workout_set_logs
  for update to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and (
        (s.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or s.student_id = auth.uid()
      )
  ))
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and (
        (s.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or s.student_id = auth.uid()
      )
  ));

create policy workout_set_logs_delete on public.workout_set_logs
  for delete to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_set_logs.session_id
      and s.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

-- =============================================================================
-- physical_assessments — trainer CRUD no tenant; aluno dono só leitura.
-- =============================================================================
create policy physical_assessments_select on public.physical_assessments
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

create policy physical_assessments_insert on public.physical_assessments
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy physical_assessments_update on public.physical_assessments
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy physical_assessments_delete on public.physical_assessments
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- posture_assessments — igual a physical_assessments.
-- =============================================================================
create policy posture_assessments_select on public.posture_assessments
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

create policy posture_assessments_insert on public.posture_assessments
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy posture_assessments_update on public.posture_assessments
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy posture_assessments_delete on public.posture_assessments
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- diets
--  SELECT: trainer do tenant; aluno dono SÓ se status = 'released'.
--  INSERT/UPDATE/DELETE: trainer do tenant (rascunho de IA entra via service_role).
-- =============================================================================
create policy diets_select on public.diets
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or (student_id = auth.uid() and status = 'released')
  );

create policy diets_insert on public.diets
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy diets_update on public.diets
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy diets_delete on public.diets
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- diet_meals / diet_meal_foods / diet_shopping_lists — seguem a dieta pai.
--  Aluno só vê quando a dieta está liberada; trainer CRUD no seu tenant.
-- =============================================================================
-- diet_meals
create policy diet_meals_select on public.diet_meals
  for select to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and (
        (d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or (d.student_id = auth.uid() and d.status = 'released')
      )
  ));

create policy diet_meals_insert on public.diet_meals
  for insert to authenticated
  with check (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

create policy diet_meals_update on public.diet_meals
  for update to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ))
  with check (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

create policy diet_meals_delete on public.diet_meals
  for delete to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

-- diet_meal_foods (via meal -> diet)
create policy diet_meal_foods_select on public.diet_meal_foods
  for select to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and (
        (d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or (d.student_id = auth.uid() and d.status = 'released')
      )
  ));

create policy diet_meal_foods_insert on public.diet_meal_foods
  for insert to authenticated
  with check (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

create policy diet_meal_foods_update on public.diet_meal_foods
  for update to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ))
  with check (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

create policy diet_meal_foods_delete on public.diet_meal_foods
  for delete to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

-- diet_shopping_lists
create policy diet_shopping_lists_select on public.diet_shopping_lists
  for select to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and (
        (d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
        or (d.student_id = auth.uid() and d.status = 'released')
      )
  ));

create policy diet_shopping_lists_insert on public.diet_shopping_lists
  for insert to authenticated
  with check (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

create policy diet_shopping_lists_update on public.diet_shopping_lists
  for update to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ))
  with check (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

create policy diet_shopping_lists_delete on public.diet_shopping_lists
  for delete to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

-- =============================================================================
-- diet_history — SELECT trainer do tenant; aluno dono. INSERT sistema/trainer.
-- =============================================================================
create policy diet_history_select on public.diet_history
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

create policy diet_history_insert on public.diet_history
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- appointments — trainer do tenant (CRUD); aluno participante (leitura).
-- =============================================================================
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

-- =============================================================================
-- achievements — trainer do tenant (CRUD).
-- =============================================================================
create policy achievements_select on public.achievements
  for select to authenticated
  using (tenant_id = public.app_tenant_id());

create policy achievements_insert on public.achievements
  for insert to authenticated
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy achievements_update on public.achievements
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy achievements_delete on public.achievements
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- user_achievements — SELECT trainer do tenant; aluno dono. INSERT/UPDATE sistema.
-- Concessão real roda via trigger/service_role; não há INSERT para authenticated.
-- =============================================================================
create policy user_achievements_select on public.user_achievements
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

-- =============================================================================
-- ai_usage_logs — SELECT trainer do tenant. INSERT só service_role (sem policy).
-- =============================================================================
create policy ai_usage_logs_select on public.ai_usage_logs
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- ai_generations — SELECT trainer do tenant; UPDATE/DELETE trainer (aprova/edita).
-- INSERT só via Edge Function/service_role (sem policy de insert).
-- =============================================================================
create policy ai_generations_select on public.ai_generations
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy ai_generations_update on public.ai_generations
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

create policy ai_generations_delete on public.ai_generations
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- =============================================================================
-- consent_records — SELECT trainer do tenant; aluno dono.
--  INSERT: aluno dono (próprio) ou trainer em nome (no tenant).
--  UPDATE: aluno dono (revoga/atualiza).
-- =============================================================================
create policy consent_records_select on public.consent_records
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or user_id = auth.uid()
  );

create policy consent_records_insert on public.consent_records
  for insert to authenticated
  with check (
    tenant_id = public.app_tenant_id()
    and (
      user_id = auth.uid()
      or public.app_role() = 'trainer'
    )
  );

create policy consent_records_update on public.consent_records
  for update to authenticated
  using (user_id = auth.uid() and tenant_id = public.app_tenant_id())
  with check (user_id = auth.uid() and tenant_id = public.app_tenant_id());

-- =============================================================================
-- data_requests — SELECT trainer do tenant; aluno dono.
--  INSERT: aluno dono ou trainer em nome. UPDATE de status: sistema/service_role.
-- =============================================================================
create policy data_requests_select on public.data_requests
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or user_id = auth.uid()
  );

create policy data_requests_insert on public.data_requests
  for insert to authenticated
  with check (
    tenant_id = public.app_tenant_id()
    and (
      user_id = auth.uid()
      or public.app_role() = 'trainer'
    )
  );
