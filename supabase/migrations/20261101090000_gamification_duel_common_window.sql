-- =============================================================================
-- Flvxus v2 — Duelo: JANELA COMUM a partir do ACEITE mútuo (FEAT-001).
--
-- ORDEM DE APLICAÇÃO: depois de 20261031090000 (fix de recursão de RLS). Aplicada
-- À MÃO (sem Docker local). ADITIVA e IDEMPOTENTE (`alter ... if exists`,
-- `add column if exists`, `create or replace`). Rollback pareado em
-- 20261101090000_gamification_duel_common_window_rollback.sql.
--
-- CONTRATO (banco + tipos) de que a UX (FEAT-002) depende:
--   * O duelo nasce SEM janela (starts_on/ends_on NULL); duration_days é
--     persistido na criação. A janela comum só é fixada quando AMBOS aceitam
--     (gamification_respond_duel), a partir do dia-SP do segundo aceite:
--       starts_on = dia-SP(now()), ends_on = starts_on + (duration_days - 1).
--   * gamification_challenge_members ganha accepted_at (date, nullable): carimbo
--     do aceite de cada membro.
--   * O scoreboard ganha a chave aditiva window_state ('pending'|'active'|'finished').
--     Enquanto pendente (janela NULL) o placar não agrega o ledger (points=0),
--     mas MANTÉM o mesmo pipeline de ranqueamento (ordem determinística).
--   * settle: duelo sem ambos aceitos OU sem janela -> cancelled (ANTES de
--     comparar ends_on, que seria indefinido com NULL).
--
-- Desafios 'coach' continuam com janela imediata (NOT NULL garantido por check).
-- gamification_award NÃO é recriada aqui (segue concedendo 'challenge_winner'
-- como evento de 0 ponto, idempotente — filosofia antifraude: desafio NUNCA
-- gera XP, só reconhecimento).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- (a) Nulabilidade da janela em gamification_challenges.
-- -----------------------------------------------------------------------------
alter table public.gamification_challenges alter column starts_on drop not null;
alter table public.gamification_challenges alter column ends_on   drop not null;

-- -----------------------------------------------------------------------------
-- (b) Constraint de período: ou ambos NULL (duelo ainda não aceito por ambos),
--     ou ambos definidos com ends_on >= starts_on. Coach SEMPRE com janela.
--     Drop guardado por catálogo (pg_constraint) + recreate NOT VALID (as linhas
--     legadas são reconciliadas à mão; ver update comentado no fim).
-- -----------------------------------------------------------------------------
do $$
begin
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
  check (
    (starts_on is null and ends_on is null)
    or (starts_on is not null and ends_on is not null and ends_on >= starts_on)
  ) not valid;

alter table public.gamification_challenges
  add constraint gamification_challenges_coach_window
  check (
    kind <> 'coach'
    or (starts_on is not null and ends_on is not null)
  ) not valid;

-- -----------------------------------------------------------------------------
-- (c) Carimbo de aceite por membro.
-- -----------------------------------------------------------------------------
alter table public.gamification_challenge_members
  add column if not exists accepted_at date;

