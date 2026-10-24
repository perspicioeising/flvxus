-- =============================================================================
-- Flvxus v2 — Fase 3 (4/5): RLS CONDICIONAL por módulo (SELECT + UPDATE/DELETE)
-- Contrato: design.md §4, §9 item 4 · requirements FR4 · design-review MED #3
-- (preservar acesso do ALUNO), MED #4 (opção b: restrição de autoria também em
-- UPDATE/DELETE), NIT #7 (filiado vê a linha do master).
--
-- IDEMPOTENTE: cada policy é `drop policy if exists` + `create policy`. Reverte
-- em 20261022090400_rls_conditional_visibility_rollback.sql (recria as policies
-- originais de 20261020090800_rls_policies.sql).
--
-- Predicado condicional de AUTORIA (por módulo), aplicado ao RAMO TRAINER:
--     app_is_master()                  -- master vê/edita tudo, SEMPRE
--  OR app_module_is_open('<mod>')      -- LIBERADO: tenant-wide (como hoje)
--  OR <coluna_autor> = auth.uid()      -- BLOQUEADO: só o próprio autor
-- sempre com tenant_id = app_tenant_id() preservando o isolamento.
--
-- MED #4 (opção b): o predicado de autoria vale também para UPDATE/DELETE — no
-- BLOQUEADO o filiado não VÊ nem EDITA/APAGA registros de outros. INSERT fica
-- inalterado (o filiado pode criar; a autoria é carimbada na aplicação).
--
-- MED #3: os ramos NÃO-TRAINER existentes (aluno) são carregados VERBATIM para
-- não regredir o acesso do aluno (fora de escopo quebrar telas do aluno).
-- =============================================================================

-- =============================================================================
-- profiles (módulo "students")
--  SELECT: próprio; trainers do tenant mutuamente visíveis (gestão de filiados
--          e joins de UI — NIT #7: o filiado VÊ a linha do master por design);
--          alunos do tenant condicionais à autoria (profiles.trainer_id).
--  UPDATE: próprio; trainer edita alunos do tenant condicional à autoria (MED #4).
--  DELETE: trainer apaga aluno (role='student') condicional à autoria (MED #4).
-- =============================================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('students')
        or role = 'trainer'          -- trainers do tenant sempre visíveis entre si
        or trainer_id = auth.uid()   -- aluno cujo autor (quem convidou) é o filiado
      )
    )
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (
    user_id = auth.uid()
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('students')
        or role = 'trainer'          -- trainer pode editar perfis de trainer do tenant
        or trainer_id = auth.uid()   -- BLOQUEADO: só alunos cuja autoria é o filiado
      )
    )
  )
  with check (
    user_id = auth.uid()
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('students')
        or role = 'trainer'
        or trainer_id = auth.uid()
      )
    )
  );

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and role = 'student'
    and (
      public.app_is_master()
      or public.app_module_is_open('students')
      or trainer_id = auth.uid()   -- BLOQUEADO: filiado só apaga os alunos dele
    )
  );

-- =============================================================================
-- exercises (módulo "exercises") — autor created_by.
--  MED #3: PRESERVAR o catálogo global (tenant_id IS NULL) E o acesso do ALUNO
--  do tenant (ramo não-trainer). A policy original NÃO tinha gate de trainer no
--  SELECT (alunos leem exercícios do tenant). Mantemos o ramo `app_role() <>
--  'trainer'` explicitamente para não regredir o aluno.
--  UPDATE/DELETE já eram trainer-only no tenant; aplicamos a autoria (MED #4).
-- =============================================================================
drop policy if exists exercises_select on public.exercises;
create policy exercises_select on public.exercises
  for select to authenticated
  using (
    tenant_id is null
    or (
      tenant_id = public.app_tenant_id()
      and (
        public.app_role() <> 'trainer'        -- aluno do tenant: inalterado (MED #3)
        or public.app_is_master()
        or public.app_module_is_open('exercises')
        or created_by = auth.uid()
      )
    )
  );

drop policy if exists exercises_update on public.exercises;
create policy exercises_update on public.exercises
  for update to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('exercises')
      or created_by = auth.uid()
    )
  )
  with check (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('exercises')
      or created_by = auth.uid()
    )
  );

drop policy if exists exercises_delete on public.exercises;
create policy exercises_delete on public.exercises
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('exercises')
      or created_by = auth.uid()
    )
  );

