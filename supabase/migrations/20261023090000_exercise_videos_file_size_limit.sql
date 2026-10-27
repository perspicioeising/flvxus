-- =============================================================================
-- Flvxus v2 — Migration: teto de tamanho do bucket PRIVADO exercise-videos
--
-- Objetivo: garantir que o bucket `exercise-videos` aceite vídeos de até 50 MB
-- (upload DIRETO via signed upload URL — ver actions/exercicios.ts). O teto de
-- tamanho de arquivo é configurado NO SUPABASE (storage.buckets.file_size_limit),
-- NÃO no Next. Esta migration define esse limite de forma explícita, sem depender
-- do default global do projeto.
--
-- Como aplicar (responsabilidade do dono do projeto, exige ambiente Supabase):
--   - `supabase db reset` / `supabase db push`, OU
--   - no painel do Supabase: Storage → bucket `exercise-videos` → file size limit.
--
-- ADITIVA e idempotente: `on conflict do update` só ajusta `file_size_limit`;
-- NÃO mexe em `public` (o bucket continua PRIVADO) e NÃO derruba o bucket nem
-- os objetos já enviados.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values (
  'exercise-videos',
  'exercise-videos',
  false,
  52428800                                   -- 50 MB (50 * 1024 * 1024)
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit;

-- Rollback (manual): volta o teto ao default global do projeto (sem limite
-- explícito no bucket).
--   update storage.buckets set file_size_limit = null where id = 'exercise-videos';
