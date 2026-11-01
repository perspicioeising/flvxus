-- =============================================================================
-- Flvxus v2 — Séries detalhadas: tipo (set_kind) + observação por série
-- Contrato: design.md §Melhoria 1 · requirements.md RF1.1–RF1.9, critérios 1–6.
--
-- Aditiva e IDEMPOTENTE (aplicável 2x sem erro): enum nativo guardado por bloco
-- do $$ (exception when duplicate_object), tabelas `create table if not exists`,
-- índices `create index if not exists` e policies `drop policy if exists` +
-- `create policy`. Reverte em
-- 20261024090000_series_tipo_observacao_rollback.sql.
--
-- Modelo de dados: uma LINHA por série de um item prescrito, espelhando as duas
-- tabelas de itens do domínio de treinos:
--   - workout_plan_item_sets → séries de um item de FICHA (workout_plan_items);
--   - workout_exercise_sets  → séries de um item de MODELO (workout_exercises).
-- Fichas/modelos SEM linhas nessas tabelas são LEGADO: a UI de execução assume
-- o default ('work', sem observação) — retrocompatibilidade (critérios 2 e 6).
--
-- RLS por COMANDO (SELECT/INSERT/UPDATE/DELETE), espelhando o padrão de
-- 20261022090400_rls_conditional_visibility.sql (helpers app_tenant_id()/
-- app_role()/app_is_master()/app_module_is_open('workouts')). O SELECT de
-- workout_plan_item_sets preserva o ramo do ALUNO dono de ficha `released`; as
-- mutações são trainer-only. workout_exercise_sets segue workouts.created_by e
-- é trainer-only inclusive no SELECT (modelo não tem aluno).
-- =============================================================================

-- Tipo de série: aquecimento, adaptação e trabalho (enum NATIVO, nunca text+check).
do $$
begin
  create type public.set_kind as enum ('warmup', 'adaptation', 'work');
exception
  when duplicate_object then null;
end
$$;

-- -----------------------------------------------------------------------------
-- Séries de um item de FICHA (workout_plan_items).
-- -----------------------------------------------------------------------------
create table if not exists public.workout_plan_item_sets (
  id uuid primary key default gen_random_uuid(),
  plan_item_id uuid not null
    references public.workout_plan_items(id) on delete cascade,
  set_number int not null check (set_number >= 1),
  kind public.set_kind not null default 'work',
  note text,
  target_reps text,
  target_load numeric(6, 2),
  created_at timestamptz not null default now(),
  unique (plan_item_id, set_number)
);

create index if not exists workout_plan_item_sets_plan_item_id_idx
  on public.workout_plan_item_sets (plan_item_id);

comment on table public.workout_plan_item_sets is
  'Séries detalhadas de um item de FICHA (tipo + observação por série). Ausência de linhas = legado (série de trabalho sem observação).';
comment on column public.workout_plan_item_sets.set_number is
  'Número da série (1..N contíguo dentro do item pai).';
comment on column public.workout_plan_item_sets.kind is
  'Tipo da série: warmup (aquecimento), adaptation (adaptação) ou work (trabalho).';
comment on column public.workout_plan_item_sets.note is
  'Observação opcional específica desta série, visível na execução (aluno e professor).';

-- -----------------------------------------------------------------------------
-- Séries de um item de MODELO (workout_exercises) — tabela espelho.
-- -----------------------------------------------------------------------------
create table if not exists public.workout_exercise_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null
    references public.workout_exercises(id) on delete cascade,
  set_number int not null check (set_number >= 1),
  kind public.set_kind not null default 'work',
  note text,
  target_reps text,
  target_load numeric(6, 2),
  created_at timestamptz not null default now(),
  unique (workout_exercise_id, set_number)
);

create index if not exists workout_exercise_sets_workout_exercise_id_idx
  on public.workout_exercise_sets (workout_exercise_id);

comment on table public.workout_exercise_sets is
  'Séries detalhadas de um item de MODELO (tipo + observação por série). Ausência de linhas = legado (série de trabalho sem observação).';
comment on column public.workout_exercise_sets.set_number is
  'Número da série (1..N contíguo dentro do item pai).';
comment on column public.workout_exercise_sets.kind is
  'Tipo da série: warmup (aquecimento), adaptation (adaptação) ou work (trabalho).';
