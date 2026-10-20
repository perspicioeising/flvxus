-- =============================================================================
-- Flvxus v2 — Migration (d): avaliações
-- Contrato: docs/architecture.md §6.2 · ADR 0003 (superset) · audit §3.3
-- physical_assessments é UMA definição canônica (superset coerente), resolvendo
-- o conflito dos 2 esquemas legados. SEM "CREATE TABLE IF NOT EXISTS".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- physical_assessments — avaliação física completa (superset)
-- -----------------------------------------------------------------------------
create table public.physical_assessments (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants (id) on delete cascade,
  student_id         uuid not null references public.profiles (user_id) on delete cascade,
  trainer_id         uuid not null references public.profiles (user_id) on delete cascade,
  assessed_at        timestamptz not null default now(),

  -- contexto
  age                integer,
  gender             text,
  protocol           public.assessment_protocol,

  -- composição corporal
  weight_kg          numeric(5, 2),
  height_cm          numeric(5, 2),
  bmi                numeric(5, 2),
  body_fat_pct       numeric(5, 2),
  lean_mass_kg       numeric(5, 2),
  fat_mass_kg        numeric(5, 2),
  muscle_mass_kg     numeric(5, 2),

  -- circunferências (cm)
  neck_cm            numeric(5, 2),
  shoulder_cm        numeric(5, 2),
  chest_cm           numeric(5, 2),
  waist_cm           numeric(5, 2),
  abdomen_cm         numeric(5, 2),
  hip_cm             numeric(5, 2),
  left_arm_cm        numeric(5, 2),
  right_arm_cm       numeric(5, 2),
  left_thigh_cm      numeric(5, 2),
  right_thigh_cm     numeric(5, 2),
  left_calf_cm       numeric(5, 2),
  right_calf_cm      numeric(5, 2),

  -- dobras cutâneas (mm)
  skf_triceps        numeric(5, 2),
  skf_subscapular    numeric(5, 2),
  skf_chest          numeric(5, 2),
  skf_midaxillary    numeric(5, 2),
  skf_suprailiac     numeric(5, 2),
  skf_abdominal      numeric(5, 2),
  skf_thigh          numeric(5, 2),

  -- extras livres + anamnese + IA (rascunho revisável)
  measurements       jsonb not null default '{}',
  anamnesis          jsonb,
  goal               public.goal_type,
  ai_analysis        jsonb,
  ai_recommendations jsonb,
  photos_consent     boolean not null default false,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index physical_assessments_student_id_idx  on public.physical_assessments (student_id);
create index physical_assessments_tenant_id_idx   on public.physical_assessments (tenant_id);
create index physical_assessments_assessed_at_idx on public.physical_assessments (assessed_at);

comment on column public.physical_assessments.measurements is
  'Medidas/extras não previstos no schema tipado (válvula de escape — ADR 0003).';

create trigger physical_assessments_set_updated_at
  before update on public.physical_assessments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- posture_assessments — avaliação postural (fotos em bucket privado)
-- Paths de imagem apontam para storage (assessment-photos), não URLs públicas.
-- -----------------------------------------------------------------------------
create table public.posture_assessments (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  student_id        uuid not null references public.profiles (user_id) on delete cascade,
  trainer_id        uuid not null references public.profiles (user_id) on delete cascade,
  assessed_at       timestamptz not null default now(),
  front_image_path  text,
  side_image_path   text,
  back_image_path   text,
  ai_analysis       jsonb,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index posture_assessments_student_id_idx on public.posture_assessments (student_id);
create index posture_assessments_tenant_id_idx  on public.posture_assessments (tenant_id);

create trigger posture_assessments_set_updated_at
  before update on public.posture_assessments
  for each row execute function public.set_updated_at();
