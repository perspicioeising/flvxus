-- =============================================================================
-- Flvxus — RESET TOTAL (Opção B): zera TODOS os dados, INCLUSIVE os logins
-- =============================================================================
--
--   ⚠️  OPERAÇÃO DESTRUTIVA E IRREVERSÍVEL. NÃO TEM DESFAZER.  ⚠️
--
-- O que este script faz:
--   1. Apaga TODOS os dados de negócio (alunos, treinos, avaliações, dietas,
--      sessões, agenda, gamificação, IA, LGPD) de TODAS as tabelas.
--   2. Apaga TODOS os usuários de autenticação (auth.users) — professores E
--      alunos. Você recria tudo do zero, inclusive a sua conta de professor.
--   3. Apaga o catálogo de exercícios (inclusive o seu, pois ele está vinculado
--      ao seu tenant — veja a nota no fim sobre re-semear).
--
-- COMO USAR:
--   - Supabase → SQL Editor → cole TUDO → Run.
--   - Rode em um projeto de TESTE/HOMOLOGAÇÃO. NUNCA rode em produção com dados
--     reais que você queira manter.
--
-- Depois de rodar, cadastre-se de novo pela tela de registro do app para criar
-- um novo tenant + conta de professor (o trigger handle_new_user faz isso).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1) Dados de negócio — TRUNCATE ... CASCADE
--    O CASCADE resolve a ordem das FKs automaticamente (filhos vão junto).
--    RESTART IDENTITY zera eventuais sequences. Listamos todas as 21 tabelas
--    explicitamente (não usamos um DO genérico) para o alvo ser claro e visível.
-- -----------------------------------------------------------------------------
truncate table
  -- core / multi-tenant
  public.tenants,
  public.profiles,
  -- treinos
  public.exercises,
  public.workouts,
  public.workout_exercises,
  public.workout_plans,
  public.workout_plan_items,
  public.workout_sessions,
  public.workout_set_logs,
  -- avaliações
  public.physical_assessments,
  public.posture_assessments,
  -- dietas
  public.diets,
  public.diet_meals,
  public.diet_meal_foods,
  public.diet_shopping_lists,
  public.diet_history,
  -- agenda / gamificação
  public.appointments,
  public.achievements,
  public.user_achievements,
  -- IA
  public.ai_usage_logs,
  public.ai_generations,
  -- LGPD
  public.consent_records,
  public.data_requests
restart identity cascade;

-- -----------------------------------------------------------------------------
-- 2) Logins (auth.users) — RESET TOTAL
--    Apaga TODOS os usuários de autenticação. Como public.tenants.owner_id e
--    public.profiles.user_id referenciam auth.users (id) com ON DELETE CASCADE,
--    apagar aqui também garante que nada reapareça. O TRUNCATE acima já esvaziou
--    as tabelas public; este DELETE zera o lado do auth.
--
--    >>> COMENTE este bloco se algum dia quiser a Opção A (manter os logins). <<<
-- -----------------------------------------------------------------------------
delete from auth.users;

commit;

-- =============================================================================
-- VERIFICAÇÃO (rode depois, deve tudo retornar 0)
-- =============================================================================
-- select
--   (select count(*) from public.tenants)              as tenants,
--   (select count(*) from public.profiles)             as profiles,
--   (select count(*) from public.exercises)            as exercises,
--   (select count(*) from public.workout_plans)        as fichas,
--   (select count(*) from public.workout_sessions)     as sessoes,
--   (select count(*) from public.physical_assessments) as avaliacoes,
--   (select count(*) from public.diets)                as dietas,
--   (select count(*) from auth.users)                  as usuarios_auth;

-- =============================================================================
-- DEPOIS DO RESET — passos para recomeçar
-- =============================================================================
-- 1. Cadastre-se de novo pela tela de registro do app (cria tenant + profile
--    role='trainer' via trigger handle_new_user). Isso gera um NOVO tenant_id e
--    um NOVO user_id para você.
--
-- 2. Re-semear o catálogo de exercícios:
--    O arquivo supabase/seed-exercicios-tenant.sql está AMARRADO a um tenant_id
--    e user_id ANTIGOS (c007ef49-... / b3033cc4-...), que NÃO existem mais após
--    o reset. Antes de rodá-lo, troque esses dois UUIDs pelos NOVOS, obtidos com:
--
--      select p.user_id, p.tenant_id, p.email
--      from public.profiles p
--      where p.role = 'trainer';
--
--    Substitua no seed e então rode-o no SQL Editor. (Os blocos DELETE do topo
--    do seed são inofensivos num banco recém-zerado.)
--
-- 3. Storage (fotos/vídeos) NÃO é tocado por este script. Se quiser limpar os
--    arquivos órfãos dos buckets (assessment-photos, exercise-media, etc.),
--    faça pelo painel Storage ou por um script separado — os objetos de Storage
--    não saem com TRUNCATE/DELETE das tabelas.
-- =============================================================================
