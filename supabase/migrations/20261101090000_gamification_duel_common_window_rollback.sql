-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261101090000_gamification_duel_common_window.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
--
-- Reverte ao contrato de 20261030090300 (janela imediata na criação):
--   * restaura as 4 funções de desafio (create_duel, respond_duel, scoreboard,
--     settle) à versão de 20261030090300;
--   * drop column if exists accepted_at em gamification_challenge_members;
--   * remove a constraint gamification_challenges_coach_window e restaura
--     gamification_challenges_period à versão original (ends_on >= starts_on);
--   * reimpõe NOT NULL em starts_on/ends_on SOMENTE se não houver linhas NULL
--     (via do $$ ... if not exists ... else raise notice).
--
-- gamification_award NÃO é tocada (o forward tampouco a recriou).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.1 gamification_create_duel — versão de 20261030090300 (janela imediata).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_create_duel(
  p_friend_id     uuid,
  p_duration_days smallint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me        uuid;
  v_starts_on date;
  v_ends_on   date;
  v_challenge uuid;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  if p_duration_days not in (7, 15, 30) then
    return jsonb_build_object('status', 'invalid_duration');
  end if;

  if p_friend_id is null or p_friend_id = v_me then
    return jsonb_build_object('status', 'not_friends');
  end if;

  if not exists (
    select 1 from public.gamification_friends f
    where f.status = 'accepted'
      and least(f.requester_id, f.addressee_id) = least(v_me, p_friend_id)
      and greatest(f.requester_id, f.addressee_id) = greatest(v_me, p_friend_id)
  ) then
    return jsonb_build_object('status', 'not_friends');
  end if;

  if exists (
    select 1
    from public.gamification_challenges c
    join public.gamification_challenge_members m1 on m1.challenge_id = c.id and m1.user_id = v_me
    join public.gamification_challenge_members m2 on m2.challenge_id = c.id and m2.user_id = p_friend_id
    where c.kind = 'duel' and c.status = 'active'
  ) then
    return jsonb_build_object('status', 'duel_exists');
  end if;

  v_starts_on := public.gamification_sp_date(now());
  v_ends_on   := v_starts_on + (p_duration_days - 1);

  insert into public.gamification_challenges
    (kind, status, creator_id, tenant_id, duration_days, starts_on, ends_on)
  values ('duel', 'active', v_me, null, p_duration_days, v_starts_on, v_ends_on)
  returning id into v_challenge;

  insert into public.gamification_challenge_members (challenge_id, user_id, accepted)
  values (v_challenge, v_me, true),
         (v_challenge, p_friend_id, false);

  return jsonb_build_object('status', 'created', 'challenge_id', v_challenge);
end;
$$;

revoke all on function public.gamification_create_duel(uuid, smallint) from public;
grant execute on function public.gamification_create_duel(uuid, smallint) to authenticated;

-- -----------------------------------------------------------------------------
-- 4.2 gamification_respond_duel — versão de 20261030090300 (sem fixação de janela).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_respond_duel(
  p_challenge_id uuid,
  p_accept       boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me       uuid;
  v_status   public.challenge_status;
  v_kind     public.challenge_kind;
  v_accepted boolean;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  select c.status, c.kind, m.accepted
    into v_status, v_kind, v_accepted
  from public.gamification_challenges c
  join public.gamification_challenge_members m
    on m.challenge_id = c.id and m.user_id = v_me
  where c.id = p_challenge_id;

  if not found or v_kind <> 'duel' then
    return jsonb_build_object('status', 'forbidden');
  end if;

  if v_status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled');
  end if;

  if v_status <> 'active' then
    return jsonb_build_object('status', 'invalid');
  end if;

  if p_accept then
    if not v_accepted then
      update public.gamification_challenge_members
        set accepted = true
        where challenge_id = p_challenge_id and user_id = v_me;
    end if;
    return jsonb_build_object('status', 'accepted');
  else
    update public.gamification_challenges
      set status = 'cancelled'
      where id = p_challenge_id;
    return jsonb_build_object('status', 'cancelled');
  end if;
end;
$$;

revoke all on function public.gamification_respond_duel(uuid, boolean) from public;
grant execute on function public.gamification_respond_duel(uuid, boolean) to authenticated;

-- -----------------------------------------------------------------------------
-- 4.4 gamification_challenge_scoreboard — versão de 20261030090300 (sem window_state).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_challenge_scoreboard(p_challenge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me        uuid;
  v_c         public.gamification_challenges%rowtype;
  v_finished  boolean;
  v_linhas    jsonb;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  select * into v_c from public.gamification_challenges where id = p_challenge_id;
  if not found then
    return jsonb_build_object('status', 'forbidden');
  end if;

  if v_c.creator_id <> v_me and not exists (
    select 1 from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id and m.user_id = v_me
  ) then
    return jsonb_build_object('status', 'forbidden');
  end if;

  v_finished := (v_c.status = 'finished');

  with membros as (
    select m.user_id, m.accepted, m.result, m.final_xp
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id
  ),
  agg as (
    select ev.user_id, sum(ev.points)::int as period_xp
    from public.gamification_events ev
    where ev.occurred_on between v_c.starts_on and v_c.ends_on
    group by ev.user_id
  ),
  ranked as (
    select
      mb.user_id,
      mb.accepted,
      coalesce(agg.period_xp, 0) as points,
      row_number() over (
        order by coalesce(agg.period_xp, 0) desc, mb.user_id asc
      )::int as posicao,
      coalesce(nullif(btrim(p.full_name), ''), 'Atleta') as display_name,
      p.avatar_url,
      coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int as level,
      case when v_finished then mb.result::text else 'pending' end as result,
      case when v_finished then mb.final_xp else null end as final_xp
    from membros mb
    left join agg on agg.user_id = mb.user_id
    left join public.profiles p on p.user_id = mb.user_id
    left join public.gamification_profiles gp on gp.user_id = mb.user_id
  )
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'posicao',      r.posicao,
             'points',       r.points,
             'display_name', r.display_name,
             'avatar_url',   r.avatar_url,
             'level',        r.level,
             'user_id',      r.user_id,
             'accepted',     r.accepted,
             'result',       r.result,
             'final_xp',     r.final_xp
           ) order by r.posicao
         ), '[]'::jsonb)
  into v_linhas
  from ranked r;

  return jsonb_build_object(
    'status',      'ok',
    'challenge_id', v_c.id,
    'kind',        v_c.kind::text,
    'challenge_status', v_c.status::text,
    'starts_on',   v_c.starts_on,
    'ends_on',     v_c.ends_on,
    'title',       v_c.title,
    'goal_text',   v_c.goal_text,
    'reward_text', v_c.reward_text,
    'linhas',      v_linhas
  );
