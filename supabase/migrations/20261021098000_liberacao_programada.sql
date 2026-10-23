-- =============================================================================
-- Flvxus v2 — Migration: liberação programada de treinos
-- ADITIVA e NULLABLE. NÃO altera enums nem RLS. Aplicar à mão (ambiente sem
-- Docker — ver docs/pendencias.md). Adiciona a coluna (nullable) de data de
-- liberação programada a workout_plans e um índice parcial para a varredura do
-- cron. Por ser nullable e aditiva, não quebra INSERTs/UPDATEs existentes.
--
-- Semântica: status='draft' + scheduled_release_at IS NOT NULL = ficha
-- AGENDADA (invisível ao aluno pela RLS atual). O cron diário transiciona para
-- 'released' quando scheduled_release_at <= now().
-- =============================================================================

alter table public.workout_plans
  add column scheduled_release_at timestamptz;

comment on column public.workout_plans.scheduled_release_at is
  'Quando preenchida e status=draft, a ficha está AGENDADA: o cron diário a '
  'libera (status=released, released_at=now()) quando scheduled_release_at <= now(). '
  'NULL = sem liberação programada. O aluno nunca vê fichas não-released (RLS).';

-- Índice PARCIAL que cobre exatamente a varredura do cron: só linhas agendadas
-- e ainda em rascunho. Mantém o índice pequeno e a varredura barata.
create index workout_plans_scheduled_release_idx
  on public.workout_plans (scheduled_release_at)
  where scheduled_release_at is not null and status = 'draft';