-- =============================================================================
-- workouts (módulo "workouts") — autor created_by. Só trainer (sem ramo aluno).
-- =============================================================================
drop policy if exists workouts_select on public.workouts;
create policy workouts_select on public.workouts
  for select to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or created_by = auth.uid()
    )
  );

drop policy if exists workouts_update on public.workouts;
create policy workouts_update on public.workouts
  for update to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or created_by = auth.uid()
    )
  )
  with check (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or created_by = auth.uid()
    )
  );

drop policy if exists workouts_delete on public.workouts;
create policy workouts_delete on public.workouts
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or created_by = auth.uid()
    )
  );

-- =============================================================================
-- workout_exercises (itens de MODELO) — segue workouts.created_by / módulo
-- 'workouts'. SELECT/UPDATE/DELETE replicam o predicado condicional do pai.
-- =============================================================================
drop policy if exists workout_exercises_select on public.workout_exercises;
create policy workout_exercises_select on public.workout_exercises
  for select to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));

drop policy if exists workout_exercises_update on public.workout_exercises;
create policy workout_exercises_update on public.workout_exercises
  for update to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ))
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));

drop policy if exists workout_exercises_delete on public.workout_exercises;
create policy workout_exercises_delete on public.workout_exercises
  for delete to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));

-- =============================================================================
-- workout_plans (fichas, módulo "workouts") — autor trainer_id.
--  SELECT preserva o ramo do ALUNO (student_id = auth.uid() and status =
--  'released') VERBATIM (MED #3). UPDATE/DELETE aplicam a autoria (MED #4).
-- =============================================================================
drop policy if exists workout_plans_select on public.workout_plans;
create policy workout_plans_select on public.workout_plans
  for select to authenticated
  using (
    (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or trainer_id = auth.uid()
      )
    )
    or (student_id = auth.uid() and status = 'released')
  );

drop policy if exists workout_plans_update on public.workout_plans;
create policy workout_plans_update on public.workout_plans
  for update to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or trainer_id = auth.uid()
    )
  )
  with check (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or trainer_id = auth.uid()
    )
  );

drop policy if exists workout_plans_delete on public.workout_plans;
create policy workout_plans_delete on public.workout_plans
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('workouts')
      or trainer_id = auth.uid()
    )
  );

-- =============================================================================
-- workout_plan_items — segue workout_plans.trainer_id / módulo 'workouts'.
--  SELECT preserva o ramo do aluno (plano released) VERBATIM.
-- =============================================================================
drop policy if exists workout_plan_items_select on public.workout_plan_items;
create policy workout_plan_items_select on public.workout_plan_items
  for select to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and (
        (
          p.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('workouts')
            or p.trainer_id = auth.uid()
          )
        )
        or (p.student_id = auth.uid() and p.status = 'released')
      )
  ));

drop policy if exists workout_plan_items_update on public.workout_plan_items;
create policy workout_plan_items_update on public.workout_plan_items
  for update to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ))
  with check (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ));

drop policy if exists workout_plan_items_delete on public.workout_plan_items;
create policy workout_plan_items_delete on public.workout_plan_items
  for delete to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ));

-- =============================================================================
-- physical_assessments (módulo "assessments") — autor trainer_id.
--  SELECT preserva o ramo do aluno dono (student_id = auth.uid()) VERBATIM.
-- =============================================================================
drop policy if exists physical_assessments_select on public.physical_assessments;
create policy physical_assessments_select on public.physical_assessments
  for select to authenticated
  using (
    (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('assessments')
        or trainer_id = auth.uid()
      )
    )
    or student_id = auth.uid()
  );

drop policy if exists physical_assessments_update on public.physical_assessments;
create policy physical_assessments_update on public.physical_assessments
  for update to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('assessments')
      or trainer_id = auth.uid()
    )
  )
  with check (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('assessments')
      or trainer_id = auth.uid()
    )
  );

drop policy if exists physical_assessments_delete on public.physical_assessments;
create policy physical_assessments_delete on public.physical_assessments
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('assessments')
      or trainer_id = auth.uid()
    )
  );

-- =============================================================================
-- posture_assessments (módulo "assessments") — igual a physical_assessments.
-- =============================================================================
drop policy if exists posture_assessments_select on public.posture_assessments;
create policy posture_assessments_select on public.posture_assessments
  for select to authenticated
  using (
    (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('assessments')
        or trainer_id = auth.uid()
      )
    )
    or student_id = auth.uid()
  );