comment on column public.workout_exercise_sets.note is
  'Observação opcional específica desta série, visível na execução.';

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.workout_plan_item_sets enable row level security;
alter table public.workout_exercise_sets enable row level security;

-- -----------------------------------------------------------------------------
-- workout_plan_item_sets — segue workout_plan_items -> workout_plans.trainer_id
-- / módulo 'workouts'. SELECT preserva o ramo do ALUNO (ficha released); as
-- mutações são trainer-only.
-- -----------------------------------------------------------------------------
drop policy if exists workout_plan_item_sets_select on public.workout_plan_item_sets;
create policy workout_plan_item_sets_select on public.workout_plan_item_sets
  for select to authenticated
  using (exists (
    select 1
    from public.workout_plan_items i
    join public.workout_plans p on p.id = i.plan_id
    where i.id = workout_plan_item_sets.plan_item_id
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

drop policy if exists workout_plan_item_sets_insert on public.workout_plan_item_sets;
create policy workout_plan_item_sets_insert on public.workout_plan_item_sets
  for insert to authenticated
  with check (exists (
    select 1
    from public.workout_plan_items i
    join public.workout_plans p on p.id = i.plan_id
    where i.id = workout_plan_item_sets.plan_item_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ));

drop policy if exists workout_plan_item_sets_update on public.workout_plan_item_sets;
create policy workout_plan_item_sets_update on public.workout_plan_item_sets
  for update to authenticated
  using (exists (
    select 1
    from public.workout_plan_items i
    join public.workout_plans p on p.id = i.plan_id
    where i.id = workout_plan_item_sets.plan_item_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ))
  with check (exists (
    select 1
    from public.workout_plan_items i
    join public.workout_plans p on p.id = i.plan_id
    where i.id = workout_plan_item_sets.plan_item_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ));

drop policy if exists workout_plan_item_sets_delete on public.workout_plan_item_sets;
create policy workout_plan_item_sets_delete on public.workout_plan_item_sets
  for delete to authenticated
  using (exists (
    select 1
    from public.workout_plan_items i
    join public.workout_plans p on p.id = i.plan_id
    where i.id = workout_plan_item_sets.plan_item_id
      and p.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or p.trainer_id = auth.uid()
      )
  ));

-- -----------------------------------------------------------------------------
-- workout_exercise_sets — segue workout_exercises -> workouts.created_by /
-- módulo 'workouts'. Trainer-only em TODOS os comandos (modelo não tem aluno).
-- -----------------------------------------------------------------------------
drop policy if exists workout_exercise_sets_select on public.workout_exercise_sets;
create policy workout_exercise_sets_select on public.workout_exercise_sets
  for select to authenticated
  using (exists (
    select 1
    from public.workout_exercises e
    join public.workouts w on w.id = e.workout_id
    where e.id = workout_exercise_sets.workout_exercise_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));

drop policy if exists workout_exercise_sets_insert on public.workout_exercise_sets;
create policy workout_exercise_sets_insert on public.workout_exercise_sets
  for insert to authenticated
  with check (exists (
    select 1
    from public.workout_exercises e
    join public.workouts w on w.id = e.workout_id
    where e.id = workout_exercise_sets.workout_exercise_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));

drop policy if exists workout_exercise_sets_update on public.workout_exercise_sets;
create policy workout_exercise_sets_update on public.workout_exercise_sets
  for update to authenticated
  using (exists (
    select 1
    from public.workout_exercises e
    join public.workouts w on w.id = e.workout_id
    where e.id = workout_exercise_sets.workout_exercise_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ))
  with check (exists (
    select 1
    from public.workout_exercises e
    join public.workouts w on w.id = e.workout_id
    where e.id = workout_exercise_sets.workout_exercise_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));

drop policy if exists workout_exercise_sets_delete on public.workout_exercise_sets;
create policy workout_exercise_sets_delete on public.workout_exercise_sets
  for delete to authenticated
  using (exists (
    select 1
    from public.workout_exercises e
    join public.workouts w on w.id = e.workout_id
    where e.id = workout_exercise_sets.workout_exercise_id
      and w.tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
      and (
        public.app_is_master()
        or public.app_module_is_open('workouts')
        or w.created_by = auth.uid()
      )
  ));
