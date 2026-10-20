-- =============================================================================
-- Flvxus v2 — Migration (f): agenda + gamificação
-- Contrato: docs/architecture.md §6.2, §6.3
-- Tabelas: appointments, achievements, user_achievements
-- + trigger de gamificação ao fechar sessão de treino.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- appointments — agenda professor x aluno
-- -----------------------------------------------------------------------------
create table public.appointments (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  trainer_id  uuid not null references public.profiles (user_id) on delete cascade,
  student_id  uuid references public.profiles (user_id) on delete set null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  status      public.appointment_status not null default 'scheduled',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index appointments_tenant_id_idx  on public.appointments (tenant_id);
create index appointments_trainer_id_idx on public.appointments (trainer_id);
create index appointments_student_id_idx on public.appointments (student_id);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- achievements — conquistas configuráveis por tenant
-- rule jsonb descreve a regra de concessão (interpretada pela aplicação).
-- -----------------------------------------------------------------------------
create table public.achievements (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  name         text not null,
  description  text,
  icon         text,
  points       integer not null default 0,
  rule         jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index achievements_tenant_id_idx on public.achievements (tenant_id);

create trigger achievements_set_updated_at
  before update on public.achievements
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- user_achievements — conquistas concedidas a um aluno
-- -----------------------------------------------------------------------------
create table public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  student_id     uuid not null references public.profiles (user_id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  earned_at      timestamptz not null default now()
);

-- Evita conceder a mesma conquista duas vezes ao mesmo aluno.
create unique index user_achievements_student_achievement_uidx
  on public.user_achievements (student_id, achievement_id);

create index user_achievements_tenant_id_idx on public.user_achievements (tenant_id);

-- -----------------------------------------------------------------------------
-- Gamificação: ao fechar uma sessão (finished_at passa a NÃO-nulo), incrementa
-- pontos e marca a data do último treino do aluno (§6.3). Regra mínima coerente:
-- +10 pontos por sessão concluída. Concessão de conquistas por `rule` fica a
-- cargo da aplicação (regra jsonb interpretada no servidor).
-- -----------------------------------------------------------------------------
create or replace function public.award_points_on_session_finish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.finished_at is not null and old.finished_at is null then
    update public.profiles
      set total_points      = total_points + 10,
          last_workout_date = (new.finished_at at time zone 'UTC')::date
      where user_id = new.student_id;
  end if;
  return new;
end;
$$;

create trigger workout_sessions_award_points
  after update on public.workout_sessions
  for each row execute function public.award_points_on_session_finish();
