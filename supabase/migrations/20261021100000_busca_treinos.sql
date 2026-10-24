-- =============================================================================
-- Flvxus v2 — Migration: busca server-side de fichas (workout_plans) por nome
-- da ficha OU nome do aluno, paginada. ADITIVA. NÃO altera dados, enums nem RLS.
-- Aplicar à mão (ambiente sem Docker — ver TODO.md: "aplicar migration 20261021100000").
-- Reversível: a função search_workout_plans e os 2 índices GIN (drop ... if exists).
-- NÃO revertido por decisão: a extensão pg_trgm (pode servir a outros índices
-- trigram; inócua se ociosa).
-- SECURITY INVOKER: a função respeita a RLS de workout_plans e profiles
-- (isolamento de tenant/trainer vem das policies; app_role/app_tenant_id são DEFINER
-- e resolvem sob a RPC INVOKER sem recursão de RLS em profiles).
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;

-- Acelera ILIKE %q% em nome da ficha e nome do aluno.
create index if not exists workout_plans_name_trgm_idx
  on public.workout_plans using gin (name extensions.gin_trgm_ops);

create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name extensions.gin_trgm_ops);

create or replace function public.search_workout_plans(
  p_query     text default '',
  p_limit     integer default 10,
  p_offset    integer default 0
)
returns table (
  id                   uuid,
  name                 text,
  status               public.plan_status,
  scheduled_release_at timestamptz,
  student_name         text,
  total_count          integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  with filtradas as (
    select
      wp.id,
      wp.name,
      wp.status,
      wp.scheduled_release_at,
      pr.full_name as student_name,
      wp.created_at
    from public.workout_plans wp
    -- JOIN por student_id: nome do ALUNO dono da ficha (NUNCA por trainer_id).
    -- workout_plans tem 2 FKs para profiles (student_id e trainer_id); aqui é student_id.
    left join public.profiles pr on pr.user_id = wp.student_id
    where
      p_query = ''
      or wp.name ilike '%' || p_query || '%'
      or pr.full_name ilike '%' || p_query || '%'
  )
  select
    f.id,
    f.name,
    f.status,
    f.scheduled_release_at,
    f.student_name,
    -- count(*) over ()::int: total do conjunto filtrado. ::int porque o volume de
    -- fichas por tenant cabe em int (evita bigint chegar como string no supabase-js).
    count(*) over ()::int as total_count
  from filtradas f
  -- Tie-break determinístico (created_at pode empatar): id DESC estabiliza a
  -- paginação para não embaralhar/duplicar linhas entre páginas.
  order by f.created_at desc, f.id desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

comment on function public.search_workout_plans(text, integer, integer) is
  'Busca fichas (workout_plans) do professor por nome da ficha OU nome do aluno '
  '(ILIKE, acelerado por pg_trgm), paginada. SECURITY INVOKER: respeita a RLS de '
  'workout_plans e profiles (isolamento de tenant/trainer vem das policies).';

grant execute on function public.search_workout_plans(text, integer, integer) to authenticated;

-- Rollback (manual):
--   drop function if exists public.search_workout_plans(text, integer, integer);
--   drop index if exists public.profiles_full_name_trgm_idx;
--   drop index if exists public.workout_plans_name_trgm_idx;
--   -- pg_trgm: NÃO derrubar (pode servir a outros índices trigram; inócua se ociosa).