-- -----------------------------------------------------------------------------
-- 4.1 gamification_create_duel — nasce SEM janela (starts_on/ends_on NULL).
-- duration_days persistido; criador accepted=true/accepted_at=hoje, convidado
-- accepted=false/accepted_at=null. Validações preservadas.
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

  -- Amizade aceita entre nós (qualquer direção).
  if not exists (
    select 1 from public.gamification_friends f
    where f.status = 'accepted'
      and least(f.requester_id, f.addressee_id) = least(v_me, p_friend_id)
      and greatest(f.requester_id, f.addressee_id) = greatest(v_me, p_friend_id)
  ) then
    return jsonb_build_object('status', 'not_friends');
  end if;

  -- Não pode haver duelo active já existente entre os dois.
  if exists (
    select 1
    from public.gamification_challenges c
    join public.gamification_challenge_members m1 on m1.challenge_id = c.id and m1.user_id = v_me
    join public.gamification_challenge_members m2 on m2.challenge_id = c.id and m2.user_id = p_friend_id
    where c.kind = 'duel' and c.status = 'active'
  ) then
    return jsonb_build_object('status', 'duel_exists');
  end if;

  -- Duelo nasce SEM janela: ela é fixada no aceite mútuo (4.2).
  insert into public.gamification_challenges
    (kind, status, creator_id, tenant_id, duration_days, starts_on, ends_on)
  values ('duel', 'active', v_me, null, p_duration_days, null, null)
  returning id into v_challenge;

  insert into public.gamification_challenge_members (challenge_id, user_id, accepted, accepted_at)
  values (v_challenge, v_me, true, public.gamification_sp_date(now())),
         (v_challenge, p_friend_id, false, null);

  return jsonb_build_object('status', 'created', 'challenge_id', v_challenge);
end;
$$;

revoke all on function public.gamification_create_duel(uuid, smallint) from public;
grant execute on function public.gamification_create_duel(uuid, smallint) to authenticated;

