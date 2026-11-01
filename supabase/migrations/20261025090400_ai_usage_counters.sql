-- =============================================================================
-- Flvxus v2 — Fase B (6/6): contadores de uso de IA por tenant/periodo
-- Contrato: requirements FR-B3 (franquia de IA) · depende de tenants.
--
-- ADITIVA e IDEMPOTENTE. Tabela de contadores (tenant_id, period_start) com RLS:
-- SELECT so para o MASTER do tenant; escrita exclusiva do service_role (Edge
-- Functions), sem policy de write para authenticated.
--
-- Rollback em 20261025090400_ai_usage_counters_rollback.sql.
-- =============================================================================

create table if not exists public.ai_usage_counters (
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  period_start date not null,
  used         integer not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (tenant_id, period_start)
);

comment on table public.ai_usage_counters is
  'Contador de geracoes de IA consumidas por (tenant, periodo mensal). Escrito '
  'so pelo service_role (Edge Functions); o master le o proprio uso (RLS).';

-- -----------------------------------------------------------------------------
-- RLS: SELECT so o MASTER do tenant. Sem policy de write => service_role escreve.
-- -----------------------------------------------------------------------------
alter table public.ai_usage_counters enable row level security;

drop policy if exists ai_usage_counters_select on public.ai_usage_counters;
create policy ai_usage_counters_select on public.ai_usage_counters
  for select to authenticated
  using (tenant_id = public.app_tenant_id() and public.app_is_master());
