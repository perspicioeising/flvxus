-- =============================================================================
-- Flvxus v2 — Séries detalhadas: reps/descanso/carga POR SÉRIE
-- Contrato: FEAT-001. Move reps, descanso e carga de "geral do item" para
-- configuráveis por série individual. target_reps e target_load já existem nas
-- tabelas de série (20261024090000); aqui acrescentamos rest_seconds e fazemos
-- o backfill de herança a partir do item pai.
--
-- Aditiva e IDEMPOTENTE (aplicável 2x sem erro): `add column if not exists` e
-- backfill com `coalesce(...)` guardado por `where ... is null` (só completa o
-- que está NULL; reaplicar não sobrescreve valores já definidos). NULL em uma
-- coluna de série significa "herda do item pai" — a resolução
-- 'série vence; item é fallback' acontece na leitura/execução.
-- Reverte em 20261024090300_series_reps_descanso_carga_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Nova coluna rest_seconds por série (nullable, sem default = herda do item).
-- -----------------------------------------------------------------------------
alter table public.workout_plan_item_sets
  add column if not exists rest_seconds integer;
comment on column public.workout_plan_item_sets.rest_seconds is
  'Descanso (segundos) desta série. NULL = herda o descanso do item pai (workout_plan_items.rest_seconds).';

alter table public.workout_exercise_sets
  add column if not exists rest_seconds integer;
comment on column public.workout_exercise_sets.rest_seconds is
  'Descanso (segundos) desta série. NULL = herda o descanso do item pai (workout_exercises.rest_seconds).';

-- -----------------------------------------------------------------------------
-- Backfill de herança: completa APENAS os campos NULL de cada série a partir do
-- item pai (coalesce preserva o que a série já tem). Casa série -> item pela FK.
-- -----------------------------------------------------------------------------
update public.workout_plan_item_sets s
set
  target_reps = coalesce(s.target_reps, i.reps),
  rest_seconds = coalesce(s.rest_seconds, i.rest_seconds),
  target_load = coalesce(s.target_load, i.target_load)
from public.workout_plan_items i
where i.id = s.plan_item_id
  and (s.target_reps is null or s.rest_seconds is null or s.target_load is null);

update public.workout_exercise_sets s
set
  target_reps = coalesce(s.target_reps, e.reps),
  rest_seconds = coalesce(s.rest_seconds, e.rest_seconds),
  target_load = coalesce(s.target_load, e.target_load)
from public.workout_exercises e
where e.id = s.workout_exercise_id
  and (s.target_reps is null or s.rest_seconds is null or s.target_load is null);
