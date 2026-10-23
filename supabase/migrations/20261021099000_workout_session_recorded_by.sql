-- =============================================================================
-- Flvxus v2 — Migration: auditoria de quem preencheu a sessão (treino presencial)
-- ADITIVA e NULLABLE. NÃO altera enums nem RLS (a RLS já autoriza o trainer do
-- tenant a inserir/atualizar sessões/séries do aluno — ver
-- 20261020090800_rls_policies.sql). Aplicar à mão (ambiente sem Docker — ver
-- docs/pendencias.md). Por ser nullable e aditiva, não quebra INSERTs/UPDATEs
-- existentes nem o fluxo atual do aluno.
--
-- Semântica: recorded_by = user_id de QUEM preencheu a sessão. No fluxo normal
-- é o próprio aluno (= student_id). No treino presencial é o professor. O aluno
-- NÃO vê essa coluna na UI; serve só para auditoria/rastreabilidade.
-- =============================================================================

alter table public.workout_sessions
  add column recorded_by uuid references public.profiles (user_id) on delete set null;

comment on column public.workout_sessions.recorded_by is
  'user_id de quem preencheu a sessão (auditoria). Fluxo normal = o próprio '
  'aluno (= student_id); treino presencial = o professor. Nullable para '
  'sessões legadas. NÃO exibido na área do aluno.';
