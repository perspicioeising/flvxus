-- =============================================================================
-- Flvxus — Agenda Fase 1 (funções): escrita de appointments + trigger de desvínculo.
-- Design: .agents/tasks/agenda-fase1/design.md §5.2, §6, §9 (+ §17 M2, M3).
-- APLICADO À MÃO. REQUER 20261107090100_agenda_core.sql.
-- IDEMPOTENTE: create or replace, drop trigger if exists + create trigger.
-- Rollback: 20261107090200_agenda_functions_rollback.sql
--
-- Toda escrita em appointments passa por aqui (a RLS só tem SELECT). Funções
-- SECURITY DEFINER com search_path vazio; erros são `P0001` com message = código:
--   agenda_forbidden | agenda_student_invalid | agenda_past |
--   agenda_invalid_occurrence | agenda_immutable | agenda_invalid_range
-- Todos os cálculos de dia/hora de parede usam appointments.tz da LINHA (mestre),
-- nunca profiles.timezone de quem edita. Sem DELETE: cancelar = status 'canceled'.
-- Auxiliares internos (agenda_caller, agenda_check_fields, agenda_can_manage,
-- agenda_occurrence_on, agenda_is_occurrence, agenda_next_occurrence e o trigger)
-- NÃO são concedidos a authenticated: só as 3 funções públicas
-- (agenda_create/agenda_update/agenda_cancel) são chamáveis via RPC.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Auxiliar: perfil do chamador (falha se ausente ou desativado).
-- -----------------------------------------------------------------------------
create or replace function public.agenda_caller()
returns public.profiles
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me public.profiles;
begin
  select * into v_me from public.profiles where user_id = auth.uid();
  if not found or v_me.deactivated_at is not null then
    raise exception 'agenda_forbidden' using errcode = 'P0001';
  end if;
  return v_me;
end;
$$;

-- -----------------------------------------------------------------------------
-- Auxiliar: validações de texto e intervalo (espelham os CHECKs; erro amigável).
-- -----------------------------------------------------------------------------
create or replace function public.agenda_check_fields(
  p_kind      public.appointment_kind,
  p_title     text,
  p_notes     text,
  p_location  text,
  p_starts_at timestamptz,
  p_ends_at   timestamptz
)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_starts_at is null or p_ends_at is null
     or p_ends_at <= p_starts_at
     or p_ends_at - p_starts_at > interval '24 hours' then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;
  if p_notes is not null and length(p_notes) > 1000 then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;
  if p_location is not null and length(p_location) > 200 then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;
  if p_kind in ('personal', 'block') then
    if p_title is null or length(btrim(p_title)) not between 1 and 120 then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
  elsif p_title is not null and length(p_title) > 120 then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Auxiliar: o chamador pode editar/cancelar esta linha?
--  - dono (owner_id) sempre; personal/block SÓ o dono.
--  - atendimento de terceiro: master do tenant OU o próprio professor do
--    atendimento (M3: módulo 'agenda' aberto dá só visibilidade, não edição).
-- -----------------------------------------------------------------------------
create or replace function public.agenda_can_manage(
  p_row public.appointments,
  p_me  public.profiles
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_row.owner_id = p_me.user_id then true
    when p_row.kind in ('personal', 'block') then false
    else p_me.role = 'trainer'
         and p_me.tenant_id = p_row.tenant_id
         and (coalesce(p_me.is_tenant_master, false) or p_row.trainer_id = p_me.user_id)
  end;
$$;

-- -----------------------------------------------------------------------------
-- agenda_occurrence_on(série, data) — a data (local, no tz do mestre) é
-- ocorrência da regra? Mesma semântica do expansor TS (§6.2).
-- -----------------------------------------------------------------------------
create or replace function public.agenda_occurrence_on(p_series uuid, p_date date)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  m       public.appointments;
  v_first date;
begin
  select * into m from public.appointments where id = p_series;
  if not found or m.recur_freq is null or m.status = 'canceled' or p_date is null then
    return false;
  end if;
  v_first := (m.starts_at at time zone m.tz)::date;
  if p_date < v_first then
    return false;
  end if;
  if m.recur_until is not null and p_date > m.recur_until then
    return false;
  end if;
  if m.recur_freq = 'daily' then
    return true;
  elsif m.recur_freq = 'weekly' then
    return extract(dow from p_date)::smallint = any (m.recur_weekdays);
  elsif m.recur_freq = 'monthly' then
    return extract(day from p_date) = extract(day from v_first);
  end if;
  return false;
end;
$$;

-- agenda_is_occurrence(id, data) — aceita o id do mestre OU de um override.
create or replace function public.agenda_is_occurrence(p_id uuid, p_date date)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select public.agenda_occurrence_on(coalesce(a.series_id, a.id), p_date)
       from public.appointments a where a.id = p_id),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- agenda_next_occurrence(série, após) — data local (tz do mestre) da primeira
