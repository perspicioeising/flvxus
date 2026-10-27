-- =============================================================================
-- Flvxus v2 — FEAT-001 (1/2): índice único PARCIAL de sessão aberta
-- Contrato: design.md §3.1 (DECISÃO #2) · requirements FR1.10/CA#2/CA#3 ·
-- design-review MEDIUM-4 (saneamento idempotente antes do create index).
--
-- Garante UMA sessão ABERTA (finished_at null) por (student_id, plan_id,
-- division). `division` null é normalizada para '' (no Postgres dois NULL não
-- colidem em índice único, então o balde "divisão única" também precisa ser
-- único). IDEMPOTENTE; rollback em 20261022091000_uniq_workout_session_aberta_rollback.sql.
--
-- Verificação manual OPCIONAL ANTES de aplicar (quantas duplicatas abertas existem):
--   select student_id, plan_id, coalesce(division,'') as div, count(*)
--   from public.workout_sessions
--   where finished_at is null
--   group by student_id, plan_id, coalesce(division,'')
--   having count(*) > 1;
-- =============================================================================

-- 1) Saneamento idempotente: finaliza as duplicatas abertas MAIS ANTIGAS de cada
--    grupo (student_id, plan_id, coalesce(division,'')), preservando a mais recente
--    por started_at. Reexecutável: após rodar, cada grupo tem no máximo uma aberta,
--    então o update não afeta mais nada.
with ranked as (
  select id, row_number() over (
    partition by student_id, plan_id, coalesce(division, '')
    order by started_at desc, created_at desc
  ) as rn
  from public.workout_sessions
  where finished_at is null
)
update public.workout_sessions s
   set finished_at = now()
  from ranked r
 where r.id = s.id
   and r.rn > 1;

-- 2) Índice único parcial: uma sessão ABERTA por (student_id, plan_id, division).
--    division null normalizada para '' para que o balde "divisão única" também
--    seja único (no Postgres, dois NULL não colidem em índice único).
create unique index if not exists workout_sessions_aberta_uidx
  on public.workout_sessions (student_id, plan_id, coalesce(division, ''))
  where finished_at is null;

comment on index public.workout_sessions_aberta_uidx is
  'Impede duas sessoes abertas (finished_at null) para o mesmo (student, plan, division).';
