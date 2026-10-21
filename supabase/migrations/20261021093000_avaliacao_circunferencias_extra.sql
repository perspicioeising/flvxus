-- =============================================================================
-- Flvxus — Circunferências adicionais em physical_assessments
-- =============================================================================
-- Adiciona 4 circunferências bilaterais (braço contraído, antebraço, coxa
-- medial e coxa distal). Todas aditivas e nullable, seguindo o padrão
-- left_/right_ + _cm das demais colunas (ver 20261020090300_avaliacoes.sql).
--
-- Migração aplicada À MÃO pelo usuário no Supabase. O código já compila antes
-- da aplicação porque as colunas entram como opcionais em types/database.types.
-- =============================================================================

alter table public.physical_assessments
  add column left_flexed_arm_cm numeric(5,2),
  add column right_flexed_arm_cm numeric(5,2),
  add column left_forearm_cm numeric(5,2),
  add column right_forearm_cm numeric(5,2),
  add column left_mid_thigh_cm numeric(5,2),
  add column right_mid_thigh_cm numeric(5,2),
  add column left_distal_thigh_cm numeric(5,2),
  add column right_distal_thigh_cm numeric(5,2);
