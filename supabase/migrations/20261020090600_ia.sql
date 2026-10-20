-- =============================================================================
-- Flvxus v2 — Migration (g): IA
-- Contrato: docs/architecture.md §6.2, §8 · ADR 0001 (rascunho->aprovação, logs)
-- Tabelas: ai_usage_logs (append-only), ai_generations (rascunho->aprovação)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ai_usage_logs — log de uso de IA (rate limit, custo estimado, relatórios)
-- append-only (sem updated_at). Gravado só por Edge Function/service_role.
-- -----------------------------------------------------------------------------
create table public.ai_usage_logs (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants (id) on delete cascade,
  user_id            uuid references public.profiles (user_id) on delete set null,
  job_type           public.ai_job_type not null,
  model              text,
  input_tokens       integer,
  output_tokens      integer,
  estimated_cost_usd numeric(10, 6),
  status             text,
  latency_ms         integer,
  created_at         timestamptz not null default now()
);

create index ai_usage_logs_tenant_id_idx  on public.ai_usage_logs (tenant_id);
create index ai_usage_logs_user_id_idx    on public.ai_usage_logs (user_id);
-- created_at para janelas de rate limit e relatórios de uso.
create index ai_usage_logs_created_at_idx on public.ai_usage_logs (created_at);

-- -----------------------------------------------------------------------------
-- ai_generations — saída de IA como rascunho a aprovar (rascunho->aprovação).
-- target_table/target_id são preenchidos quando o rascunho é materializado
-- (ex.: em diets ou workout_plans).
-- -----------------------------------------------------------------------------
create table public.ai_generations (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  created_by    uuid references public.profiles (user_id) on delete set null,
  job_type      public.ai_job_type not null,
  status        public.ai_job_status not null default 'pending',
  input         jsonb,
  output        jsonb,
  target_table  text,
  target_id     uuid,
  reviewed_by   uuid references public.profiles (user_id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index ai_generations_tenant_id_idx on public.ai_generations (tenant_id);

create trigger ai_generations_set_updated_at
  before update on public.ai_generations
  for each row execute function public.set_updated_at();