-- ocorrência cujo instante é > p_after, respeitando recur_until. Busca limitada:
-- diária 2 dias, semanal 8 semanas, mensal ~14 meses. null se não houver.
-- Ignora mestre cancelado.
-- -----------------------------------------------------------------------------
create or replace function public.agenda_next_occurrence(p_series uuid, p_after timestamptz)
returns date
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  m       public.appointments;
  v_time  time;
  v_start date;
  v_d     date;
  v_limit int;
  i       int;
begin
  select * into m from public.appointments where id = p_series;
  if not found or m.recur_freq is null or m.status = 'canceled' then
    return null;
  end if;
  v_time  := (m.starts_at at time zone m.tz)::time;
  v_start := greatest((m.starts_at at time zone m.tz)::date, (p_after at time zone m.tz)::date);
  v_limit := case m.recur_freq when 'daily' then 2 when 'weekly' then 56 else 430 end;
  for i in 0 .. v_limit loop
    v_d := v_start + i;
    if m.recur_until is not null and v_d > m.recur_until then
      return null;
    end if;
    if public.agenda_occurrence_on(p_series, v_d)
       and ((v_d + v_time) at time zone m.tz) > p_after then
      return v_d;
    end if;
  end loop;
  return null;
end;
$$;

-- -----------------------------------------------------------------------------
-- agenda_create — cria compromisso (avulso ou mestre de série).
-- -----------------------------------------------------------------------------
create or replace function public.agenda_create(
  p_kind           public.appointment_kind,
  p_student_id     uuid,
  p_title          text,
  p_notes          text,
  p_location       text,
  p_starts_at      timestamptz,
  p_ends_at        timestamptz,
  p_recur_freq     text,
  p_recur_weekdays smallint[],
  p_recur_until    date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me       public.profiles;
  v_student  public.profiles;
  v_title    text := nullif(btrim(p_title), '');
  v_weekdays smallint[];
  v_first    date;
  v_id       uuid;
begin
  v_me := public.agenda_caller();
  perform public.agenda_check_fields(p_kind, v_title, p_notes, p_location, p_starts_at, p_ends_at);

  if p_kind = 'personal' then
    if p_student_id is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
  else
    -- block e atendimentos: só professor profissional.
    if not (v_me.role = 'trainer' and v_me.account_type = 'professional') then
      raise exception 'agenda_forbidden' using errcode = 'P0001';
    end if;
    if p_kind = 'block' then
      if p_student_id is not null then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
    else
      if p_student_id is null then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
      select * into v_student from public.profiles where user_id = p_student_id;
      if not found
         or v_student.role <> 'student'
         or v_student.tenant_id <> v_me.tenant_id
         or coalesce(v_student.status::text, '') not in ('active', 'pending') then
        raise exception 'agenda_student_invalid' using errcode = 'P0001';
      end if;
      -- mesma regra do profiles_select (a função ignora RLS, então replica).
      if not (
        coalesce(v_me.is_tenant_master, false)
        or public.app_module_is_open('students')
        or v_student.trainer_id = v_me.user_id
      ) then
        raise exception 'agenda_student_invalid' using errcode = 'P0001';
      end if;
    end if;
  end if;

  -- Recorrência (relógio de parede no fuso do criador).
  v_first := (p_starts_at at time zone v_me.timezone)::date;
  if p_recur_freq is null then
    if p_recur_weekdays is not null or p_recur_until is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
  else
    if p_recur_freq not in ('daily', 'weekly', 'monthly') then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    if p_recur_freq = 'weekly' then
      if p_recur_weekdays is null or cardinality(p_recur_weekdays) = 0 then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
      select array_agg(distinct x order by x) into v_weekdays from unnest(p_recur_weekdays) x;
      if exists (select 1 from unnest(v_weekdays) x where x is null or x not between 0 and 6)
         or not (extract(dow from v_first)::smallint = any (v_weekdays)) then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
    elsif p_recur_weekdays is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    if p_recur_until is not null and p_recur_until < v_first then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
  end if;

  insert into public.appointments (
    tenant_id, owner_id, kind, trainer_id, student_id, title, notes, location,
    starts_at, ends_at, status, tz, recur_freq, recur_weekdays, recur_until
  ) values (
    v_me.tenant_id,
    v_me.user_id,
    p_kind,
    case when p_kind in ('personal', 'block') then null else v_me.user_id end,
    case when p_kind in ('personal', 'block') then null else p_student_id end,
    v_title, p_notes, p_location,
    p_starts_at, p_ends_at, 'scheduled', v_me.timezone,
    p_recur_freq, v_weekdays, p_recur_until
  ) returning id into v_id;

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- agenda_update — edita (escopos occurrence | following | all; §6.3 + M2).
--  M2: following/all só mudam HORA DE PAREDE e texto; a data local de p_starts_at
--      tem de ser a da ocorrência D (senão agenda_invalid_range). Mudar de dia =
--      escopo occurrence, ou cancelar e criar outro.
--  p_id pode ser o mestre ou um override; p_original_date = D (tz da série).
--  Retorna o id da linha criada/alterada.
-- -----------------------------------------------------------------------------
create or replace function public.agenda_update(
  p_id             uuid,
  p_scope          text,
  p_original_date  date,
  p_title          text,
  p_notes          text,
  p_location       text,
  p_starts_at      timestamptz,
  p_ends_at        timestamptz,
  p_recur_freq     text,
  p_recur_weekdays smallint[],
  p_recur_until    date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me        public.profiles;
  v           public.appointments;
  m           public.appointments;
  o           public.appointments;
  v_title     text := nullif(btrim(p_title), '');
  v_d         date;
  v_cut       date;
  v_first     date;
  v_occ_start timestamptz;
  v_occ_end   timestamptz;
  v_new_start timestamptz;
  v_new_end   timestamptz;
  v_freq      text;
  v_wd        smallint[];
  v_until     date;
  v_new_id    uuid;
begin
  v_me := public.agenda_caller();
  if p_scope is null or p_scope not in ('occurrence', 'following', 'all') then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;

  select * into v from public.appointments where id = p_id for update;
  if not found or not public.agenda_can_manage(v, v_me) then
    raise exception 'agenda_forbidden' using errcode = 'P0001';
  end if;
  if v.status <> 'scheduled' then
    raise exception 'agenda_immutable' using errcode = 'P0001';
  end if;
  perform public.agenda_check_fields(v.kind, v_title, p_notes, p_location, p_starts_at, p_ends_at);

  -- Avulso: atualiza a própria linha (o escopo é irrelevante).
  if v.series_id is null and v.recur_freq is null then
    if p_recur_freq is not null or p_recur_weekdays is not null or p_recur_until is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    if v.ends_at < now() then
      raise exception 'agenda_past' using errcode = 'P0001';
    end if;
    update public.appointments
       set title = v_title, notes = p_notes, location = p_location,
           starts_at = p_starts_at, ends_at = p_ends_at
     where id = v.id;
    return v.id;
  end if;

  -- Override: occurrence edita a própria linha; demais escopos agem no mestre.
  if v.series_id is not null then
    if p_scope = 'occurrence' then
      if p_recur_freq is not null or p_recur_weekdays is not null or p_recur_until is not null then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
      if v.ends_at < now() then
        raise exception 'agenda_past' using errcode = 'P0001';
      end if;
      update public.appointments
         set title = v_title, notes = p_notes, location = p_location,
             starts_at = p_starts_at, ends_at = p_ends_at
       where id = v.id;
      return v.id;
    end if;
    v_d := v.original_date;
    select * into m from public.appointments where id = v.series_id for update;
  else
    m := v;
    v_d := p_original_date;
  end if;

  -- Mestre da série.
  if m.status <> 'scheduled' then
    raise exception 'agenda_immutable' using errcode = 'P0001';
  end if;
  if v_d is null or not public.agenda_occurrence_on(m.id, v_d) then
    raise exception 'agenda_invalid_occurrence' using errcode = 'P0001';
  end if;
  v_occ_start := (v_d + (m.starts_at at time zone m.tz)::time) at time zone m.tz;
  v_occ_end   := v_occ_start + (m.ends_at - m.starts_at);

  select * into o from public.appointments where series_id = m.id and original_date = v_d;
  if o.id is not null then
    if o.status <> 'scheduled' then
      raise exception 'agenda_invalid_occurrence' using errcode = 'P0001';
    end if;
    if o.ends_at < now() then
      raise exception 'agenda_past' using errcode = 'P0001';
    end if;
  elsif v_occ_end < now() then
    raise exception 'agenda_past' using errcode = 'P0001';
  end if;

  -- ---- Somente este evento -------------------------------------------------
  if p_scope = 'occurrence' then
    if p_recur_freq is not null or p_recur_weekdays is not null or p_recur_until is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    if o.id is not null then
      update public.appointments
         set title = v_title, notes = p_notes, location = p_location,
             starts_at = p_starts_at, ends_at = p_ends_at
       where id = o.id;
      return o.id;
    end if;
    -- Campos de identidade vêm do MESTRE, nunca do cliente (achado 5).
    insert into public.appointments (
      tenant_id, owner_id, kind, trainer_id, student_id, tz,
      series_id, original_date, title, notes, location, starts_at, ends_at, status
    ) values (
      m.tenant_id, m.owner_id, m.kind, m.trainer_id, m.student_id, m.tz,
      m.id, v_d, v_title, p_notes, p_location, p_starts_at, p_ends_at, 'scheduled'
    ) returning id into v_new_id;
    return v_new_id;
  end if;

  -- ---- Este e os seguintes / Todos ----------------------------------------
  -- M2: a data local do novo início tem de ser D.
  if (p_starts_at at time zone m.tz)::date <> v_d then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;

  if p_scope = 'all' then
    v_cut := public.agenda_next_occurrence(m.id, now());
    if v_cut is null then
      raise exception 'agenda_past' using errcode = 'P0001';
    end if;
  else
    v_cut := v_d;
  end if;

  v_new_start := (v_cut + (p_starts_at at time zone m.tz)::time) at time zone m.tz;
  v_new_end   := v_new_start + (p_ends_at - p_starts_at);

  -- Regra: sem p_recur_freq mantém a do mestre; com ela, recalcula a partir do corte.
  if p_recur_freq is null then
    if p_recur_weekdays is not null or p_recur_until is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    v_freq := m.recur_freq;
    v_wd := m.recur_weekdays;
    v_until := m.recur_until;
  else
    if p_recur_freq not in ('daily', 'weekly', 'monthly') then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    if p_recur_freq = 'weekly' then
      if p_recur_weekdays is null or cardinality(p_recur_weekdays) = 0 then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
      select array_agg(distinct x order by x) into v_wd from unnest(p_recur_weekdays) x;
      if exists (select 1 from unnest(v_wd) x where x is null or x not between 0 and 6)
         or not (extract(dow from v_cut)::smallint = any (v_wd)) then
        raise exception 'agenda_invalid_range' using errcode = 'P0001';
      end if;
    elsif p_recur_weekdays is not null then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    else
      v_wd := null;
    end if;
    if p_recur_until is not null and p_recur_until < v_cut then
      raise exception 'agenda_invalid_range' using errcode = 'P0001';
    end if;
    v_freq := p_recur_freq;
    v_until := p_recur_until;
  end if;

  v_first := (m.starts_at at time zone m.tz)::date;

  if v_first = v_cut then
    -- Corte na primeira data da série: atualiza o mestre no lugar (sem split).
    update public.appointments
       set title = v_title, notes = p_notes, location = p_location,
           starts_at = v_new_start, ends_at = v_new_end,
           recur_freq = v_freq, recur_weekdays = v_wd, recur_until = v_until
     where id = m.id;
    v_new_id := m.id;
  else
    -- Split: o mestre antigo termina em D-1; novo mestre a partir do corte.
    insert into public.appointments (
      tenant_id, owner_id, kind, trainer_id, student_id, tz,
      title, notes, location, starts_at, ends_at, status,
      recur_freq, recur_weekdays, recur_until
    ) values (
      m.tenant_id, m.owner_id, m.kind, m.trainer_id, m.student_id, m.tz,
      v_title, p_notes, p_location, v_new_start, v_new_end, 'scheduled',
      v_freq, v_wd, v_until
    ) returning id into v_new_id;

    -- Exceções individuais futuras acompanham o novo mestre.
    update public.appointments
       set series_id = v_new_id
     where series_id = m.id and original_date >= v_cut;
    update public.appointments
       set recur_until = v_cut - 1
     where id = m.id;
  end if;

  -- Regra trocada: exceções que deixaram de ser ocorrência da nova regra são canceladas.
  if p_recur_freq is not null then
    update public.appointments
       set status = 'canceled', canceled_at = now(), canceled_reason = 'user'
     where series_id = v_new_id
       and original_date >= v_cut
       and status = 'scheduled'
       and not public.agenda_occurrence_on(v_new_id, original_date);
  end if;

  return v_new_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- agenda_cancel — cancela (escopos como em agenda_update). Nunca apaga linhas.
-- -----------------------------------------------------------------------------
create or replace function public.agenda_cancel(
  p_id            uuid,
  p_scope         text,
  p_original_date date,
  p_reason        text default 'user'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me        public.profiles;
  v           public.appointments;
  m           public.appointments;
  o           public.appointments;
  v_d         date;
  v_cut       date;
  v_occ_start timestamptz;
  v_occ_end   timestamptz;
begin
  v_me := public.agenda_caller();
  if p_scope is null or p_scope not in ('occurrence', 'following', 'all') then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;
  if p_reason is distinct from 'user' then
    raise exception 'agenda_invalid_range' using errcode = 'P0001';
  end if;

  select * into v from public.appointments where id = p_id for update;
  if not found or not public.agenda_can_manage(v, v_me) then
    raise exception 'agenda_forbidden' using errcode = 'P0001';
  end if;
  if v.status <> 'scheduled' then
    raise exception 'agenda_immutable' using errcode = 'P0001';
  end if;

  -- Avulso.
  if v.series_id is null and v.recur_freq is null then
    if v.ends_at < now() then
      raise exception 'agenda_past' using errcode = 'P0001';
    end if;
    update public.appointments
       set status = 'canceled', canceled_at = now(), canceled_reason = p_reason
     where id = v.id;
    return;
  end if;

  -- Override: occurrence cancela a própria linha; demais escopos agem no mestre.
  if v.series_id is not null then
    if p_scope = 'occurrence' then
      if v.ends_at < now() then
        raise exception 'agenda_past' using errcode = 'P0001';
      end if;
      update public.appointments
         set status = 'canceled', canceled_at = now(), canceled_reason = p_reason
       where id = v.id;
      return;
    end if;
    v_d := v.original_date;
    select * into m from public.appointments where id = v.series_id for update;
  else
    m := v;
    v_d := p_original_date;
  end if;

  if m.status <> 'scheduled' then
    raise exception 'agenda_immutable' using errcode = 'P0001';
  end if;
  if v_d is null or not public.agenda_occurrence_on(m.id, v_d) then
    raise exception 'agenda_invalid_occurrence' using errcode = 'P0001';
  end if;
  v_occ_start := (v_d + (m.starts_at at time zone m.tz)::time) at time zone m.tz;
  v_occ_end   := v_occ_start + (m.ends_at - m.starts_at);

  select * into o from public.appointments where series_id = m.id and original_date = v_d;
  if o.id is not null then
    if o.status <> 'scheduled' then
      raise exception 'agenda_invalid_occurrence' using errcode = 'P0001';
    end if;
    if o.ends_at < now() then
      raise exception 'agenda_past' using errcode = 'P0001';
    end if;
  elsif v_occ_end < now() then
    raise exception 'agenda_past' using errcode = 'P0001';
  end if;

  -- Somente este evento.
  if p_scope = 'occurrence' then
    if o.id is not null then
      update public.appointments
         set status = 'canceled', canceled_at = now(), canceled_reason = p_reason
       where id = o.id;
    else
      insert into public.appointments (
        tenant_id, owner_id, kind, trainer_id, student_id, tz,
        series_id, original_date, title, notes, location, starts_at, ends_at,
        status, canceled_at, canceled_reason
      ) values (
        m.tenant_id, m.owner_id, m.kind, m.trainer_id, m.student_id, m.tz,
        m.id, v_d, m.title, m.notes, m.location, v_occ_start, v_occ_end,
        'canceled', now(), p_reason
      );
    end if;
    return;
  end if;

  -- Este e os seguintes / Todos.
  if p_scope = 'all' then
    v_cut := public.agenda_next_occurrence(m.id, now());
    if v_cut is null then
      raise exception 'agenda_past' using errcode = 'P0001';
    end if;
  else
    v_cut := v_d;
  end if;

  if (m.starts_at at time zone m.tz)::date = v_cut then
    -- Nada de passado: cancela o mestre inteiro e as exceções.
    update public.appointments
       set status = 'canceled', canceled_at = now(), canceled_reason = p_reason
     where id = m.id;
    update public.appointments
       set status = 'canceled', canceled_at = now(), canceled_reason = p_reason
     where series_id = m.id and status = 'scheduled';
  else
    -- Há passado: encerra a série em D-1 e cancela exceções futuras.
    update public.appointments set recur_until = v_cut - 1 where id = m.id;
    update public.appointments
       set status = 'canceled', canceled_at = now(), canceled_reason = p_reason
     where series_id = m.id and status = 'scheduled' and original_date >= v_cut;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Trigger de desvínculo (§9): aluno arquivado, ou vínculo/tenant/papel/tipo de
-- conta alterado ⇒ cancela atendimentos FUTUROS dele. Passados e personal/block
-- (student_id nulo) ficam intactos. Troca só de trainer_id cancela apenas os do
-- professor antigo.
-- -----------------------------------------------------------------------------
create or replace function public.agenda_on_student_unlink()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_archived     boolean;
  v_trainer_only boolean;
  v_reason       text;
  v_trainer      uuid;
  m              public.appointments;
  v_d            date;
begin
  if old.role is distinct from 'student' and new.role is distinct from 'student' then
    return new;
  end if;

  v_archived := coalesce(new.status::text = 'archived', false)
    and old.status::text is distinct from 'archived';
  v_trainer_only := not v_archived
    and old.tenant_id is not distinct from new.tenant_id
    and old.role is not distinct from new.role
    and old.account_type is not distinct from new.account_type
    and old.trainer_id is distinct from new.trainer_id;

  if not (
    v_archived
    or v_trainer_only
    or old.tenant_id is distinct from new.tenant_id
    or old.role is distinct from new.role
    or old.account_type is distinct from new.account_type
  ) then
    return new;
  end if;
  -- Primeiro vínculo (trainer_id nulo -> X) não cancela nada.
  if v_trainer_only and old.trainer_id is null then
    return new;
  end if;

  v_reason  := case when v_archived then 'student_archived' else 'link_ended' end;
  v_trainer := case when v_trainer_only then old.trainer_id else null end;

  -- Avulsos e overrides futuros.
  update public.appointments a
     set status = 'canceled', canceled_at = now(), canceled_reason = v_reason
   where a.student_id = new.user_id
     and a.status = 'scheduled'
     and a.recur_freq is null
     and a.starts_at > now()
     and (v_trainer is null or a.trainer_id = v_trainer);

  -- Séries com ocorrências futuras.
  for m in
    select * from public.appointments a
     where a.student_id = new.user_id
       and a.status = 'scheduled'
       and a.recur_freq is not null
       and (v_trainer is null or a.trainer_id = v_trainer)
  loop
    v_d := public.agenda_next_occurrence(m.id, now());
    if v_d is null then
      continue;
    end if;
    if (m.starts_at at time zone m.tz)::date = v_d then
      update public.appointments
         set status = 'canceled', canceled_at = now(), canceled_reason = v_reason
       where id = m.id;
    else
      update public.appointments set recur_until = v_d - 1 where id = m.id;
    end if;
    update public.appointments
       set status = 'canceled', canceled_at = now(), canceled_reason = v_reason
     where series_id = m.id
       and status = 'scheduled'
       and (original_date >= v_d or starts_at > now());
  end loop;

  return new;
end;
$$;

drop trigger if exists profiles_agenda_on_student_unlink on public.profiles;
create trigger profiles_agenda_on_student_unlink
  after update of status, trainer_id, tenant_id, account_type, role on public.profiles
  for each row
  when (
    old.status is distinct from new.status
    or old.trainer_id is distinct from new.trainer_id
    or old.tenant_id is distinct from new.tenant_id
    or old.account_type is distinct from new.account_type
    or old.role is distinct from new.role
  )
  execute function public.agenda_on_student_unlink();

-- -----------------------------------------------------------------------------
-- Privilégios: revoke all from public (e anon); só as 3 funções de escrita são
-- concedidas a authenticated. Auxiliares ficam sem grant (chamadas internas).
-- -----------------------------------------------------------------------------
revoke all on function public.agenda_caller() from public, anon, authenticated;
revoke all on function public.agenda_check_fields(public.appointment_kind, text, text, text, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.agenda_can_manage(public.appointments, public.profiles) from public, anon, authenticated;
revoke all on function public.agenda_occurrence_on(uuid, date) from public, anon, authenticated;
revoke all on function public.agenda_is_occurrence(uuid, date) from public, anon, authenticated;
revoke all on function public.agenda_next_occurrence(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.agenda_on_student_unlink() from public, anon, authenticated;

revoke all on function public.agenda_create(public.appointment_kind, uuid, text, text, text, timestamptz, timestamptz, text, smallint[], date) from public, anon;
grant execute on function public.agenda_create(public.appointment_kind, uuid, text, text, text, timestamptz, timestamptz, text, smallint[], date) to authenticated;

revoke all on function public.agenda_update(uuid, text, date, text, text, text, timestamptz, timestamptz, text, smallint[], date) from public, anon;
grant execute on function public.agenda_update(uuid, text, date, text, text, text, timestamptz, timestamptz, text, smallint[], date) to authenticated;

revoke all on function public.agenda_cancel(uuid, text, date, text) from public, anon;
grant execute on function public.agenda_cancel(uuid, text, date, text) to authenticated;
