-- =============================================================================
-- Flvxus v2 — Exercício de BACKUP na execução (máquina ocupada)
-- Contrato: FEAT-002. Durante a sessão, o aluno troca o exercício atual por um
-- alternativo com um toque, mantendo sets/reps/carga/descanso do slot. A troca
-- é AD-HOC (vive só na sessão corrente): NÃO altera a ficha. O registro reflete
-- o exercício EFETIVAMENTE executado via esta nova coluna nullable em
-- workout_set_logs — NULL = exercício prescrito (comportamento legado); quando
-- preenchida, carrega o exercício alternativo. Preservamos `plan_item_id`
-- apontando ao item prescrito, para que retomada, pré-preenchimento e progresso
-- (todos indexados por plan_item_id) sigam íntegros.
--
-- Aditiva e IDEMPOTENTE (aplicável 2x sem erro): `add column if not exists`.
-- NÃO alteramos RLS: a coluna herda as policies da tabela workout_set_logs
-- (posse por session_id → aluno dono OU trainer do tenant). `on delete set null`
-- espelha o comportamento de plan_item_id: apagar o exercício alternativo do
-- catálogo apenas zera a referência (volta a "prescrito"), sem derrubar o log.
-- Reverte em 20261025090000_workout_set_logs_substitute_exercise_rollback.sql.
-- =============================================================================

alter table public.workout_set_logs
  add column if not exists substitute_exercise_id uuid
    references public.exercises(id) on delete set null;
comment on column public.workout_set_logs.substitute_exercise_id is
  'Exercício EFETIVAMENTE executado quando o aluno trocou o prescrito por um alternativo nesta sessão (troca ad-hoc, não altera a ficha). NULL = executou o exercício prescrito (via plan_item_id). plan_item_id continua apontando ao item prescrito para preservar retomada/pré-preenchimento/progresso.';
