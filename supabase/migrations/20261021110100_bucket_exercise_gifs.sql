-- =============================================================================
-- Flvxus v2 — Migration: bucket PÚBLICO exercise-gifs (GIFs de demonstração)
-- Portado de supabase/criar-bucket-exercise-gifs.sql (o arquivo avulso permanece
-- intocado — serve só de base de leitura). ADITIVA e idempotente.
--
-- Por que PÚBLICO: os GIFs são demonstração genérica de exercício (não são dados
-- do aluno, nada sensível). Bucket público dá URL estável e direta, sem assinar
-- a cada exibição. signExerciseMedia (lib/storage) devolve a própria URL http(s).
--
-- Ordem: ANTES do seed global (20261021110400), pois os globais com GIF apontam
-- thumbnail_url para este bucket. Independe de 20261021110200 (source_link).
-- =============================================================================

-- Cria o bucket público (5 MB por arquivo; só GIF/imagem).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-gifs',
  'exercise-gifs',
  true,
  5242880,                                   -- 5 MB
  array['image/gif','image/webp','image/png','image/jpeg']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública dos objetos deste bucket (escrita fica a cargo do service_role
-- no script de importação; nenhuma policy de escrita para authenticated aqui).
drop policy if exists exercise_gifs_public_read on storage.objects;
create policy exercise_gifs_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'exercise-gifs');

-- Rollback (manual):
--   drop policy if exists exercise_gifs_public_read on storage.objects;
--   -- o bucket exercise-gifs NÃO é derrubado (pode conter GIFs já enviados).
