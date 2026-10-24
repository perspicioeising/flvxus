-- =============================================================================
-- Flvxus v2 — Fase 3 (3/5): backfill de autoria (created_by) das linhas de tenant
-- Contrato: design.md §2, §9 item 3 · requirements FR2.2.
--
-- ADITIVA (só UPDATE) e IDEMPOTENTE (rodar 2x não altera nada após a 1ª: a 2ª
-- não encontra created_by IS NULL de tenant). NUNCA toca o catálogo GLOBAL de
-- exercícios (tenant_id IS NULL, created_by NULL por design).
--
-- Por que: a RLS condicional (migration 4) no modo BLOQUEADO filtra por
-- created_by = auth.uid(); linhas de tenant com created_by NULL "sumiriam" para
-- filiados. Atribuímos a autoria ao master (owner do tenant). workout_plans /
-- diets / physical_assessments / posture_assessments têm trainer_id NOT NULL —
-- sem backfill. profiles.trainer_id de alunos já aponta pro master — sem backfill.
-- =============================================================================

-- exercises: SOMENTE linhas DE TENANT (nunca o catálogo global tenant_id IS NULL).
update public.exercises e
set created_by = t.owner_id
from public.tenants t
where e.tenant_id = t.id
  and e.created_by is null;

-- workouts: todas têm tenant_id NOT NULL; preenche created_by NULL com o owner.
update public.workouts w
set created_by = t.owner_id
from public.tenants t
where w.tenant_id = t.id
  and w.created_by is null;
