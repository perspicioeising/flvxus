-- =============================================================================
-- Flvxus v2 — Migration (h): LGPD
-- Contrato: docs/architecture.md §6.2, §11
-- Tabelas: consent_records (append-only), data_requests (export/delete)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- consent_records — histórico de consentimentos (append-only, sem updated_at)
-- -----------------------------------------------------------------------------
create table public.consent_records (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  user_id        uuid not null references public.profiles (user_id) on delete cascade,
  consent_type   public.consent_type not null,
  granted        boolean not null,
  granted_at     timestamptz,
  revoked_at     timestamptz,
  policy_version text,
  ip             text,
  created_at     timestamptz not null default now()
);

create index consent_records_tenant_id_idx on public.consent_records (tenant_id);
create index consent_records_user_id_idx   on public.consent_records (user_id);

-- -----------------------------------------------------------------------------
-- data_requests — solicitações de exportação/exclusão (titular dos dados)
-- export_path aponta para o bucket privado data-exports (URL assinada).
-- -----------------------------------------------------------------------------
create table public.data_requests (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  user_id       uuid not null references public.profiles (user_id) on delete cascade,
  request_type  public.data_request_type not null,
  status        public.data_request_status not null default 'requested',
  requested_at  timestamptz not null default now(),
  completed_at  timestamptz,
  export_path   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index data_requests_tenant_id_idx on public.data_requests (tenant_id);
create index data_requests_user_id_idx   on public.data_requests (user_id);

create trigger data_requests_set_updated_at
  before update on public.data_requests
  for each row execute function public.set_updated_at();
