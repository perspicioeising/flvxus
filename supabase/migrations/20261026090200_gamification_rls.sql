-- =============================================================================
-- Flvxus v2 — Arena G1 (3/5): RLS das 4 tabelas novas.
-- Contrato: design.md §RLS (MEDIUM-1) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO: depois de 20261026090000 (tabelas) e 20261026090100.
-- RLS por COMANDO (nunca `for all`), espelhando ai_usage_counters e
-- workout_plan_rest_completions. Toda escrita das tabelas gamification_* é
-- exclusiva das funções SECURITY DEFINER — NENHUMA policy de INSERT/UPDATE/
-- DELETE para `authenticated`.
--
-- MEDIUM-1: a RLS do Postgres NÃO restringe colunas; por isso gamification_events
-- e gamification_profiles liberam SELECT SOMENTE das próprias linhas
-- (user_id = auth.uid()), sem cláusula cross-tenant. O ranking de colegas é
-- servido só pela função gamification_tenant_leaderboard (090300).
--
-- ADITIVA e IDEMPOTENTE: `drop policy if exists` + `create policy`. Rollback em
-- 20261026090200_gamification_rls_rollback.sql.
-- =============================================================================

alter table public.gamification_profiles    enable row level security;
alter table public.gamification_events       enable row level security;
alter table public.gamification_seasons      enable row level security;
alter table public.gamification_event_types  enable row level security;

-- -----------------------------------------------------------------------------
-- gamification_profiles: SELECT só do próprio perfil. Sem write (triggers).
-- -----------------------------------------------------------------------------
drop policy if exists gamification_profiles_select on public.gamification_profiles;
create policy gamification_profiles_select on public.gamification_profiles
  for select to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- gamification_events: SELECT só dos próprios eventos (feed do aluno). Sem write
-- e SEM cláusula cross-tenant (MEDIUM-1). Ranking vem da função SECURITY DEFINER.
-- -----------------------------------------------------------------------------
drop policy if exists gamification_events_select on public.gamification_events;
create policy gamification_events_select on public.gamification_events
  for select to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- gamification_seasons: dados de calendário, sem conteúdo sensível. SELECT para
-- qualquer autenticado. Sem write (upsert via função SECURITY DEFINER).
-- -----------------------------------------------------------------------------
drop policy if exists gamification_seasons_select on public.gamification_seasons;
create policy gamification_seasons_select on public.gamification_seasons
  for select to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- gamification_event_types: catálogo de configuração. SELECT para qualquer
-- autenticado. Sem write (seed via migration).
-- -----------------------------------------------------------------------------
drop policy if exists gamification_event_types_select on public.gamification_event_types;
create policy gamification_event_types_select on public.gamification_event_types
  for select to authenticated
  using (true);