-- -----------------------------------------------------------------------------
-- 4.2 gamification_respond_duel — aceite carimba accepted_at; quando AMBOS
-- aceitam e a janela ainda é NULL, fixa a janela comum a partir do dia-SP do
-- segundo aceite (idempotente via `where ... starts_on is null`). Recusa cancela.
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
  v_both_ok  boolean;
  v_start    date;
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

  -- Idempotência: já cancelado / já aceito convergem sem erro.
  if v_status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled');
  end if;

  if v_status <> 'active' then
    return jsonb_build_object('status', 'invalid');
  end if;

  if p_accept then
    if not v_accepted then
      update public.gamification_challenge_members
        set accepted = true,
            accepted_at = public.gamification_sp_date(now())
        where challenge_id = p_challenge_id and user_id = v_me;
    end if;

    -- Com ambos aceitos, fixa a janela comum (só na primeira vez: janela NULL).
    select bool_and(m.accepted) into v_both_ok
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id;

    if v_both_ok is true then
      v_start := public.gamification_sp_date(now());
      update public.gamification_challenges
        set starts_on = v_start,
            ends_on   = v_start + (duration_days - 1)
        where id = p_challenge_id and starts_on is null;
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
-- 4.4 gamification_challenge_scoreboard — ramifica por janela NULL. Pendente
-- (janela NULL) => window_state='pending', NÃO agrega o ledger (points=0),
-- starts_on/ends_on NULL; MESMO pipeline de ranqueamento (row_number) para
-- ordem determinística. Com janela => comportamento atual; window_state =
-- 'finished' quando status='finished', senão 'active'. Chave window_state
-- ADITIVA (todas as demais preservadas).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_challenge_scoreboard(p_challenge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me           uuid;
  v_c            public.gamification_challenges%rowtype;
  v_finished     boolean;
  v_pending      boolean;
  v_window_state text;
  v_linhas       jsonb;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  select * into v_c from public.gamification_challenges where id = p_challenge_id;
  if not found then
    return jsonb_build_object('status', 'forbidden');
  end if;

  -- Só o criador ou um membro enxerga o placar (projeta XP dos OUTROS membros).
  if v_c.creator_id <> v_me and not exists (
    select 1 from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id and m.user_id = v_me
  ) then
    return jsonb_build_object('status', 'forbidden');
  end if;

  v_pending  := (v_c.starts_on is null);
  v_finished := (v_c.status = 'finished');
  v_window_state := case
    when v_pending  then 'pending'
    when v_finished then 'finished'
    else 'active'
  end;

  with membros as (
    select m.user_id, m.accepted, m.result, m.final_xp
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id
  ),
  agg as (
    -- Janela pendente => sem agregação (todos com 0 ponto).
    select ev.user_id, sum(ev.points)::int as period_xp
    from public.gamification_events ev
    where not v_pending
      and ev.occurred_on between v_c.starts_on and v_c.ends_on
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
      -- cache do resultado SÓ quando finished; senão neutro.
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
    'window_state', v_window_state,
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
-- 4.5 gamification_settle_challenge — reordenado: para kind='duel', se a janela
-- é NULL (nunca houve aceite mútuo) OU bool_and(accepted) não é true, cancela
-- ANTES de comparar ends_on < hoje (que seria indefinido com ends_on NULL). O
-- resto (agregação, vencedor único vs empate, award 'challenge_winner' só ao
-- vencedor único) é idêntico. gamification_award NÃO é recriada.
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

  -- Idempotência: já liquidado/cancelado.
  if v_c.status <> 'active' then
    return jsonb_build_object('status', v_c.status::text);
  end if;

  -- Duel sem janela (aceite mútuo nunca ocorreu) OU sem ambos aceitos -> cancela.
  -- ANTES de comparar ends_on (indefinido com janela NULL).
  if v_c.kind = 'duel' then
    select bool_and(m.accepted) into v_both_ok
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id;

    if v_c.starts_on is null or v_both_ok is distinct from true then
      update public.gamification_challenges
        set status = 'cancelled', settled_at = now()
        where id = p_challenge_id;
      return jsonb_build_object('status', 'cancelled');
    end if;
  end if;

  v_today := public.gamification_sp_date(now());
  if v_c.ends_on >= v_today then
    return jsonb_build_object('status', 'not_due');
  end if;

  -- Agrega final_xp de cada membro a partir do ledger (período dia-SP).
  update public.gamification_challenge_members m
    set final_xp = coalesce((
      select sum(ev.points)::int
      from public.gamification_events ev
      where ev.user_id = m.user_id
        and ev.occurred_on between v_c.starts_on and v_c.ends_on
    ), 0)
    where m.challenge_id = p_challenge_id;

  -- Maior final_xp e quantos o atingem (detecta empate).
  select max(m.final_xp) into v_max_xp
  from public.gamification_challenge_members m
  where m.challenge_id = p_challenge_id;

  select count(*) into v_winners
  from public.gamification_challenge_members m
  where m.challenge_id = p_challenge_id and m.final_xp = v_max_xp;

  if v_winners = 1 then
    -- Vencedor único: won + lost para os demais.
    select m.user_id into v_winner
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id and m.final_xp = v_max_xp;

    update public.gamification_challenge_members m
      set result = case when m.user_id = v_winner then 'won'::public.challenge_member_result
                        else 'lost'::public.challenge_member_result end
      where m.challenge_id = p_challenge_id;
  else
    -- Empate real no topo: topo recebe tie; abaixo, lost. Sem medalha.
    update public.gamification_challenge_members m
      set result = case when m.final_xp = v_max_xp then 'tie'::public.challenge_member_result
                        else 'lost'::public.challenge_member_result end
      where m.challenge_id = p_challenge_id;
  end if;

  update public.gamification_challenges
    set status = 'finished', settled_at = now()
    where id = p_challenge_id;

  -- Medalha só ao vencedor único, pelo motor (evento de 0 ponto, idempotente).
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

-- =============================================================================
-- RECONCILIAÇÃO OPCIONAL (COMENTADA — NÃO EXECUTADA). Para duels legados active
-- sem aceite mútuo que porventura já tenham janela preenchida: zerar a janela
-- para que voltem a depender do aceite. Avalie caso a caso antes de aplicar.
--
-- update public.gamification_challenges c
--   set starts_on = null, ends_on = null
--   where c.kind = 'duel'
--     and c.status = 'active'
--     and exists (
--       select 1 from public.gamification_challenge_members m
--       where m.challenge_id = c.id and m.accepted = false
--     );
-- =============================================================================
