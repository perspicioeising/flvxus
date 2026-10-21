-- =============================================================================
-- Flvxus — Pontuação InBody em physical_assessments
-- =============================================================================
-- Adiciona a coluna `inbody_score` (pontuação InBody da avaliação física).
-- Coluna DEDICADA (não jsonb) porque entrará nos gráficos de evolução no
-- futuro. Aditiva e nullable, seguindo o padrão das demais colunas numéricas
-- (ver 20261020090300_avaliacoes.sql e 20261021093000_avaliacao_circunferencias_extra.sql).
--
-- Migração aplicada À MÃO pelo usuário no Supabase. O código já compila antes
-- da aplicação porque a coluna entra como opcional em types/database.types.
-- =============================================================================

alter table public.physical_assessments
  add column inbody_score numeric(5,2);
