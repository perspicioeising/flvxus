-- =============================================================================
-- Flvxus v2 — Hábitos G2 (3/5): cumprimento de refeições da dieta.
-- Contrato: FEAT-001 · consome o motor da Arena (gamification_award).
--
-- ORDEM DE APLICAÇÃO: depois de 20261027090000_habit_event_types.sql (os tipos
-- meal_logged e diet_day precisam estar ativos).
--
-- O QUE FAZ:
--   1) diet_meal_completions — marcação de "refeição cumprida" pelo aluno no dia
--      (dia-SP via default). Única por (user, meal, dia): reversível (delete).
--   2) gamification_sync_diet — avalia a dieta liberada vigente do aluno e
--      concede meal_logged (1ª refeição do dia) e diet_day (todas as refeições
--      do dia) CHAMANDO public.gamification_award (consumo do motor, não
--      duplicação).
--   3) habit_diet_after_change — wrapper de trigger protegido. Dois triggers:
--      after insert e after delete.
--
-- Dieta liberada vigente (determinística): order by released_at desc nulls
-- last, created_at desc, id desc limit 1 — MESMA cláusula do RSC e da action.
--
-- ADITIVA e IDEMPOTENTE: `create table if not exists`, `create or replace`,
-- `create index if not exists`, `drop trigger if exists` + `create trigger`.
-- Rollback em 20261027090200_diet_meal_completions_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) diet_meal_completions — marcação de refeição cumprida pelo aluno.
-- -----------------------------------------------------------------------------
create table if not exists public.diet_meal_completions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (user_id) on delete cascade,
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  diet_id     uuid not null references public.diets (id) on delete cascade,
  meal_id     uuid not null references public.diet_meals (id) on delete cascade,
  occurred_on date not null default public.gamification_sp_date(now()),
  created_at  timestamptz not null default now(),
  unique (user_id, meal_id, occurred_on)
);

-- Consulta quente: refeições marcadas do dia por aluno.
create index if not exists diet_meal_completions_user_occurred_idx
  on public.diet_meal_completions (user_id, occurred_on);

-- -----------------------------------------------------------------------------
-- 2) gamification_sync_diet — concede meal_logged/diet_day do dia.
-- SECURITY DEFINER + search_path vazio. CHAMA public.gamification_award (consumo
-- do motor). Só pontua a dieta liberada VIGENTE (ignora marcações de dieta não
-- vigente): guarda determinística antes de qualquer concessão.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_sync_diet(p_user uuid, p_diet_id uuid, p_on date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cumpridas integer;
  v_total     integer;
begin
  -- Passo 1: só a dieta liberada vigente do aluno pontua. Mesma cláusula
  -- determinística do RSC/action: released_at desc nulls last, created_at desc,
  -- id desc. Marcação de dieta não vigente é no-op (sem XP).
  if p_diet_id is distinct from (
    select id from public.diets
    where student_id = p_user and status = 'released'
    order by released_at desc nulls last, created_at desc, id desc
    limit 1
  ) then
    return;
  end if;

  -- Passo 2: refeições cumpridas do dia para a dieta vigente.
  select count(*) into v_cumpridas
  from public.diet_meal_completions
  where user_id = p_user and diet_id = p_diet_id and occurred_on = p_on;

  if v_cumpridas >= 1 then
    perform public.gamification_award(
      p_user,
      'meal_logged',
      'meal:' || p_user || ':' || p_on,
      p_on
    );
  end if;

  -- Passo 3: dieta do dia cumprida (todas as refeições da dieta marcadas).
  select count(*) into v_total
  from public.diet_meals
  where diet_id = p_diet_id;

  if v_total > 0 and v_cumpridas >= v_total then
    perform public.gamification_award(
      p_user,
      'diet_day',
      'diet:' || p_user || ':' || p_on,
      p_on
    );
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) habit_diet_after_change — wrapper de trigger (insert e delete).
-- Protege a concessão: uma falha de XP NUNCA bloqueia a marcação da refeição.
-- Usa coalesce(new, old) para servir aos dois triggers.
-- -----------------------------------------------------------------------------
create or replace function public.habit_diet_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_diet uuid;
  v_on   date;
begin
  v_user := coalesce(new.user_id, old.user_id);
  v_diet := coalesce(new.diet_id, old.diet_id);
  v_on   := coalesce(new.occurred_on, old.occurred_on);

  begin
    perform public.gamification_sync_diet(v_user, v_diet, v_on);
  exception when others then
    raise warning 'gamification habit_diet_after_change falhou: %', sqlerrm;
  end;

  return coalesce(new, old);
end;
$$;

drop trigger if exists diet_meal_completions_gamification_insert on public.diet_meal_completions;
create trigger diet_meal_completions_gamification_insert
  after insert on public.diet_meal_completions
  for each row execute function public.habit_diet_after_change();

drop trigger if exists diet_meal_completions_gamification_delete on public.diet_meal_completions;
create trigger diet_meal_completions_gamification_delete
  after delete on public.diet_meal_completions
  for each row execute function public.habit_diet_after_change();