drop policy if exists posture_assessments_update on public.posture_assessments;
create policy posture_assessments_update on public.posture_assessments
  for update to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('assessments')
      or trainer_id = auth.uid()
    )
  )
  with check (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('assessments')
      or trainer_id = auth.uid()
    )
  );

drop policy if exists posture_assessments_delete on public.posture_assessments;
create policy posture_assessments_delete on public.posture_assessments
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('assessments')
      or trainer_id = auth.uid()
    )
  );

-- =============================================================================
-- diets (módulo "diets") — autor trainer_id.
--  SELECT preserva o ramo do aluno (student_id = auth.uid() and status =
--  'released') VERBATIM.
-- =============================================================================
drop policy if exists diets_select on public.diets;
create policy diets_select on public.diets
  for select to authenticated
  using (
    (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or trainer_id = auth.uid()
      )
    )
    or (student_id = auth.uid() and status = 'released')
  );

drop policy if exists diets_update on public.diets;
create policy diets_update on public.diets
  for update to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('diets')
      or trainer_id = auth.uid()
    )
  )
  with check (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('diets')
      or trainer_id = auth.uid()
    )
  );

drop policy if exists diets_delete on public.diets;
create policy diets_delete on public.diets
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and (
      public.app_is_master()
      or public.app_module_is_open('diets')
      or trainer_id = auth.uid()
    )
  );

-- =============================================================================
-- diet_meals — segue diets.trainer_id / módulo 'diets'.
--  SELECT preserva o ramo do aluno (dieta released) VERBATIM.
-- =============================================================================
drop policy if exists diet_meals_select on public.diet_meals;
create policy diet_meals_select on public.diet_meals
  for select to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and (
        (
          d.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('diets')
            or d.trainer_id = auth.uid()
          )
        )
        or (d.student_id = auth.uid() and d.status = 'released')
      )
  ));

drop policy if exists diet_meals_update on public.diet_meals;
create policy diet_meals_update on public.diet_meals
  for update to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ))
  with check (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ));

drop policy if exists diet_meals_delete on public.diet_meals;
create policy diet_meals_delete on public.diet_meals
  for delete to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ));

-- =============================================================================
-- diet_meal_foods — via diet_meals -> diets (alcança diets.trainer_id / 'diets').
--  SELECT preserva o ramo do aluno (dieta released) VERBATIM.
-- =============================================================================
drop policy if exists diet_meal_foods_select on public.diet_meal_foods;
create policy diet_meal_foods_select on public.diet_meal_foods
  for select to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and (
        (
          d.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('diets')
            or d.trainer_id = auth.uid()
          )
        )
        or (d.student_id = auth.uid() and d.status = 'released')
      )
  ));

drop policy if exists diet_meal_foods_update on public.diet_meal_foods;
create policy diet_meal_foods_update on public.diet_meal_foods
  for update to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ))
  with check (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ));

drop policy if exists diet_meal_foods_delete on public.diet_meal_foods;
create policy diet_meal_foods_delete on public.diet_meal_foods
  for delete to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ));

-- =============================================================================
-- diet_shopping_lists — segue diets.trainer_id / módulo 'diets'.
--  SELECT preserva o ramo do aluno (dieta released) VERBATIM.
-- =============================================================================
drop policy if exists diet_shopping_lists_select on public.diet_shopping_lists;
create policy diet_shopping_lists_select on public.diet_shopping_lists
  for select to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and (
        (
          d.tenant_id = public.app_tenant_id()
          and public.app_role() = 'trainer'
          and (
            public.app_is_master()
            or public.app_module_is_open('diets')
            or d.trainer_id = auth.uid()
          )
        )
        or (d.student_id = auth.uid() and d.status = 'released')
      )
  ));

drop policy if exists diet_shopping_lists_update on public.diet_shopping_lists;
create policy diet_shopping_lists_update on public.diet_shopping_lists
  for update to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ))
  with check (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ));

drop policy if exists diet_shopping_lists_delete on public.diet_shopping_lists;
create policy diet_shopping_lists_delete on public.diet_shopping_lists
  for delete to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('diets')
        or d.trainer_id = auth.uid()
      )
  ));