end;
$$;

revoke all on function public.gamification_challenge_scoreboard(uuid) from public;
grant execute on function public.gamification_challenge_scoreboard(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 4.5 gamification_settle_challenge — versão de 20261030090300 (ends_on antes do cancel).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_settle_challenge(p_challenge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_c           public.gamification_challenges%rowtype;
  v_today       date;
  v_both_ok     boolean;
  v_max_xp      integer;
  v_winners     integer;
  v_winner      uuid;
begin
  select * into v_c from public.gamification_challenges where id = p_challenge_id for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_c.status <> 'active' then
    return jsonb_build_object('status', v_c.status::text);
  end if;

  v_today := public.gamification_sp_date(now());
  if v_c.ends_on >= v_today then
    return jsonb_build_object('status', 'not_due');
  end if;

  if v_c.kind = 'duel' then
    select bool_and(m.accepted) into v_both_ok
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id;

    if v_both_ok is distinct from true then
      update public.gamification_challenges
        set status = 'cancelled', settled_at = now()
        where id = p_challenge_id;
      return jsonb_build_object('status', 'cancelled');
    end if;
  end if;

  update public.gamification_challenge_members m
    set final_xp = coalesce((
      select sum(ev.points)::int
      from public.gamification_events ev
      where ev.user_id = m.user_id
        and ev.occurred_on between v_c.starts_on and v_c.ends_on
    ), 0)
    where m.challenge_id = p_challenge_id;

  select max(m.final_xp) into v_max_xp
  from public.gamification_challenge_members m
  where m.challenge_id = p_challenge_id;

  select count(*) into v_winners
  from public.gamification_challenge_members m
  where m.challenge_id = p_challenge_id and m.final_xp = v_max_xp;

  if v_winners = 1 then
    select m.user_id into v_winner
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id and m.final_xp = v_max_xp;

    update public.gamification_challenge_members m
      set result = case when m.user_id = v_winner then 'won'::public.challenge_member_result
                        else 'lost'::public.challenge_member_result end
      where m.challenge_id = p_challenge_id;
  else
    update public.gamification_challenge_members m
      set result = case when m.final_xp = v_max_xp then 'tie'::public.challenge_member_result
                        else 'lost'::public.challenge_member_result end
      where m.challenge_id = p_challenge_id;
  end if;

  update public.gamification_challenges
    set status = 'finished', settled_at = now()
    where id = p_challenge_id;

  if v_winners = 1 and v_winner is not null then
    perform public.gamification_award(
      v_winner,
      'challenge_winner',
      p_challenge_id::text,
      v_c.ends_on,
      now()
    );
  end if;

  return jsonb_build_object('status', 'finished');
end;
$$;

revoke all on function public.gamification_settle_challenge(uuid) from public;
grant execute on function public.gamification_settle_challenge(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- (c) remove o carimbo de aceite.
-- -----------------------------------------------------------------------------
alter table public.gamification_challenge_members drop column if exists accepted_at;

-- -----------------------------------------------------------------------------
-- (b) restaura a constraint de período original (ends_on >= starts_on) e remove
--     a constraint coach adicionada no forward.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'gamification_challenges_coach_window'
      and conrelid = 'public.gamification_challenges'::regclass
  ) then
    alter table public.gamification_challenges
      drop constraint gamification_challenges_coach_window;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'gamification_challenges_period'
      and conrelid = 'public.gamification_challenges'::regclass
  ) then
    alter table public.gamification_challenges
      drop constraint gamification_challenges_period;
  end if;
end $$;

alter table public.gamification_challenges
  add constraint gamification_challenges_period
  check (ends_on >= starts_on) not valid;

-- -----------------------------------------------------------------------------
-- (a) reimpõe NOT NULL em starts_on/ends_on SOMENTE se não houver linhas NULL.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from public.gamification_challenges
    where starts_on is null or ends_on is null
  ) then
    alter table public.gamification_challenges alter column starts_on set not null;
    alter table public.gamification_challenges alter column ends_on   set not null;
  else
    raise notice 'Há duels com janela NULL; NOT NULL não reimposto em starts_on/ends_on. Reconcilie à mão antes.';
  end if;
end $$;
