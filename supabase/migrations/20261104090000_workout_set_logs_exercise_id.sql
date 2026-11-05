-- =============================================================================
-- Flvxus v2 — Identidade DURÁVEL do exercício no log de série (evolução de carga
-- resiliente à recriação de itens de ficha, opção B).
--
-- Problema: `editarFicha`/`editarModelo` apagam TODOS os workout_plan_items da
-- ficha e os recriam com UUIDs novos. A FK workout_set_logs.plan_item_id é
-- `on delete set null` (20261020090200_treinos.sql), então os logs históricos
-- do aluno ficam com plan_item_id = NULL. A leitura de evolução de carga resolve
-- o exercício via join workout_set_logs → workout_plan_items → exercises, logo
-- perde o nome e a série de progressão some — violando o princípio "histórico/
-- evolução do aluno são preservados".
--
-- Correção: persistir a identidade do exercício no PRÓPRIO log, no instante do
-- registro (quando o item ainda está vivo), numa coluna nullable `exercise_id`.
-- A leitura passa a agrupar a evolução por `exercise_id` (UUID estável),
-- independente de `plan_item_id`. Mesma semântica que `substitute_exercise_id`
-- (20261025090000): identidade efetiva gravada no log.
--
-- Aditiva e IDEMPOTENTE (`add column if not exists`, `create index if not
-- exists`, backfill com `where exercise_id is null`). NÃO alteramos RLS: a
-- coluna herda as policies de workout_set_logs (posse por session_id → aluno
-- dono OU trainer do tenant). `on delete set null` espelha plan_item_id/
-- substitute_exercise_id: apagar o exercício do catálogo só zera a referência,
-- sem derrubar o log.
-- Reverte em 20261104090000_workout_set_logs_exercise_id_rollback.sql.
-- =============================================================================

alter table public.workout_set_logs
  add column if not exists exercise_id uuid
    references public.exercises(id) on delete set null;
comment on column public.workout_set_logs.exercise_id is
  'Exercício EFETIVAMENTE executado nesta série, gravado no registro para ser DURÁVEL à recriação de plan_item_id (editarFicha apaga e recria os itens). Precedência no registro: substitute_exercise_id, senão o exercise_id do item prescrito. É a fonte única e estável da identidade do exercício do log para a evolução de carga.';

-- A leitura de evolução agrupa/filtra por exercise_id.
create index if not exists workout_set_logs_exercise_id_idx
  on public.workout_set_logs (exercise_id);

-- Backfill SEGURO dos logs ainda deriváveis (item prescrito vivo OU substituto
-- vivo), com o mesmo coalesce da gamificação (20261026090100). Idempotente:
-- só toca linhas com exercise_id NULL e identidade ainda derivável. Logs JÁ
-- órfãos (plan_item_id NULL e substitute_exercise_id NULL) não são recuperáveis
-- aqui (a identidade foi destruída pelo on delete set null) e permanecem NULL
-- — decisão de produto (Opção A do design): aceitar a perda honestamente, sem
-- inferência que arriscaria atribuir carga ao exercício errado.
update public.workout_set_logs wsl
set exercise_id = coalesce(
      wsl.substitute_exercise_id,
      (select wpi.exercise_id from public.workout_plan_items wpi where wpi.id = wsl.plan_item_id)
    )
where wsl.exercise_id is null
  and coalesce(
      wsl.substitute_exercise_id,
      (select wpi.exercise_id from public.workout_plan_items wpi where wpi.id = wsl.plan_item_id)
    ) is not null;
