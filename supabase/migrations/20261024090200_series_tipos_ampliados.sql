-- =============================================================================
-- Flvxus v2 — Séries detalhadas: ampliação do enum set_kind (tipos de série)
-- Contrato: FEAT-001 (fundação de schema/tipos para séries individuais).
--
-- Aditiva e IDEMPOTENTE (aplicável 2x sem erro): cada valor novo entra com
-- `alter type ... add value if not exists`. Em PG15 `add value` é seguro em
-- transação DESDE QUE o valor novo não seja usado no mesmo bloco — por isso
-- este arquivo apenas declara os valores, sem referenciá-los. O backfill e a
-- UI que consomem os novos tipos vivem em migrations/arquivos posteriores.
--
-- Mantém os 3 tipos já existentes (warmup, adaptation, work; default 'work',
-- definido na tabela em 20261024090000_series_tipo_observacao.sql) e acrescenta
-- os 7 mais usados na prescrição. Reverte (no-op documentado) em
-- 20261024090200_series_tipos_ampliados_rollback.sql.
-- =============================================================================

alter type public.set_kind add value if not exists 'dropset';
alter type public.set_kind add value if not exists 'cluster_set';
alter type public.set_kind add value if not exists 'rest_pause';
alter type public.set_kind add value if not exists 'failure';
alter type public.set_kind add value if not exists 'isometric';
alter type public.set_kind add value if not exists 'pyramid';
alter type public.set_kind add value if not exists 'superset';
