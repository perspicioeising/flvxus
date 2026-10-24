-- =============================================================================
-- Flvxus v2 — Fase 3 (1/5): flags master/filiado em profiles + backfill
-- Contrato: design.md §1, §9 item 1 · requirements FR1 · design-review HIGH #1,
-- MED #2, MED #5.
--
-- ADITIVA e IDEMPOTENTE (reaplicável): usa `add column if not exists`, backfill
-- com guarda, `create or replace function`. Aplicada À MÃO no Supabase hospedado
-- (sem Docker). Rollback em 20261022090100_profiles_master_affiliate_rollback.sql.
--
-- ORDEM (design-review MED #2): esta migration adiciona SÓ as colunas, o
-- backfill do master, o helper app_is_master(), a guarda de filiado e a flag de
-- is_tenant_master no signup. A SEMEADURA de tenant_module_visibility em
-- handle_new_user NÃO entra aqui — o enum/tabela de visibilidade só existem na
-- migration 2 (20261022090200). Separar evita que um signup ocorrido ENTRE a
-- aplicação manual das migrations 1 e 2 quebre o trigger (a tabela ainda não
-- existiria). A migration 2 reescreve handle_new_user acrescentando o seed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Colunas aditivas em profiles.
--  * is_tenant_master: TRUE = personal MASTER (dono do tenant, assina o plano,
--    gerencia filiados e visibilidade). FALSE = filiado OU aluno. Só faz sentido
--    quando role = 'trainer'. Sem novo valor no enum user_role (retrocompat).
--  * deactivated_at: desativação lógica do filiado (preserva autoria histórica).
--    NULL = ativo. Enforcement de acesso vive em getSessionUser (não em RLS).
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_tenant_master boolean not null default false;

alter table public.profiles
  add column if not exists deactivated_at timestamptz;

comment on column public.profiles.is_tenant_master is
  'TRUE = personal MASTER (dono do tenant, assina o plano, gerencia filiados e '
  'visibilidade). FALSE = filiado OU aluno. Só faz sentido quando role = trainer.';

comment on column public.profiles.deactivated_at is
  'Desativação lógica do filiado (NULL = ativo). Preserva a autoria histórica dos '
  'registros. O acesso é cortado em getSessionUser (retorna null), não em RLS.';

-- -----------------------------------------------------------------------------
-- Backfill de owner/master (retrocompatibilidade): todo trainer existente cujo
-- user_id = tenants.owner_id vira master. Como hoje cada tenant tem exatamente
-- um trainer (criado por handle_new_user, que é o owner), isto marca todo
-- trainer existente como master. Idempotente (o `= false` evita reescrever).
-- -----------------------------------------------------------------------------
update public.profiles p
set is_tenant_master = true
from public.tenants t
where p.tenant_id = t.id
  and p.role = 'trainer'
  and p.user_id = t.owner_id
  and p.is_tenant_master = false;

-- -----------------------------------------------------------------------------
-- tenants.plan vira LEGADO/informativo (design-review MED #4). A fonte de verdade
-- do plano de billing passa a ser subscriptions.plan_id (migration 5). Nenhuma
-- lógica da Fase 3 lê tenants.plan. O limite de ALUNOS continua em
-- tenants.max_students (inalterado) — plans NÃO duplica esse limite.
-- -----------------------------------------------------------------------------
comment on column public.tenants.plan is
  'LEGADO/informativo: a fonte de verdade do plano de billing é '
  'subscriptions.plan_id (-> plans.tier). O limite de ALUNOS continua em '
  'tenants.max_students. Nenhuma lógica da Fase 3 lê esta coluna.';

-- -----------------------------------------------------------------------------
-- app_is_master() — helper RLS: TRUE se o usuário autenticado é o master do seu
-- tenant. Mesma forma dos helpers existentes (app_tenant_id/app_role):
-- SECURITY DEFINER, stable, search_path vazio (schema-qualificar tudo).
-- -----------------------------------------------------------------------------
create or replace function public.app_is_master()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_tenant_master from public.profiles p where p.user_id = auth.uid()),
    false
  );
$$;

comment on function public.app_is_master() is
  'TRUE se o usuário autenticado é o master (dono) do seu tenant. Base do gate '
  'de billing/filiados/visibilidade e da RLS condicional por módulo (Fase 3).';

-- -----------------------------------------------------------------------------
-- handle_new_user() — reescrita BASEADA no corpo real vivo
-- (20261021091000_gamificacao_conquistas.sql), PRESERVANDO a chamada de
-- seed_achievements_for_tenant (design-review HIGH #1). Acréscimos da Fase 3:
--
--  (MED #5) ORDEM DAS GUARDAS (crítica):
--    1. v_role := raw_user_meta_data->>'role';
--    2. GUARDA DE FILIADO (ANTES de qualquer INSERT de tenant): se o usuário foi
--       convidado como filiado (is_affiliate='true'), curto-circuita — a action
--       convidarFiliado cria o profile no tenant do MASTER. Sem esta guarda, o
--       convite (que passa role:'trainer') criaria um tenant próprio para o
--       filiado (quebraria o modelo de mesmo tenant — FR1.3/AC2).
--    3. GUARDA DE ALUNO (existente): student não cria tenant aqui.
--    4. GUARDA DE IDEMPOTÊNCIA: se o profile já existe (retry/corrida), não duplica.
--    5. Cadastro público de PROFESSOR: cria tenant (owner) + profile MASTER
--       (is_tenant_master=true), semeia conquistas.
--
-- A SEMEADURA de tenant_module_visibility NÃO entra aqui (tabela só existe na
-- migration 2, que reescreve esta função acrescentando o seed de visibilidade).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_full_name text;
  v_role text;
begin
  v_role := new.raw_user_meta_data ->> 'role';

  -- Filiado convidado pelo MASTER: NÃO cria tenant nem profile aqui. A action
  -- convidarFiliado insere o profile no tenant do master (is_tenant_master=false).
  -- Esta guarda vem ANTES do INSERT de tenant (MED #5).
  if coalesce(new.raw_user_meta_data ->> 'is_affiliate', '') = 'true' then
    return new;
  end if;

  -- Aluno convidado pelo professor: NÃO cria tenant nem profile aqui.
  if v_role = 'student' then
    return new;
  end if;

  -- Se já existe profile para este usuário (retry/corrida), não duplica.
  if exists (select 1 from public.profiles p where p.user_id = new.id) then
    return new;
  end if;

  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);

  -- Cadastro público de PROFESSOR: cria o tenant (owner) e o profile MASTER.
  insert into public.tenants (owner_id, name)
  values (new.id, coalesce(v_full_name, 'Meu negócio'))
  returning id into v_tenant_id;

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email, is_tenant_master)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email, true);

  -- Semeia o conjunto inicial de conquistas do novo tenant (idempotente).
  -- PRESERVADO de 20261021091000 (design-review HIGH #1) — não remover.
  perform public.seed_achievements_for_tenant(v_tenant_id);

  return new;
end;
$$;
