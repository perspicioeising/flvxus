-- =============================================================================
-- Flvxus v2 — Arena G3 (3/5): funções SOCIAIS — amizade, convite, ranking.
-- Contrato: design.md §Funções (3.1..3.4) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO: depois de 20261030090000 (tabelas) e 20261030090100 (RLS).
--
-- Todas: SECURITY DEFINER + `set search_path = ''`, schema-qualificadas, e ao
-- fim revoke all from public + grant execute to authenticated (padrão G1/G2).
-- Predicado de ATLETA social (D0, por account_type, NUNCA só por role):
--   role = 'student' OR (role = 'trainer' AND account_type = 'self_managed').
--
-- ADITIVA e IDEMPOTENTE: `create or replace`. Rollback em
-- 20261030090200_gamification_social_functions_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 gamification_friend_request_by_handle(p_handle) -> jsonb
-- Único caminho de criação de amizade a partir de um handle. Resolve por
-- igualdade exata case-insensitive SÓ entre atletas sociais (D0). NUNCA devolve
-- o user_id do alvo nem distingue "inexistente" de "não adicionável"
-- (anti-enumeração/oráculo): todas as falhas retornam {status:'not_found'}.
-- Retorno: { status: 'sent'|'already'|'not_found', state?: 'pending'|'accepted' }
-- -----------------------------------------------------------------------------
create or replace function public.gamification_friend_request_by_handle(p_handle text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me       uuid;
  v_handle   text;
  v_target   uuid;
  v_existing public.gamification_friends%rowtype;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  v_handle := lower(btrim(coalesce(p_handle, '')));

  -- Formato inválido => mesma resposta neutra que inexistente (anti-enumeração).
  if v_handle !~ '^[a-z0-9_]{3,30}$' then
    return jsonb_build_object('status', 'not_found');
  end if;

  -- Resolve o alvo SOMENTE entre ATLETAS sociais (predicado D0). Um personal
  -- profissional (trainer + professional) NÃO é resolvido => cai em not_found.
  select p.user_id into v_target
  from public.profiles p
  where lower(p.social_handle) = v_handle
    and (
      p.role = 'student'
      or (p.role = 'trainer' and p.account_type = 'self_managed')
    );

  -- Alvo inexistente/não-atleta, ou alvo == eu => resposta neutra.
  if v_target is null or v_target = v_me then
    return jsonb_build_object('status', 'not_found');
  end if;

  -- Relação existente entre nós (qualquer direção) via o par único.
  select * into v_existing
  from public.gamification_friends f
  where least(f.requester_id, f.addressee_id) = least(v_me, v_target)
    and greatest(f.requester_id, f.addressee_id) = greatest(v_me, v_target);

  if found then
    -- Bloqueio (qualquer direção) => resposta neutra (não vaza o bloqueio).
    if v_existing.status = 'blocked' then
      return jsonb_build_object('status', 'not_found');
    end if;
    -- pending/accepted => já há conexão.
    return jsonb_build_object('status', 'already', 'state', v_existing.status::text);
  end if;

  insert into public.gamification_friends (requester_id, addressee_id, status)
  values (v_me, v_target, 'pending')
  on conflict do nothing;

  return jsonb_build_object('status', 'sent');
end;
$$;

revoke all on function public.gamification_friend_request_by_handle(text) from public;
grant execute on function public.gamification_friend_request_by_handle(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 3.2 gamification_respond_friend_request(p_request_id, p_action) -> jsonb
-- Único caminho de escrita sobre gamification_friends depois da criação.
-- p_action ∈ {accept,reject,block,unblock,remove}. Valida que auth.uid() é parte
-- da linha e que a transição é legítima. Idempotente. Transição inválida => invalid.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_respond_friend_request(
  p_request_id uuid,
  p_action     text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me  uuid;
  v_row public.gamification_friends%rowtype;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object('status', 'forbidden');
  end if;

  if p_action not in ('accept', 'reject', 'block', 'unblock', 'remove') then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into v_row
  from public.gamification_friends f
  where f.id = p_request_id
    and (f.requester_id = v_me or f.addressee_id = v_me);

  -- Linha inexistente ou não sou parte dela => forbidden (não vaza existência).
  if not found then
    return jsonb_build_object('status', 'forbidden');
  end if;

  if p_action = 'accept' then
    -- Só o addressee aceita, só de pending -> accepted.
    if v_row.status = 'accepted' then
      return jsonb_build_object('status', 'accepted'); -- idempotente
    end if;
    if v_row.status = 'pending' and v_row.addressee_id = v_me then
      update public.gamification_friends
        set status = 'accepted', responded_at = now()
        where id = v_row.id;
      return jsonb_build_object('status', 'accepted');
    end if;
    return jsonb_build_object('status', 'invalid');

  elsif p_action = 'reject' then
    -- Só o addressee, de pending -> delete.
    if v_row.status = 'pending' and v_row.addressee_id = v_me then
      delete from public.gamification_friends where id = v_row.id;
      return jsonb_build_object('status', 'removed');
    end if;
    return jsonb_build_object('status', 'invalid');

  elsif p_action = 'remove' then
    -- Qualquer um dos dois, de accepted -> delete.
    if v_row.status = 'accepted' then
      delete from public.gamification_friends where id = v_row.id;
      return jsonb_build_object('status', 'removed');
    end if;
    return jsonb_build_object('status', 'invalid');

  elsif p_action = 'block' then
    -- Qualquer um dos dois, de qualquer estado -> blocked por mim (idempotente).
    if v_row.status = 'blocked' and v_row.blocked_by = v_me then
      return jsonb_build_object('status', 'blocked');
    end if;
    update public.gamification_friends
      set status = 'blocked', blocked_by = v_me, responded_at = now()
      where id = v_row.id;
    return jsonb_build_object('status', 'blocked');

  else -- unblock
    -- Só quem bloqueou -> delete (volta a "sem relação").
    if v_row.status = 'blocked' and v_row.blocked_by = v_me then
      delete from public.gamification_friends where id = v_row.id;
      return jsonb_build_object('status', 'removed');
    end if;
    return jsonb_build_object('status', 'invalid');
  end if;
end;
$$;

revoke all on function public.gamification_respond_friend_request(uuid, text) from public;
grant execute on function public.gamification_respond_friend_request(uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 3.3 gamification_list_friends() -> jsonb
-- Lista as conexões do autenticado projetando o contrato público (D3) da
-- contraparte. Grupos: accepted / incoming / outgoing / blocked.
-- outgoing NÃO projeta dados do alvo (ainda não consentiu). Relações 'blocked'
-- por TERCEIRO contra mim são OMITIDAS de todos os grupos (finding 7): só entram
-- em 'blocked' as linhas cujo blocked_by = auth.uid() (quem EU bloqueei).
-- -----------------------------------------------------------------------------
create or replace function public.gamification_list_friends()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me       uuid;
  v_accepted jsonb;
  v_incoming jsonb;
  v_outgoing jsonb;
  v_blocked  jsonb;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object(
      'accepted', '[]'::jsonb, 'incoming', '[]'::jsonb,
      'outgoing', '[]'::jsonb, 'blocked', '[]'::jsonb
    );
  end if;

  -- accepted: contrato público do OUTRO lado + friendship_id + handle (amigo aceito).
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'friendship_id', t.id,
             'user_id',       t.other_id,
             'display_name',  coalesce(nullif(btrim(p.full_name), ''), 'Atleta'),
             'avatar_url',    p.avatar_url,
             'level',         coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int,
             'social_handle', p.social_handle
           ) order by p.full_name asc
         ), '[]'::jsonb)
  into v_accepted
  from (
    select f.id,
           case when f.requester_id = v_me then f.addressee_id else f.requester_id end as other_id
    from public.gamification_friends f
    where f.status = 'accepted'
      and (f.requester_id = v_me or f.addressee_id = v_me)
  ) t
  left join public.profiles p on p.user_id = t.other_id
  left join public.gamification_profiles gp on gp.user_id = t.other_id;

  -- incoming: solicitações pending em que EU sou o addressee; projeta o contrato
  -- público de quem me pediu (ele escolheu se revelar ao enviar).
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'request_id',   f.id,
             'user_id',      f.requester_id,
             'display_name', coalesce(nullif(btrim(p.full_name), ''), 'Atleta'),
             'avatar_url',   p.avatar_url,
             'level',        coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int
           ) order by f.created_at desc
         ), '[]'::jsonb)
  into v_incoming
  from public.gamification_friends f
  left join public.profiles p on p.user_id = f.requester_id
  left join public.gamification_profiles gp on gp.user_id = f.requester_id
  where f.status = 'pending' and f.addressee_id = v_me;

  -- outgoing: enviadas por mim (pending), SEM dados do alvo (ainda não consentiu).
  select coalesce(jsonb_agg(
           jsonb_build_object('request_id', f.id, 'status', 'pending')
           order by f.created_at desc
         ), '[]'::jsonb)
  into v_outgoing
  from public.gamification_friends f
  where f.status = 'pending' and f.requester_id = v_me;

  -- blocked: só as relações que EU bloqueei (blocked_by = eu). Sem perfil do bloqueado.
  select coalesce(jsonb_agg(
           jsonb_build_object('friendship_id', f.id)
           order by f.updated_at desc
         ), '[]'::jsonb)
  into v_blocked
  from public.gamification_friends f
  where f.status = 'blocked' and f.blocked_by = v_me
    and (f.requester_id = v_me or f.addressee_id = v_me);

  return jsonb_build_object(
    'accepted', v_accepted,
    'incoming', v_incoming,
    'outgoing', v_outgoing,
    'blocked',  v_blocked
  );
