-- =============================================================================
-- Flvxus v2 — Migration (c): domínio de treinos
-- Contrato: docs/architecture.md §6.2, §6.4
-- Tabelas: exercises, workouts, workout_exercises, workout_plans,
--          workout_plan_items, workout_sessions, workout_set_logs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- exercises — biblioteca. tenant_id NULLABLE = exercício-template GLOBAL
-- (catálogo compartilhado do seed), visível a todos como leitura (decisão 5
-- do plano; ver seed.sql e docs/database.md). Exercícios criados por um
-- professor têm tenant_id preenchido e seguem o isolamento normal.
-- -----------------------------------------------------------------------------
create table public.exercises (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid references public.tenants (id) on delete cascade,
  name           text not null,
  muscle_groups  text[] not null default '{}',
  equipment      text[] not null default '{}',
  video_url      text,
  thumbnail_url  text,
  instructions   text,
  tips           text[] not null default '{}',
  common_errors  text[] not null default '{}',
  created_by     uuid references public.profiles (user_id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index exercises_tenant_id_idx     on public.exercises (tenant_id);
-- GIN para busca por grupo muscular (array contains).
create index exercises_muscle_groups_idx on public.exercises using gin (muscle_groups);

comment on column public.exercises.tenant_id is
  'NULL = exercício-template global (catálogo compartilhado, leitura para todos).';

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- workouts — modelo/rotina reutilizável
-- -----------------------------------------------------------------------------
create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  name         text not null,
  description  text,
  is_template  boolean not null default false,
  created_by   uuid references public.profiles (user_id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index workouts_tenant_id_idx on public.workouts (tenant_id);

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- workout_exercises — itens de um modelo de treino
-- -----------------------------------------------------------------------------
create table public.workout_exercises (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references public.workouts (id) on delete cascade,
  exercise_id   uuid not null references public.exercises (id) on delete restrict,
  order_index   integer not null default 0,
  sets          integer,
  reps          text,
  rest_seconds  integer,
  target_load   numeric(6, 2),
  notes         text,
  created_at    timestamptz not null default now()
);

create index workout_exercises_workout_id_idx  on public.workout_exercises (workout_id);
create index workout_exercises_exercise_id_idx on public.workout_exercises (exercise_id);

-- -----------------------------------------------------------------------------
-- workout_plans — ficha por aluno (status controla liberação ao aluno)
-- -----------------------------------------------------------------------------
create table public.workout_plans (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  student_id        uuid not null references public.profiles (user_id) on delete cascade,
  trainer_id        uuid not null references public.profiles (user_id) on delete cascade,
  name              text not null,
  status            public.plan_status not null default 'draft',
  source_workout_id uuid references public.workouts (id) on delete set null,
  released_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index workout_plans_tenant_id_idx  on public.workout_plans (tenant_id);
create index workout_plans_student_id_idx on public.workout_plans (student_id);
create index workout_plans_trainer_id_idx on public.workout_plans (trainer_id);

create trigger workout_plans_set_updated_at
  before update on public.workout_plans
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- workout_plan_items — exercícios prescritos na ficha
-- -----------------------------------------------------------------------------
create table public.workout_plan_items (
  id            uuid primary key default gen_random_uuid(),
  plan_id       uuid not null references public.workout_plans (id) on delete cascade,
  exercise_id   uuid not null references public.exercises (id) on delete restrict,
  weekday       integer,
  order_index   integer not null default 0,
  sets          integer,
  reps          text,
  rest_seconds  integer,
  target_load   numeric(6, 2),
  notes         text,
  created_at    timestamptz not null default now()
);

create index workout_plan_items_plan_id_idx     on public.workout_plan_items (plan_id);
create index workout_plan_items_exercise_id_idx on public.workout_plan_items (exercise_id);

-- -----------------------------------------------------------------------------
-- workout_sessions — execução de um treino pelo aluno
-- -----------------------------------------------------------------------------
create table public.workout_sessions (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  plan_id      uuid references public.workout_plans (id) on delete set null,
  student_id   uuid not null references public.profiles (user_id) on delete cascade,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index workout_sessions_tenant_id_idx  on public.workout_sessions (tenant_id);
create index workout_sessions_student_id_idx on public.workout_sessions (student_id);
create index workout_sessions_plan_id_idx    on public.workout_sessions (plan_id);

create trigger workout_sessions_set_updated_at
  before update on public.workout_sessions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- workout_set_logs — registro de série (append-only, sem updated_at)
-- -----------------------------------------------------------------------------
create table public.workout_set_logs (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workout_sessions (id) on delete cascade,
  plan_item_id  uuid references public.workout_plan_items (id) on delete set null,
  set_number    integer not null,
  reps_done     integer,
  load_done     numeric(6, 2),
  completed     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index workout_set_logs_session_id_idx   on public.workout_set_logs (session_id);
create index workout_set_logs_plan_item_id_idx on public.workout_set_logs (plan_item_id);
