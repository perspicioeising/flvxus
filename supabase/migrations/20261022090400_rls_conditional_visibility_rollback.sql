-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261022090400_rls_conditional_visibility.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only.
--
-- Recria as policies ORIGINAIS de 20261020090800_rls_policies.sql (verbatim),
-- após `drop policy if exists`. Isso remove a condicionalidade por módulo e
-- volta ao comportamento tenant-wide anterior à Fase 3. Idempotente.
-- =============================================================================

-- ---- profiles -------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  );

drop policy if exists profiles_update on public.profiles;
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

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated
  using (
    tenant_id = public.app_tenant_id()
    and public.app_role() = 'trainer'
    and role = 'student'
  );

-- ---- exercises ------------------------------------------------------------
drop policy if exists exercises_select on public.exercises;
create policy exercises_select on public.exercises
  for select to authenticated
  using (tenant_id is null or tenant_id = public.app_tenant_id());

drop policy if exists exercises_update on public.exercises;
create policy exercises_update on public.exercises
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists exercises_delete on public.exercises;
create policy exercises_delete on public.exercises
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- ---- workouts -------------------------------------------------------------
drop policy if exists workouts_select on public.workouts;
create policy workouts_select on public.workouts
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists workouts_update on public.workouts;
create policy workouts_update on public.workouts
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists workouts_delete on public.workouts;
create policy workouts_delete on public.workouts
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- ---- workout_exercises ----------------------------------------------------
drop policy if exists workout_exercises_select on public.workout_exercises;
create policy workout_exercises_select on public.workout_exercises
  for select to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

drop policy if exists workout_exercises_update on public.workout_exercises;
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

drop policy if exists workout_exercises_delete on public.workout_exercises;
create policy workout_exercises_delete on public.workout_exercises
  for delete to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

-- ---- workout_plans --------------------------------------------------------
drop policy if exists workout_plans_select on public.workout_plans;
create policy workout_plans_select on public.workout_plans
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or (student_id = auth.uid() and status = 'released')
  );

drop policy if exists workout_plans_update on public.workout_plans;
create policy workout_plans_update on public.workout_plans
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists workout_plans_delete on public.workout_plans;
create policy workout_plans_delete on public.workout_plans
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- ---- workout_plan_items ---------------------------------------------------
drop policy if exists workout_plan_items_select on public.workout_plan_items;
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

drop policy if exists workout_plan_items_update on public.workout_plan_items;
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

drop policy if exists workout_plan_items_delete on public.workout_plan_items;
create policy workout_plan_items_delete on public.workout_plan_items
  for delete to authenticated
  using (exists (
    select 1 from public.workout_plans p
    where p.id = workout_plan_items.plan_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
  ));

-- ---- physical_assessments -------------------------------------------------
drop policy if exists physical_assessments_select on public.physical_assessments;
create policy physical_assessments_select on public.physical_assessments
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

drop policy if exists physical_assessments_update on public.physical_assessments;
create policy physical_assessments_update on public.physical_assessments
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists physical_assessments_delete on public.physical_assessments;
create policy physical_assessments_delete on public.physical_assessments
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- ---- posture_assessments --------------------------------------------------
drop policy if exists posture_assessments_select on public.posture_assessments;
create policy posture_assessments_select on public.posture_assessments
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or student_id = auth.uid()
  );

drop policy if exists posture_assessments_update on public.posture_assessments;
create policy posture_assessments_update on public.posture_assessments
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists posture_assessments_delete on public.posture_assessments;
create policy posture_assessments_delete on public.posture_assessments
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- ---- diets ----------------------------------------------------------------
drop policy if exists diets_select on public.diets;
create policy diets_select on public.diets
  for select to authenticated
  using (
    (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
    or (student_id = auth.uid() and status = 'released')
  );

drop policy if exists diets_update on public.diets;
create policy diets_update on public.diets
  for update to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer')
  with check (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

drop policy if exists diets_delete on public.diets;
create policy diets_delete on public.diets
  for delete to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_role() = 'trainer');

-- ---- diet_meals -----------------------------------------------------------
drop policy if exists diet_meals_select on public.diet_meals;
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

drop policy if exists diet_meals_update on public.diet_meals;
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

drop policy if exists diet_meals_delete on public.diet_meals;
create policy diet_meals_delete on public.diet_meals
  for delete to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_meals.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

-- ---- diet_meal_foods ------------------------------------------------------
drop policy if exists diet_meal_foods_select on public.diet_meal_foods;
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

drop policy if exists diet_meal_foods_update on public.diet_meal_foods;
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

drop policy if exists diet_meal_foods_delete on public.diet_meal_foods;
create policy diet_meal_foods_delete on public.diet_meal_foods
  for delete to authenticated
  using (exists (
    select 1 from public.diet_meals m
    join public.diets d on d.id = m.diet_id
    where m.id = diet_meal_foods.meal_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));

-- ---- diet_shopping_lists --------------------------------------------------
drop policy if exists diet_shopping_lists_select on public.diet_shopping_lists;
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

drop policy if exists diet_shopping_lists_update on public.diet_shopping_lists;
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

drop policy if exists diet_shopping_lists_delete on public.diet_shopping_lists;
create policy diet_shopping_lists_delete on public.diet_shopping_lists
  for delete to authenticated
  using (exists (
    select 1 from public.diets d
    where d.id = diet_shopping_lists.diet_id
      and d.tenant_id = public.app_tenant_id() and public.app_role() = 'trainer'
  ));
