-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261021110200_exercises_source_link.sql
-- APLICADO À MÃO quando for preciso reverter o vínculo global. NÃO deve rodar
-- sozinho no fluxo forward-only (desfaz a migration anterior).
--
-- Ordem inversa da criação: primeiro a função, depois os índices, por fim a
-- coluna. Tudo `if exists` para ser seguro em reexecução.
-- =============================================================================

drop function if exists public.importar_exercicios_globais(uuid[]);

drop index if exists public.exercises_tenant_source_uniq;
drop index if exists public.exercises_global_name_uniq;
drop index if exists public.exercises_source_exercise_id_idx;

alter table public.exercises drop column if exists source_exercise_id;