end;
$$;

revoke all on function public.gamification_list_friends() from public;
grant execute on function public.gamification_list_friends() to authenticated;

-- -----------------------------------------------------------------------------
-- 3.4 gamification_friends_leaderboard(p_period, p_season) -> jsonb
-- Ranking de amigos: conjunto FECHADO V = {eu} ∪ {amigos aceitos}. NÃO herda o
-- `having sum(points) > 0` de G2 (finding 1): LEFT JOIN do XP do período com
-- coalesce(sum(points),0) — amigos de 0 XP APARECEM. SEM p_limit/clamp: V é
-- pequeno e o produto mostra o círculo inteiro. Shape = GamificationGlobalLeaderboard.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_friends_leaderboard(
  p_period text default 'monthly',
  p_season text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me         uuid;
  v_period     text;
  v_period_key text;
  v_season_id  uuid;
  v_year       integer;
  v_total      integer;
  v_me_json    jsonb;
  v_linhas     jsonb;
begin
  v_me := auth.uid();
  if v_me is null then
    return jsonb_build_object(
      'period', 'monthly', 'period_key', to_char(public.gamification_sp_date(now()), 'YYYY-MM'),
      'total', 0, 'me', null, 'linhas', '[]'::jsonb
    );
  end if;

  v_period := case when p_period in ('monthly', 'yearly') then p_period else 'monthly' end;

  -- Conjunto fechado V = eu + amigos aceitos (não depende de ter XP).
  -- (materializado em uma CTE compartilhada por ambos os ramos abaixo)

  if v_period = 'monthly' then
    v_period_key := case
      when p_season ~ '^\d{4}-\d{2}$' then p_season
      else to_char(public.gamification_sp_date(now()), 'YYYY-MM')
    end;

    -- Resolve a season mensal por SELECT PURO (NUNCA cria season).
    select id into v_season_id
    from public.gamification_seasons
    where scope = 'monthly' and period_key = v_period_key;

    with membros as (
      select v_me as user_id
      union
      select case when f.requester_id = v_me then f.addressee_id else f.requester_id end
      from public.gamification_friends f
      where f.status = 'accepted'
        and (f.requester_id = v_me or f.addressee_id = v_me)
    ),
    agg as (
      select ev.user_id, sum(ev.points)::int as period_xp
      from public.gamification_events ev
      where v_season_id is not null and ev.season_id = v_season_id
      group by ev.user_id
    ),
    ranked as (
      select
        m.user_id,
        coalesce(agg.period_xp, 0) as period_xp,
        row_number() over (
          order by coalesce(agg.period_xp, 0) desc, m.user_id asc
        )::int as posicao,
        coalesce(nullif(btrim(p.full_name), ''), 'Atleta') as display_name,
        p.avatar_url,
        coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int as level
      from membros m
      left join agg on agg.user_id = m.user_id
      left join public.profiles p on p.user_id = m.user_id
      left join public.gamification_profiles gp on gp.user_id = m.user_id
    )
    select
      (select count(*)::int from membros),
      (
        select jsonb_build_object('posicao', r.posicao, 'points', r.period_xp, 'user_id', r.user_id)
        from ranked r where r.user_id = v_me
      ),
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'posicao',      r.posicao,
            'points',       r.period_xp,
            'display_name', r.display_name,
            'avatar_url',   r.avatar_url,
            'level',        r.level,
            'user_id',      r.user_id
          ) order by r.posicao
        )
        from ranked r
      ), '[]'::jsonb)
    into v_total, v_me_json, v_linhas;

    return jsonb_build_object(
      'period', 'monthly',
      'period_key', v_period_key,
      'total', v_total,
      'me', v_me_json,
      'linhas', v_linhas
    );
  else
    v_year := case
      when p_season ~ '^\d{4}$' then p_season::int
      else extract(year from public.gamification_sp_date(now()))::int
    end;
    v_period_key := v_year::text;

    with membros as (
      select v_me as user_id
      union
      select case when f.requester_id = v_me then f.addressee_id else f.requester_id end
      from public.gamification_friends f
      where f.status = 'accepted'
        and (f.requester_id = v_me or f.addressee_id = v_me)
    ),
    agg as (
      select ev.user_id, sum(ev.points)::int as period_xp
      from public.gamification_events ev
      where ev.occurred_on >= make_date(v_year, 1, 1)
        and ev.occurred_on <  make_date(v_year + 1, 1, 1)
      group by ev.user_id
    ),
    ranked as (
      select
        m.user_id,
        coalesce(agg.period_xp, 0) as period_xp,
        row_number() over (
          order by coalesce(agg.period_xp, 0) desc, m.user_id asc
        )::int as posicao,
        coalesce(nullif(btrim(p.full_name), ''), 'Atleta') as display_name,
        p.avatar_url,
        coalesce(public.gamification_level_for_xp(gp.total_xp), 0)::int as level
      from membros m
      left join agg on agg.user_id = m.user_id
      left join public.profiles p on p.user_id = m.user_id
      left join public.gamification_profiles gp on gp.user_id = m.user_id
    )
    select
      (select count(*)::int from membros),
      (
        select jsonb_build_object('posicao', r.posicao, 'points', r.period_xp, 'user_id', r.user_id)
        from ranked r where r.user_id = v_me
      ),
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'posicao',      r.posicao,
            'points',       r.period_xp,
            'display_name', r.display_name,
            'avatar_url',   r.avatar_url,
            'level',        r.level,
            'user_id',      r.user_id
          ) order by r.posicao
        )
        from ranked r
      ), '[]'::jsonb)
    into v_total, v_me_json, v_linhas;

    return jsonb_build_object(
      'period', 'yearly',
      'period_key', v_period_key,
      'total', v_total,
      'me', v_me_json,
      'linhas', v_linhas
    );
  end if;
end;
$$;

revoke all on function public.gamification_friends_leaderboard(text, text) from public;
grant execute on function public.gamification_friends_leaderboard(text, text) to authenticated;
