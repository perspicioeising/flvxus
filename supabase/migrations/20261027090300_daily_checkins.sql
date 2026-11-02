-- =============================================================================
-- Flvxus v2 — Hábitos G2 (4/5): check-in diário.
-- Contrato: FEAT-001 · consome o motor da Arena (gamification_award).
--
-- ORDEM DE APLICAÇÃO: depois de 20261027090000_habit_event_types.sql (o tipo
-- daily_checkin precisa estar ativo).
--
-- O QUE FAZ:
--   1) daily_checkins — um check-in por aluno por dia-SP (unique).
--   2) habit_checkin_after_insert — wrapper de trigger protegido que concede
--      daily_checkin CHAMANDO public.gamification_award (consumo do motor).
--      Apenas after INSERT (check-in não é revertido via trigger de delete).
--
-- ADITIVA e IDEMPOTENTE: `create table if not exists`, `create or replace`,
-- `drop trigger if exists` + `create trigger`.
-- Rollback em 20261027090300_daily_checkins_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) daily_checkins — check-in diário (único por aluno/dia-SP).
-- -----------------------------------------------------------------------------
create table if not exists public.daily_checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (user_id) on delete cascade,
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  occurred_on date not null default public.gamification_sp_date(now()),
  created_at  timestamptz not null default now(),
  unique (user_id, occurred_on)
);

-- -----------------------------------------------------------------------------
-- 2) habit_checkin_after_insert — wrapper de trigger (apenas insert).
-- Protege a concessão: uma falha de XP NUNCA bloqueia o check-in.
-- -----------------------------------------------------------------------------
create or replace function public.habit_checkin_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform public.gamification_award(
      new.user_id,
      'daily_checkin',
      'checkin:' || new.user_id || ':' || new.occurred_on,
      new.occurred_on
    );
  exception when others then
    raise warning 'gamification habit_checkin_after_insert falhou: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists daily_checkins_gamification_insert on public.daily_checkins;
create trigger daily_checkins_gamification_insert
  after insert on public.daily_checkins
  for each row execute function public.habit_checkin_after_insert();
