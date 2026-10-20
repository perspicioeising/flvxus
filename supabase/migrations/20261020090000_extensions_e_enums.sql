-- =============================================================================
-- Flvxus v2 — Migration (a): extensions + enums nativos
-- Contrato: docs/architecture.md §6.1 · ADR 0003
-- Todos os domínios de valores válidos são enums nativos (CREATE TYPE),
-- nunca text + CHECK (barra typos no nível de tipo e alimenta os tipos TS).
-- =============================================================================

-- Necessária para gen_random_uuid() nas PKs.
create extension if not exists pgcrypto with schema extensions;

-- Papel do usuário no produto.
create type public.user_role as enum ('trainer', 'student');

-- Situação cadastral do aluno.
create type public.student_status as enum ('active', 'inactive', 'pending', 'archived');

-- Objetivo de treino/dieta.
create type public.goal_type as enum (
  'weight_loss',
  'muscle_gain',
  'maintenance',
  'conditioning',
  'rehabilitation',
  'performance'
);

-- Nível de experiência do aluno.
create type public.experience_level as enum ('beginner', 'intermediate', 'advanced');

-- Protocolo de avaliação física (dobras cutâneas / manual).
create type public.assessment_protocol as enum (
  'pollock_3',
  'pollock_7',
  'guedes',
  'durnin',
  'manual'
);

-- Status de liberação de treinos E dietas (rascunho -> ... -> liberado).
-- "released" é o único status visível ao aluno (ver RLS §5.3/§5.4).
create type public.plan_status as enum (
  'draft',
  'pending_review',
  'approved',
  'released',
  'archived'
);

-- Tipo de job de IA.
create type public.ai_job_type as enum (
  'generate_diet',
  'suggest_workout',
  'analyze_assessment',
  'weekly_adherence'
);

-- Status de uma geração de IA (rascunho -> aprovação).
create type public.ai_job_status as enum ('pending', 'succeeded', 'failed', 'rejected');

-- Status de agendamento/compromisso.
create type public.appointment_status as enum ('scheduled', 'done', 'canceled', 'no_show');

-- Tipo de consentimento LGPD.
create type public.consent_type as enum ('data_processing', 'health_data', 'ai_processing', 'terms');

-- Tipo de solicitação LGPD (titular dos dados).
create type public.data_request_type as enum ('export', 'delete');

-- Status de uma solicitação LGPD.
create type public.data_request_status as enum ('requested', 'processing', 'completed', 'rejected');
