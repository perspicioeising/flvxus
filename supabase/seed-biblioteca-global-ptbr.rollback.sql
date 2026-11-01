-- =============================================================================
-- ROLLBACK do seed da biblioteca global (pt-BR).
-- Apaga APENAS globais (tenant_id null) cujo GIF vem do bucket do catálogo.
-- NÃO afeta exercícios de nenhum tenant. Revise antes de rodar.
-- =============================================================================

delete from public.exercises
where tenant_id is null
  and thumbnail_url like '%/exercise-gifs/catalogo/%';
