-- =============================================================================
-- Flvxus v2 — Arena G2 (1/2): índices de suporte ao ranking GLOBAL (cross-tenant).
-- Contrato: FEAT-001 (ranking global). ORDEM: depois de 20261027090400.
--
-- Dois índices em public.gamification_events para acelerar as agregações do
-- ranking global mensal (por season_id) e anual (por occurred_on), cobrindo
-- user_id/points no INCLUDE (index-only scan na agregação).
--
-- ADITIVA e IDEMPOTENTE: `create index if not exists`. Nenhuma alteração de
-- tabela ou RLS. Nomes distintos dos índices do core (tenant_season_user_idx,
-- user_created_idx, user_type_day_idx).
-- Rollback em 20261028090000_gamification_global_indexes_rollback.sql.
-- =============================================================================
create index if not exists gamification_events_season_points_idx
  on public.gamification_events (season_id) include (user_id, points);

create index if not exists gamification_events_occurred_on_points_idx
  on public.gamification_events (occurred_on) include (user_id, points);
