-- =============================================================================
-- Flvxus v2 — Migration: vínculo com o catálogo GLOBAL + RPC de importação
-- ADITIVA. Reversível pela migration 20261021110300_exercises_source_link_rollback.
--
-- source_exercise_id liga uma cópia do tenant ao exercício GLOBAL de origem
-- (exercises.tenant_id IS NULL). Permite importar da biblioteca global sem
-- duplicar e sem reimportar o mesmo global duas vezes (idempotência por índice).
--
-- A RPC importar_exercicios_globais roda com SECURITY INVOKER: respeita a RLS de
-- exercises (o INSERT passa pela policy exercises_insert, que exige
-- tenant_id = app_tenant_id() e app_role() = 'trainer'); carimba tenant_id e
-- created_by do professor autenticado. search_path vazio => schema-qualificar tudo.
-- =============================================================================

alter table public.exercises
  add column source_exercise_id uuid references public.exercises(id) on delete set null;

comment on column public.exercises.source_exercise_id is
  'Exercício GLOBAL (tenant_id IS NULL) de origem desta cópia do tenant. '
  'NULL em exercícios criados do zero e nos próprios globais.';

-- Lookup do vínculo (quais cópias derivam de um global).
create index exercises_source_exercise_id_idx
  on public.exercises(source_exercise_id);

-- Idempotência: um tenant não importa o mesmo global duas vezes.
create unique index exercises_tenant_source_uniq
  on public.exercises(tenant_id, source_exercise_id)
  where source_exercise_id is not null;

-- Nome único no catálogo global (case-insensitive), sem afetar tenants.
create unique index exercises_global_name_uniq
  on public.exercises(lower(name))
  where tenant_id is null;

-- -----------------------------------------------------------------------------
-- RPC: copia para o tenant do professor autenticado os globais indicados.
-- Retorna quantas linhas foram efetivamente inseridas (as já importadas são
-- ignoradas pelo ON CONFLICT). O predicado parcial where source_exercise_id is
-- not null é REPETIDO no ON CONFLICT (exigência do Postgres para casar o índice
-- parcial exercises_tenant_source_uniq).
-- -----------------------------------------------------------------------------
create or replace function public.importar_exercicios_globais(p_source_ids uuid[])
returns integer
language sql
security invoker
set search_path = ''
as $$
  with inseridos as (
    insert into public.exercises (
      tenant_id, created_by, source_exercise_id, name, muscle_groups, equipment,
      video_url, thumbnail_url, instructions, tips, common_errors
    )
    select
      public.app_tenant_id(),
      auth.uid(),
      g.id,
      g.name,
      g.muscle_groups,
      g.equipment,
      g.video_url,
      g.thumbnail_url,
      g.instructions,
      coalesce(g.tips, '{}'),
      coalesce(g.common_errors, '{}')
    from public.exercises g
    where g.id = any(p_source_ids)
      and g.tenant_id is null
    on conflict (tenant_id, source_exercise_id) where source_exercise_id is not null
      do nothing
    returning 1
  )
  select count(*)::int from inseridos;
$$;

comment on function public.importar_exercicios_globais(uuid[]) is
  'Copia para o tenant do professor autenticado os exercícios GLOBAIS (tenant_id '
  'IS NULL) indicados por p_source_ids. SECURITY INVOKER: respeita a RLS de '
  'exercises. Idempotente (ON CONFLICT DO NOTHING). Retorna o nº de linhas inseridas.';

grant execute on function public.importar_exercicios_globais(uuid[]) to authenticated;
