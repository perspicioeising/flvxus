-- =============================================================================
-- Flvxus v2 — Hábitos G2 (5/5): RLS das 4 tabelas de hábito.
-- Contrato: FEAT-001 · RLS por COMANDO (nunca `for all`), espelhando
-- workout_plan_rest_completions e gamification_rls.
--
-- ORDEM DE APLICAÇÃO: depois de 20261027090100/090200/090300 (as tabelas
-- precisam existir).
--
-- PRINCÍPIOS:
--   - RLS por comando: SELECT/INSERT/DELETE/UPDATE em policies separadas.
--   - Aluno dono em tudo; trainer do tenant só na meta de água (water_goals).
--   - INSERT das tabelas do aluno valida tenant_id = public.app_tenant_id()
--     (carimbo exigido pelo with check; a aplicação carimba user_id/tenant_id).
--   - A escrita de XP NÃO passa por policy: é exclusiva das funções SECURITY
--     DEFINER (triggers), que ignoram RLS.
--
-- ADITIVA e IDEMPOTENTE: `drop policy if exists` + `create policy`.
-- Rollback em 20261027090400_habits_rls_rollback.sql.
-- =============================================================================

alter table public.water_intake_logs    enable row level security;
alter table public.daily_checkins        enable row level security;
alter table public.diet_meal_completions enable row level security;
alter table public.water_goals           enable row level security;

-- -----------------------------------------------------------------------------
-- water_intake_logs: registro privado do aluno. SELECT/DELETE do próprio;
-- INSERT carimbando o tenant. Sem UPDATE (registro é imutável; corrige-se por
-- delete + insert).
-- -----------------------------------------------------------------------------
drop policy if exists water_intake_logs_select on public.water_intake_logs;
create policy water_intake_logs_select on public.water_intake_logs
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists water_intake_logs_insert on public.water_intake_logs;
create policy water_intake_logs_insert on public.water_intake_logs
  for insert to authenticated
  with check (user_id = auth.uid() and tenant_id = public.app_tenant_id());

drop policy if exists water_intake_logs_delete on public.water_intake_logs;
create policy water_intake_logs_delete on public.water_intake_logs
  for delete to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- daily_checkins: registro privado do aluno. Mesma forma do water_intake_logs.
-- -----------------------------------------------------------------------------
drop policy if exists daily_checkins_select on public.daily_checkins;
create policy daily_checkins_select on public.daily_checkins
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists daily_checkins_insert on public.daily_checkins;
create policy daily_checkins_insert on public.daily_checkins
  for insert to authenticated
  with check (user_id = auth.uid() and tenant_id = public.app_tenant_id());

drop policy if exists daily_checkins_delete on public.daily_checkins;
create policy daily_checkins_delete on public.daily_checkins
  for delete to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- diet_meal_completions: posse ancorada em diets (não só user_id).
--   - INSERT exige a dieta liberada vigente (d.status = 'released'): só se marca
--     refeição de dieta liberada.
--   - SELECT/DELETE usam a MESMA âncora SEM d.status = 'released' (simétricos e
--     mais permissivos que o insert): o aluno precisa poder LER/DESMARCAR
--     marcações de uma dieta que deixou de estar liberada (reversibilidade
--     RF3.2); sem isso, marcações ficariam presas ao trocar/despublicar a dieta.
-- Sem UPDATE (marcação é um fato booleano: insert = marcado, delete = desmarca).
-- -----------------------------------------------------------------------------
drop policy if exists diet_meal_completions_insert on public.diet_meal_completions;
create policy diet_meal_completions_insert on public.diet_meal_completions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and tenant_id = public.app_tenant_id()
    and exists (
      select 1 from public.diets d
      join public.diet_meals m on m.diet_id = d.id
      where m.id = diet_meal_completions.meal_id
        and d.id = diet_meal_completions.diet_id
        and d.student_id = auth.uid()
        and d.status = 'released'
        and d.tenant_id = diet_meal_completions.tenant_id
    )
  );

drop policy if exists diet_meal_completions_select on public.diet_meal_completions;
create policy diet_meal_completions_select on public.diet_meal_completions
  for select to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.diets d
      join public.diet_meals m on m.diet_id = d.id
      where m.id = diet_meal_completions.meal_id
        and d.id = diet_meal_completions.diet_id
        and d.student_id = auth.uid()
        and d.tenant_id = diet_meal_completions.tenant_id
    )
  );

drop policy if exists diet_meal_completions_delete on public.diet_meal_completions;
create policy diet_meal_completions_delete on public.diet_meal_completions
  for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.diets d
      join public.diet_meals m on m.diet_id = d.id
      where m.id = diet_meal_completions.meal_id
        and d.id = diet_meal_completions.diet_id
        and d.student_id = auth.uid()
        and d.tenant_id = diet_meal_completions.tenant_id
    )
  );

-- -----------------------------------------------------------------------------
-- water_goals: a meta de hidratação é editável por dois atores do mesmo tenant:
--   (a) o ALUNO dono (user_id = auth.uid()); ou
--   (b) o TRAINER do tenant, restrito a definir a meta de um aluno (role
--       'student') do seu tenant.
-- SELECT/INSERT/UPDATE compartilham a mesma cláusula; UPDATE repete em using e
-- with check. Sem DELETE (a meta existe sempre; ajusta-se por update/upsert).
-- -----------------------------------------------------------------------------
drop policy if exists water_goals_select on public.water_goals;
create policy water_goals_select on public.water_goals
  for select to authenticated
  using (
    (user_id = auth.uid() and tenant_id = public.app_tenant_id())
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and exists (
        select 1 from public.profiles s
        where s.user_id = water_goals.user_id
          and s.tenant_id = public.app_tenant_id()
          and s.role = 'student'
      )
    )
  );

drop policy if exists water_goals_insert on public.water_goals;
create policy water_goals_insert on public.water_goals
  for insert to authenticated
  with check (
    (user_id = auth.uid() and tenant_id = public.app_tenant_id())
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and exists (
        select 1 from public.profiles s
        where s.user_id = water_goals.user_id
          and s.tenant_id = public.app_tenant_id()
          and s.role = 'student'
      )
    )
  );

drop policy if exists water_goals_update on public.water_goals;
create policy water_goals_update on public.water_goals
  for update to authenticated
  using (
    (user_id = auth.uid() and tenant_id = public.app_tenant_id())
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and exists (
        select 1 from public.profiles s
        where s.user_id = water_goals.user_id
          and s.tenant_id = public.app_tenant_id()
          and s.role = 'student'
      )
    )
  )
  with check (
    (user_id = auth.uid() and tenant_id = public.app_tenant_id())
    or (
      tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and exists (
        select 1 from public.profiles s
        where s.user_id = water_goals.user_id
          and s.tenant_id = public.app_tenant_id()
          and s.role = 'student'
      )
    )
  );
