-- =============================================================================
-- Flvxus v2 — Hábitos G2 (2/5): meta de água + registros de ingestão.
-- Contrato: FEAT-001 · consome o motor da Arena (gamification_award).
--
-- ORDEM DE APLICAÇÃO: depois de 20261027090000_habit_event_types.sql (o tipo
-- water_goal precisa estar ativo para a concessão valer).
--
-- O QUE FAZ:
--   1) water_goals — meta diária de hidratação por aluno (1 linha por aluno).
--   2) water_intake_logs — registros de ingestão do dia (dia-SP via default).
--   3) gamification_sync_water_goal — soma o dia e, ao atingir a meta, concede
--      water_goal CHAMANDO public.gamification_award (não duplica o motor).
--   4) habit_water_after_change — wrapper de trigger protegido (falha de XP
--      nunca bloqueia o registro). Dois triggers: after insert e after delete.
--
-- Fuso: occurred_on tem default public.gamification_sp_date(now()) — fonte única
-- do dia-SP; NÃO carimbar occurred_on manualmente na aplicação.
--
-- ADITIVA e IDEMPOTENTE: `create table if not exists`, `create or replace`,
-- `create index if not exists`, `drop trigger if exists` + `create trigger`.
-- Rollback em 20261027090100_water_goals_and_intake_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) water_goals — meta diária de hidratação (uma linha por aluno).
-- -----------------------------------------------------------------------------
create table if not exists public.water_goals (
  user_id    uuid primary key references public.profiles (user_id) on delete cascade,
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  target_ml  integer not null check (target_ml between 250 and 20000),
  source     text not null default 'manual' check (source in ('manual', 'derived_weight', 'default')),
  updated_at timestamptz not null default now()
);

create trigger water_goals_set_updated_at
  before update on public.water_goals
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2) water_intake_logs — registros de ingestão de água (append pelo aluno).
-- -----------------------------------------------------------------------------
create table if not exists public.water_intake_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (user_id) on delete cascade,
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  amount_ml   integer not null check (amount_ml between 1 and 5000),
  occurred_on date not null default public.gamification_sp_date(now()),
  created_at  timestamptz not null default now()
);

-- Consulta quente: total do dia por aluno.
create index if not exists water_intake_logs_user_occurred_idx
  on public.water_intake_logs (user_id, occurred_on);

-- -----------------------------------------------------------------------------
-- 3) gamification_sync_water_goal — concede water_goal ao atingir a meta do dia.
-- SECURITY DEFINER + search_path vazio. CHAMA public.gamification_award (consumo
-- do motor, não duplicação). Idempotência garantida pelo motor (reference_id).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_sync_water_goal(p_user uuid, p_on date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target integer;
  v_total  integer;
begin
  -- META_AGUA_DEFAULT_ML (espelho TS lib/habitos/meta-agua.ts): sem meta
  -- cadastrada, usa 2000 ml como alvo.
  v_target := coalesce(
    (select target_ml from public.water_goals where user_id = p_user),
    2000
  );

  v_total := coalesce(
    (select sum(amount_ml)
       from public.water_intake_logs
      where user_id = p_user and occurred_on = p_on),
    0
  );

  if v_total >= v_target then
    perform public.gamification_award(
      p_user,
      'water_goal',
      'water:' || p_user || ':' || p_on,
      p_on
    );
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4) habit_water_after_change — wrapper de trigger (insert e delete).
-- Protege a concessão: uma falha de XP NUNCA bloqueia o registro de ingestão.
-- Usa coalesce(new, old) para servir aos dois triggers.
-- -----------------------------------------------------------------------------
create or replace function public.habit_water_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_on   date;
begin
  v_user := coalesce(new.user_id, old.user_id);
  v_on   := coalesce(new.occurred_on, old.occurred_on);

  begin
    perform public.gamification_sync_water_goal(v_user, v_on);
  exception when others then
    raise warning 'gamification habit_water_after_change falhou: %', sqlerrm;
  end;

  return coalesce(new, old);
end;
$$;

drop trigger if exists water_intake_logs_gamification_insert on public.water_intake_logs;
create trigger water_intake_logs_gamification_insert
  after insert on public.water_intake_logs
  for each row execute function public.habit_water_after_change();

drop trigger if exists water_intake_logs_gamification_delete on public.water_intake_logs;
create trigger water_intake_logs_gamification_delete
  after delete on public.water_intake_logs
  for each row execute function public.habit_water_after_change();
