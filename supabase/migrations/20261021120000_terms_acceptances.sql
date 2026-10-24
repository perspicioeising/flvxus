-- =============================================================================
-- Flvxus v2 — Migration: terms_acceptances (Termos de Uso + Política LGPD)
-- Fase 2.3 — prova IMUTÁVEL de aceite dos documentos legais.
--
-- Decisões (ver design.md §2.3–§2.5):
--  * Enum nativo `legal_document_type` (ADR 0003: domínio de valor = enum, nunca
--    text+CHECK).
--  * `user_id` referencia auth.users (não profiles): defensivo/service_role,
--    evita JOIN com profiles. `on delete cascade` preserva o direito LGPD de
--    eliminação do titular e o teardown do harness de RLS.
--  * `tenant_id` NULLABLE (escolha defensiva). Na prática a Server Action SEMPRE
--    preenche com profiles.tenant_id (o trigger handle_new_user cria tenant +
--    profile sincronamente no signUp — migration 20261020090100). Nenhuma lógica
--    depende de tenant null.
--  * `document_version text` SEM CHECK de formato de propósito (NIT 7): o formato
--    MAJOR.MINOR é validado SÓ no Zod (schemas/legal.ts).
--  * IMUTABILIDADE: protege-se só o UPDATE (trigger BEFORE UPDATE, pega até
--    service_role). O DELETE NÃO é bloqueado por trigger — fica governado por RLS
--    (negado a authenticated/anon; permitido a service_role e ao cascade de
--    auth.users). Remover um aceite é exercer o direito de eliminação, não
--    adulterar prova; alterar um aceite gravado é que invalidaria a prova.
--  * Índice ÚNICO (user_id, document_type, document_version) → idempotência (a
--    Server Action usa on conflict do nothing / ignoreDuplicates).
-- =============================================================================

create type public.legal_document_type as enum ('terms', 'privacy');

create table public.terms_acceptances (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  tenant_id        uuid references public.tenants (id) on delete set null,
  document_type    public.legal_document_type not null,
  document_version text not null,
  accepted_at      timestamptz not null default now(),
  ip_address       inet,
  user_agent       text
);

create index terms_acceptances_user_id_idx   on public.terms_acceptances (user_id);
create index terms_acceptances_tenant_id_idx on public.terms_acceptances (tenant_id);

-- Idempotência: um aceite por (usuário, documento, versão).
create unique index terms_acceptances_user_doc_version_uniq
  on public.terms_acceptances (user_id, document_type, document_version);

-- -----------------------------------------------------------------------------
-- Imutabilidade (UPDATE): ausência de policy já nega authenticated/anon; o
-- trigger garante contra service_role (que ignora RLS). Append-only no conteúdo.
-- NÃO existe trigger de DELETE: o DELETE é governado só por RLS (§2.4).
-- -----------------------------------------------------------------------------
create or replace function public.prevent_terms_acceptance_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'terms_acceptances é append-only: UPDATE não é permitido (id=%).', old.id
    using errcode = 'restrict_violation';
end;
$$;

create trigger terms_acceptances_no_update
  before update on public.terms_acceptances
  for each row execute function public.prevent_terms_acceptance_update();

-- -----------------------------------------------------------------------------
-- RLS — inspira-se em consent_records mas diverge de propósito (design.md §2.5):
--  INSERT só em nome próprio (ninguém aceita por outro); SELECT dono OU trainer
--  do tenant; SEM policy de UPDATE (trigger acima) nem de DELETE.
-- -----------------------------------------------------------------------------
alter table public.terms_acceptances enable row level security;

-- SELECT: o próprio usuário sempre; o trainer vê os aceites do seu tenant
-- (os aceites dos ALUNOS, que sempre têm tenant_id).
create policy terms_acceptances_select on public.terms_acceptances
  for select to authenticated
  using (
    user_id = auth.uid()
    or (
      tenant_id is not null
      and tenant_id = public.app_tenant_id()
      and public.app_role() = 'trainer'
    )
  );

-- INSERT: somente em nome próprio. tenant_id, quando informado, deve ser o do
-- usuário.
create policy terms_acceptances_insert on public.terms_acceptances
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (tenant_id is null or tenant_id = public.app_tenant_id())
  );

-- Sem policy de UPDATE: negado por padrão + trigger terms_acceptances_no_update.
-- Sem policy de DELETE: negado a authenticated/anon; service_role e o cascade de
--   auth.users continuam podendo apagar (eliminação de titular — LGPD art. 18).
