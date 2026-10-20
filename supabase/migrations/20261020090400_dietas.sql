-- =============================================================================
-- Flvxus v2 — Migration (e): dietas
-- Contrato: docs/architecture.md §6.2, §6.4 · ADR 0003 (definição única)
-- Tabelas: diets, diet_meals, diet_meal_foods, diet_shopping_lists, diet_history
-- status (plan_status) controla a liberação ao aluno (igual a workout_plans).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- diets — plano alimentar por aluno
-- -----------------------------------------------------------------------------
create table public.diets (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null references public.tenants (id) on delete cascade,
  student_id             uuid not null references public.profiles (user_id) on delete cascade,
  trainer_id             uuid not null references public.profiles (user_id) on delete cascade,
  status                 public.plan_status not null default 'draft',
  goal                   public.goal_type,
  target_kcal            integer,
  protein_g              numeric(6, 2),
  carbs_g                numeric(6, 2),
  fat_g                  numeric(6, 2),
  restrictions           text[] not null default '{}',
  notes                  text,
  based_on_assessment_id uuid references public.physical_assessments (id) on delete set null,
  released_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index diets_tenant_id_idx  on public.diets (tenant_id);
create index diets_student_id_idx on public.diets (student_id);
create index diets_trainer_id_idx on public.diets (trainer_id);

create trigger diets_set_updated_at
  before update on public.diets
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- diet_meals — refeições de uma dieta
-- -----------------------------------------------------------------------------
create table public.diet_meals (
  id           uuid primary key default gen_random_uuid(),
  diet_id      uuid not null references public.diets (id) on delete cascade,
  name         text not null,
  time         text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index diet_meals_diet_id_idx on public.diet_meals (diet_id);

create trigger diet_meals_set_updated_at
  before update on public.diet_meals
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- diet_meal_foods — alimentos de uma refeição
-- -----------------------------------------------------------------------------
create table public.diet_meal_foods (
  id         uuid primary key default gen_random_uuid(),
  meal_id    uuid not null references public.diet_meals (id) on delete cascade,
  food_name  text not null,
  quantity   numeric(8, 2),
  unit       text,
  kcal       numeric(8, 2),
  protein_g  numeric(6, 2),
  carbs_g    numeric(6, 2),
  fat_g      numeric(6, 2),
  created_at timestamptz not null default now()
);

create index diet_meal_foods_meal_id_idx on public.diet_meal_foods (meal_id);

-- -----------------------------------------------------------------------------
-- diet_shopping_lists — lista de compras gerada a partir da dieta
-- -----------------------------------------------------------------------------
create table public.diet_shopping_lists (
  id         uuid primary key default gen_random_uuid(),
  diet_id    uuid not null references public.diets (id) on delete cascade,
  items      jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index diet_shopping_lists_diet_id_idx on public.diet_shopping_lists (diet_id);

-- -----------------------------------------------------------------------------
-- diet_history — trilha de versões/liberações (append-only, sem updated_at)
-- -----------------------------------------------------------------------------
create table public.diet_history (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  student_id  uuid not null references public.profiles (user_id) on delete cascade,
  diet_id     uuid not null references public.diets (id) on delete cascade,
  event       text not null,
  created_at  timestamptz not null default now()
);

create index diet_history_tenant_id_idx  on public.diet_history (tenant_id);
create index diet_history_student_id_idx on public.diet_history (student_id);
create index diet_history_diet_id_idx    on public.diet_history (diet_id);
