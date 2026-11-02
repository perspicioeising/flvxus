-- =============================================================================
-- Flvxus v2 — Arena G1 (1/5): núcleo do motor de gamificação (perfis, temporadas,
-- ledger de eventos) + helper de fuso America/Sao_Paulo.
-- Contrato: design.md §Esquema de dados / §Fronteira temporal (HIGH-3) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO OBRIGATÓRIA (aplicada À MÃO pelo usuário, sem Docker):
--   20261026090000 (este)  -> tabelas-base + gamification_sp_date
--   20261026090100          -> catálogo de tipos, funções/triggers, backfill
--   20261026090200          -> RLS das tabelas novas
--   20261026090300          -> função de ranking (leaderboard)
--   20261026090400          -> seed de conquistas G1
-- As funções/triggers de 090100 dependem das tabelas criadas aqui.
--
-- ADITIVA e IDEMPOTENTE (forward 2x seguro): `create ... if not exists`,
-- `do $$ ... if not exists`. Espelha o padrão de 20261025090400_ai_usage_counters.
-- RLS fica em 090200; aqui só o esquema. Rollback em
-- 20261026090000_gamification_core_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Fuso oficial de TODAS as fronteiras temporais da Arena (HIGH-3): dia-SP.
-- occurred_on do evento, teto do limite diário, dia da streak e period_key da
-- temporada derivam SOMENTE daqui — nenhum trigger da Arena normaliza data por
-- outro caminho (o legado em UTC fica congelado e não é lido pela Arena).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_sp_date(p_ts timestamptz)
returns date
language sql
immutable
set search_path = ''
as $$
  select (p_ts at time zone 'America/Sao_Paulo')::date
$$;

comment on function public.gamification_sp_date(timestamptz) is
  'Data no fuso America/Sao_Paulo. Fronteira temporal única da Arena (HIGH-3): '
  'occurred_on, limite diário, dia da streak e period_key da temporada.';

-- -----------------------------------------------------------------------------
-- gamification_seasons — temporadas por calendário (mensal na G1).
-- period_key = YYYY-MM no fuso SP. Temporada é GLOBAL por calendário (não por
-- tenant): o ranking é "por tenant DENTRO de uma temporada". A virada é lazy
-- (upsert on conflict do nothing no caminho de escrita), sem cron.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_seasons (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid references public.tenants (id) on delete cascade,
  scope      text not null default 'monthly'
               check (scope in ('monthly', 'yearly', 'global')),
  period_key text not null,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists gamification_seasons_scope_period_uidx
  on public.gamification_seasons (scope, period_key);

comment on table public.gamification_seasons is
  'Temporadas da Arena por calendário (mensal na G1; scope já prevê yearly/global '
  'na G2). period_key = YYYY-MM no fuso SP; upsert lazy no caminho de escrita.';

-- -----------------------------------------------------------------------------
-- gamification_profiles — CACHE derivado por usuário (fonte de verdade = ledger).
-- Semeadura LAZY (MEDIUM-3): gamification_award cria a linha no primeiro evento
-- (insert ... on conflict (user_id) do nothing). A leitura trata ausência como
-- perfil zero-default. total_xp substitui profiles.total_points (congelado).
-- stats (NIT-3): { workouts, prs, assessments } — contadores por categoria.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_profiles (
  user_id             uuid primary key references public.profiles (user_id) on delete cascade,
  tenant_id           uuid not null references public.tenants (id) on delete cascade,
  total_xp            integer not null default 0,
  level               smallint not null default 0,
  current_streak      integer not null default 0,
  longest_streak      integer not null default 0,
  last_adherence_date date,
  stats               jsonb not null default '{}',
  updated_at          timestamptz not null default now()
);

comment on table public.gamification_profiles is
  'Cache derivado do ledger por usuário (XP/nível/streak/stats). Fonte de verdade '
  'é gamification_events; mantido pelas funções SECURITY DEFINER. Semeadura lazy.';
comment on column public.gamification_profiles.stats is
  'Contadores acumulados por categoria: { workouts, prs, assessments } (NIT-3). '
  'Chaves ausentes lidas como zero.';

-- -----------------------------------------------------------------------------
-- gamification_events — LEDGER append-only (fonte de verdade, auditável).
-- Idempotência ESTRUTURAL por unique (user_id, event_type, reference_id) +
-- on conflict do nothing (RF1.2). reference_id é text (session_id,
-- session_id:exercise_id, assessment_id, period_key). occurred_on = dia-SP.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (user_id) on delete cascade,
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  event_type   text not null,
  points       integer not null default 0,
  reference_id text not null,
  season_id    uuid references public.gamification_seasons (id),
  occurred_on  date not null,
  created_at   timestamptz not null default now()
);

create unique index if not exists gamification_events_user_type_ref_uidx
  on public.gamification_events (user_id, event_type, reference_id);

create index if not exists gamification_events_tenant_season_user_idx
  on public.gamification_events (tenant_id, season_id, user_id);

create index if not exists gamification_events_user_created_idx
  on public.gamification_events (user_id, created_at desc);

create index if not exists gamification_events_user_type_day_idx
  on public.gamification_events (user_id, event_type, occurred_on);

comment on table public.gamification_events is
  'Ledger append-only da Arena (fonte de verdade de XP/ranking). Idempotente por '
  'unique (user_id, event_type, reference_id). occurred_on em fuso SP.';
