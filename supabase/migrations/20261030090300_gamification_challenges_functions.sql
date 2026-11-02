-- =============================================================================
-- Flvxus v2 — Arena G3 (4/5): funções de DESAFIO + recriação de gamification_award.
-- Contrato: design.md §Funções (4.1..4.5) / §Ajuste em gamification_award · FEAT-001.
--
-- ORDEM DE APLICAÇÃO: depois de 20261030090000/090100/090200.
--
-- Todas as funções de desafio: SECURITY DEFINER + `set search_path = ''`,
-- schema-qualificadas, revoke all from public + grant execute to authenticated.
-- Gate do coach por account_type (D0/finding 1), NUNCA só por role.
-- tenant_id do desafio do coach vem de app_tenant_id(), NUNCA de parâmetro.
--
-- gamification_award é RECRIADA via create or replace trocando SOMENTE o ramo
-- de conquista de 0 ponto: literal 'season_champion' -> conjunto
-- ('season_champion','challenge_winner') casando a conquista por
-- rule->>'type' = p_event_type. O cálculo de XP dos tipos pontuáveis NÃO muda.
--
-- ADITIVA e IDEMPOTENTE: `create or replace`. Rollback em
-- 20261030090300_gamification_challenges_functions_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.1 gamification_create_duel(p_friend_id, p_duration_days) -> jsonb
-- Cria um desafio duel entre amigos aceitos. Membros: criador accepted=true,
-- desafiado accepted=false (precisa aceitar via 4.2 para o duelo "valer").
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
-- 4.2 gamification_respond_duel(p_challenge_id, p_accept) -> jsonb
-- Só o membro user_id=auth.uid() de um duel active. accept=true -> accepted=true;
-- accept=false -> cancela o desafio (status='cancelled'). Idempotente.
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
-- 4.3 gamification_create_coach_challenge(p_member_ids, p_duration_days, p_title,
--     p_goal_text, p_reward_text) -> jsonb
-- Painel do personal (B2B, intra-tenant). Gate por account_type (finding 1):
-- app_role()='trainer' AND account_type='professional'. tenant_id = app_tenant_id().
-- Membros deduplicados (distinct unnest, sem null), <=100, cada um aluno do tenant.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_create_coach_challenge(
  p_member_ids    uuid[],
  p_duration_days smallint,
  p_title         text,
  p_goal_text     text,
  p_reward_text   text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me        uuid;
  v_tenant    uuid;
  v_members   uuid[];
  v_valid     integer;
  v_starts_on date;
  v_ends_on   date;
  v_challenge uuid;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  -- Gate por account_type (barra o aluno autônomo, que também é role='trainer').
  if not (
    public.app_role() = 'trainer'
    and (select account_type from public.profiles where user_id = v_me) = 'professional'
  ) then
    return jsonb_build_object('status', 'forbidden');
  end if;

  if p_duration_days not in (7, 15, 30) then
    return jsonb_build_object('status', 'invalid_duration');
  end if;

  v_tenant := public.app_tenant_id();
  if v_tenant is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  -- Dedupe + remoção de NULLs antes de validar (finding 8).
  v_members := array(
    select distinct u from unnest(coalesce(p_member_ids, '{}'::uuid[])) as u where u is not null
  );

  if cardinality(v_members) = 0 then
    return jsonb_build_object('status', 'no_members');
  end if;
  if cardinality(v_members) > 100 then
    return jsonb_build_object('status', 'too_many_members');
  end if;

  -- Validação única (finding 3): cada id é aluno (role='student') do tenant do
  -- professor (tenant_id = v_tenant). Conta e compara com o total; tudo ou nada.
  select count(*) into v_valid
  from unnest(v_members) as mid
  where exists (
    select 1 from public.profiles p
    where p.user_id = mid
      and p.role = 'student'
      and p.tenant_id = v_tenant
  );

  if v_valid <> cardinality(v_members) then
    return jsonb_build_object('status', 'member_outside_tenant');
  end if;

  v_starts_on := public.gamification_sp_date(now());
  v_ends_on   := v_starts_on + (p_duration_days - 1);

  insert into public.gamification_challenges
    (kind, status, creator_id, tenant_id, title, goal_text, reward_text,
     duration_days, starts_on, ends_on)
  values ('coach', 'active', v_me, v_tenant, p_title, p_goal_text, p_reward_text,
          p_duration_days, v_starts_on, v_ends_on)
  returning id into v_challenge;

  -- Alunos inseridos já accepted=true (participação definida pelo professor).
  insert into public.gamification_challenge_members (challenge_id, user_id, accepted)
  select v_challenge, mid, true
  from unnest(v_members) as mid;

  return jsonb_build_object('status', 'created', 'challenge_id', v_challenge);
end;
$$;

revoke all on function public.gamification_create_coach_challenge(uuid[], smallint, text, text, text) from public;
grant execute on function public.gamification_create_coach_challenge(uuid[], smallint, text, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 4.4 gamification_challenge_scoreboard(p_challenge_id) -> jsonb
-- Placar ao vivo / final. Autorização interna: auth.uid() é creator OU membro.
-- points/posicao SEMPRE recomputados do ledger (sum(points) no período dia-SP),
-- independentemente de status. final_xp/result (cache) SÓ lidos quando finished.
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

  -- Só o criador ou um membro enxerga o placar (projeta XP dos OUTROS membros).
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
-- 4.5 gamification_settle_challenge(p_challenge_id) -> jsonb — apuração.
-- Caminho de ESCRITA idempotente. Só active com ends_on < dia-SP(now()). Duel
-- sem ambos aceitos -> cancelled. Agrega final_xp do ledger; empate -> tie (sem
-- medalha); vencedor único -> won + perform gamification_award(... 'challenge_winner').
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

  v_today := public.gamification_sp_date(now());
  if v_c.ends_on >= v_today then
    return jsonb_build_object('status', 'not_due');
  end if;

  -- Duel precisa de ambos aceitos; se o oponente nunca aceitou, cancela.
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
-- RECRIAÇÃO de public.gamification_award — generaliza o ramo de CONQUISTA de 0
-- ponto de 'season_champion' (literal) para o conjunto
-- ('season_champion','challenge_winner'), casando a conquista por
-- rule->>'type' = p_event_type. Corpo copiado de 20261026090100 com alteração
-- SOMENTE neste ramo; o cálculo de XP dos tipos pontuáveis NÃO muda.
-- =============================================================================
create or replace function public.gamification_award(
  p_user         uuid,
  p_event_type   text,
  p_reference_id text,
  p_occurred_on  date,
  p_earned_at    timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id   uuid;
  v_base_points integer;
  v_daily_cap   smallint;
  v_active      boolean;
  v_season_id   uuid;
  v_prev_season uuid;
  v_prev_period text;
  v_day_count   integer;
  v_event_id    uuid;
  v_total_xp    integer;
  v_stats_key   text;
  a             record;
begin
  -- Tenant do usuário (necessário para o evento e a RLS de ranking).
  select tenant_id into v_tenant_id
  from public.profiles
  where user_id = p_user;

  if v_tenant_id is null then
    return;
  end if;

  -- (1) Semeadura LAZY do perfil (MEDIUM-3).
  insert into public.gamification_profiles (user_id, tenant_id)
  values (p_user, v_tenant_id)
  on conflict (user_id) do nothing;

  -- Conquistas de 0 ponto (não são tipos pontuáveis do catálogo): registra um
  -- evento de 0 ponto para idempotência/auditoria e concede a conquista casada
  -- por rule->>'type' = p_event_type. Generalizado de 'season_champion' para o
  -- conjunto ('season_champion','challenge_winner').
  if p_event_type in ('season_champion', 'challenge_winner') then
    v_season_id := public.gamification_resolve_season(p_occurred_on);

    insert into public.gamification_events
      (user_id, tenant_id, event_type, points, reference_id, season_id, occurred_on)
    values (p_user, v_tenant_id, p_event_type, 0, p_reference_id, v_season_id, p_occurred_on)
    on conflict (user_id, event_type, reference_id) do nothing
    returning id into v_event_id;

    if v_event_id is null then
      return; -- já concedido
    end if;

    for a in
      select id from public.achievements
      where tenant_id = v_tenant_id
        and rule ->> 'type' = p_event_type
    loop
      insert into public.user_achievements (tenant_id, student_id, achievement_id, earned_at)
      values (v_tenant_id, p_user, a.id, p_earned_at)
      on conflict (student_id, achievement_id) do nothing;
    end loop;

    return;
  end if;

  -- (2) Tipo do catálogo: inexistente/inativo => no-op.
  select base_points, daily_cap, active
    into v_base_points, v_daily_cap, v_active
  from public.gamification_event_types
  where event_type = p_event_type;

  if v_base_points is null or v_active is distinct from true then
    return;
  end if;

  -- (3) Virada de temporada (MEDIUM-2): se a temporada resolvida difere da do
  -- último evento do usuário, fecha a anterior e concede season_champion.
  v_season_id := public.gamification_resolve_season(p_occurred_on);

  select e.season_id into v_prev_season
  from public.gamification_events e
  where e.user_id = p_user
    and e.season_id is not null
    and e.season_id <> v_season_id
  order by e.created_at desc
  limit 1;

  if v_prev_season is not null then
    select period_key into v_prev_period
    from public.gamification_seasons
    where id = v_prev_season;

    if v_prev_period is not null then
      perform public.gamification_close_season_and_award(v_prev_period);
    end if;
  end if;

  -- (4) Limite diário por (user, type, occurred_on).
  select count(*) into v_day_count
  from public.gamification_events
  where user_id = p_user
    and event_type = p_event_type
    and occurred_on = p_occurred_on;

  if v_day_count >= v_daily_cap then
    return; -- excedeu o teto do dia: não pontua
  end if;

  -- (5) Evento novo (idempotência estrutural).
  insert into public.gamification_events
    (user_id, tenant_id, event_type, points, reference_id, season_id, occurred_on)
  values (p_user, v_tenant_id, p_event_type, v_base_points, p_reference_id, v_season_id, p_occurred_on)
  on conflict (user_id, event_type, reference_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return; -- já pontuado
  end if;

  -- (6) Atualiza o cache derivado (XP/nível/stats).
  v_stats_key := case p_event_type
    when 'workout_completed'  then 'workouts'
    when 'load_progression'   then 'prs'
    when 'physical_evolution' then 'assessments'
    else null
  end;

  update public.gamification_profiles
    set total_xp   = total_xp + v_base_points,
        level      = public.gamification_level_for_xp(total_xp + v_base_points),
        stats      = case when v_stats_key is null then stats
                       else jsonb_set(
                              stats,
                              array[v_stats_key],
                              to_jsonb(coalesce((stats ->> v_stats_key)::int, 0) + 1)
                            )
                     end,
        updated_at = now()
    where user_id = p_user
    returning total_xp into v_total_xp;

  -- (7) Concede conquistas elegíveis do tenant (carimbo HIGH-1 em earned_at).
  for a in
    select id, rule
    from public.achievements
    where tenant_id = v_tenant_id
      and rule is not null
  loop
    if (
      -- primeira sessão concluída (um único workout_completed basta)
      (a.rule ->> 'type' = 'first_session'
        and p_event_type = 'workout_completed'
        and coalesce((select (stats ->> 'workouts')::int
                        from public.gamification_profiles
                        where user_id = p_user), 0) = 1)
      -- 3 treinos na mesma semana-SP (sessions_in_week)
      or (a.rule ->> 'type' = 'sessions_in_week'
        and p_event_type = 'workout_completed'
        and (select count(*)
               from public.gamification_events e
               where e.user_id = p_user
                 and e.event_type = 'workout_completed'
                 and date_trunc('week', e.occurred_on)
                     = date_trunc('week', p_occurred_on))
            >= coalesce((a.rule ->> 'count')::int, 1))
      -- streak de dias consecutivos (current_streak já recalculada no fecho)
      or (a.rule ->> 'type' = 'streak_days'
        and coalesce((select current_streak
                        from public.gamification_profiles
                        where user_id = p_user), 0)
            >= coalesce((a.rule ->> 'days')::int, 1))
      -- XP total (points_100 reapontada)
      or (a.rule ->> 'type' = 'xp_total'
        and coalesce(v_total_xp, 0) >= coalesce((a.rule ->> 'total')::int, 0))
      -- PR detectado
      or (a.rule ->> 'type' = 'pr_detected'
        and p_event_type = 'load_progression')
    ) then
      insert into public.user_achievements (tenant_id, student_id, achievement_id, earned_at)
      values (v_tenant_id, p_user, a.id, p_earned_at)
      on conflict (student_id, achievement_id) do nothing;
    end if;
  end loop;
end;
$$;
