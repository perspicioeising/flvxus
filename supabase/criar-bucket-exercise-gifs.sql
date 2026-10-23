-- =============================================================================
-- Flvxus — Bucket PÚBLICO para os GIFs de demonstração dos exercícios
-- =============================================================================
-- Rode no SQL Editor do Supabase ANTES de rodar scripts/importar-gifs-exercicios.mjs.
--
-- Por que PÚBLICO: os GIFs são demonstração genérica de exercício (não são dados
-- do aluno, nada sensível). Um bucket público dá URL estável e direta, sem precisar
-- assinar a cada exibição — mais simples e rápido que o bucket privado de mídia.
--
-- Idempotente: on conflict não recria; pode rodar mais de uma vez.
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

-- -----------------------------------------------------------------------------
-- Policies de Storage
-- -----------------------------------------------------------------------------
-- Leitura: QUALQUER UM pode ler (bucket público). Como bucket.public = true, a
-- URL pública já funciona; a policy de SELECT abaixo cobre o acesso via API.
-- Escrita: só o service_role (usado pelo script de importação) — authenticated
-- NÃO pode gravar aqui. O service_role ignora RLS, então não precisa de policy
-- de INSERT para ele; e NÃO criamos policy de escrita para authenticated de
-- propósito (ninguém além do script sobe GIF neste bucket).

-- Leitura pública dos objetos deste bucket.
drop policy if exists exercise_gifs_public_read on storage.objects;
create policy exercise_gifs_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'exercise-gifs');

-- Verificação:
-- select id, public, file_size_limit from storage.buckets where id = 'exercise-gifs';
