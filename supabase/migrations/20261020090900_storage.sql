-- =============================================================================
-- Flvxus v2 — Migration (j): Storage privado + policies
-- Contrato: docs/architecture.md §7 · ADR 0005
--
-- TODOS os buckets são PRIVADOS (public = false). Acesso só por URL assinada
-- gerada no servidor. posture-images (v1) é CONSOLIDADO em assessment-photos.
--
-- Convenção de path (1º segmento sempre tenant_id):
--   assessment-photos : {tenant_id}/{student_id}/{assessment_id}/{arquivo}
--   exercise-videos   : {tenant_id}/{exercise_id}/{arquivo}
--   exercise-audio    : {tenant_id}/{exercise_id}/{arquivo}
--   data-exports      : {tenant_id}/{user_id}/{request_id}.zip
--
-- As policies reutilizam a primitiva de isolamento do RLS de tabelas:
-- 1º segmento (tenant) = app_tenant_id(); para fotos e exports, o 2º segmento
-- (student_id/user_id) casa com o dono (aluno) ou é liberado ao trainer do tenant.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Buckets privados (idempotente; não sobrescreve visibilidade se já existir).
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('assessment-photos', 'assessment-photos', false),
  ('exercise-videos',   'exercise-videos',   false),
  ('exercise-audio',    'exercise-audio',    false),
  ('data-exports',      'data-exports',      false)
on conflict (id) do update set public = excluded.public;

-- =============================================================================
-- assessment-photos — dado de saúde.
--  SELECT: trainer do tenant (1º seg = tenant) OU aluno dono (2º seg = auth.uid).
--  WRITE (insert/update/delete): trainer do tenant (upload via servidor).
-- =============================================================================
create policy "assessment_photos_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'assessment-photos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and (
      public.app_role() = 'trainer'
      or split_part(name, '/', 2)::uuid = auth.uid()
    )
  );

create policy "assessment_photos_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assessment-photos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

create policy "assessment_photos_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'assessment-photos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  )
  with check (
    bucket_id = 'assessment-photos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

create policy "assessment_photos_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'assessment-photos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

-- =============================================================================
-- exercise-videos — mídia de exercício.
--  SELECT: qualquer usuário do tenant (trainer e aluno).
--  WRITE: trainer do tenant.
-- =============================================================================
create policy "exercise_videos_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exercise-videos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
  );

create policy "exercise_videos_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'exercise-videos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

create policy "exercise_videos_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'exercise-videos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  )
  with check (
    bucket_id = 'exercise-videos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

create policy "exercise_videos_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exercise-videos'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

-- =============================================================================
-- exercise-audio — igual a exercise-videos.
-- =============================================================================
create policy "exercise_audio_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exercise-audio'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
  );

create policy "exercise_audio_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'exercise-audio'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

create policy "exercise_audio_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'exercise-audio'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  )
  with check (
    bucket_id = 'exercise-audio'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

create policy "exercise_audio_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exercise-audio'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and public.app_role() = 'trainer'
  );

-- =============================================================================
-- data-exports — pacote LGPD.
--  SELECT: o próprio usuário (2º seg = auth.uid) OU trainer do tenant.
--  WRITE: só servidor/service_role (sem policy de insert/update para authenticated).
-- =============================================================================
create policy "data_exports_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'data-exports'
    and split_part(name, '/', 1)::uuid = public.app_tenant_id()
    and (
      public.app_role() = 'trainer'
      or split_part(name, '/', 2)::uuid = auth.uid()
    )
  );
