-- =============================================================================
-- Flvxus v2 — Migration: gamificação — seed por tenant + concessão de conquistas
-- Contrato: docs/architecture.md §6.3 · ADR 0013 · FEAT-004
--
-- A base (tabelas achievements, user_achievements e o trigger
-- award_points_on_session_finish) veio de 20261020090500_agenda_gamificacao.sql.
-- Aqui:
--  (a) função SECURITY DEFINER que SEMEIA o conjunto inicial de conquistas por
--      tenant de forma idempotente (por rule->>'code'); aplicada aos tenants
--      existentes e chamada em handle_new_user ao criar tenant de trainer;
--  (b) extensão de award_points_on_session_finish para CONCEDER as conquistas
--      elegíveis em user_achievements (on conflict (student_id, achievement_id)
--      do nothing), avaliando as rules jsonb.
--
-- Invariantes: tudo roda no banco, SECURITY DEFINER, sem service_role no fluxo
-- do aluno. user_achievements não tem INSERT para authenticated (20261020090800);
-- por isso a concessão NÃO pode vir de Server Action do aluno.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- (a) Seed idempotente do conjunto inicial de conquistas de um tenant.
-- Identificamos cada conquista por rule->>'code' (estável), de modo que
-- reexecutar não duplica. Ver ADR 0013 para o catálogo e a semântica das rules.
-- -----------------------------------------------------------------------------
create or replace function public.seed_achievements_for_tenant(p_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.achievements (tenant_id, name, description, icon, points, rule)
  select p_tenant_id, v.name, v.description, v.icon, v.points, v.rule
  from (
    values
      (
        'Primeiro treino',
        'Conclua sua primeira sessão de treino.',
        'Trophy',
        20,
        '{"type":"first_session","code":"first_session"}'::jsonb
      ),
      (
        'Semana cheia',
        'Conclua 3 sessões de treino na mesma semana.',
        'CalendarCheck',
        30,
        '{"type":"sessions_in_week","code":"week_complete","count":3}'::jsonb
      ),
      (
        'Sequência de 7 dias',
        'Treine por 7 dias seguidos.',
        'Flame',
        50,
        '{"type":"streak_days","code":"streak_7","days":7}'::jsonb
      ),
      (
        '100 pontos',
        'Acumule 100 pontos de gamificação.',
        'Star',
        0,
        '{"type":"points_total","code":"points_100","total":100}'::jsonb
      )
  ) as v(name, description, icon, points, rule)
  where not exists (
    select 1
    from public.achievements a
    where a.tenant_id = p_tenant_id
      and a.rule ->> 'code' = v.rule ->> 'code'
  );
end;
$$;

-- Aplica o seed a todos os tenants já existentes (idempotente).
do $$
declare
  r record;
begin
  for r in select id from public.tenants loop
    perform public.seed_achievements_for_tenant(r.id);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Estende handle_new_user: ao criar o tenant de um PROFESSOR, semeia as
-- conquistas iniciais daquele tenant. Alunos convidados não criam tenant, então
-- não semeiam nada aqui (mantém o comportamento de 20261020120000).
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

  -- Aluno convidado pelo professor: NÃO cria tenant nem profile aqui.
  if v_role = 'student' then
    return new;
  end if;

  -- Se já existe profile para este usuário (retry/corrida), não duplica.
  if exists (select 1 from public.profiles p where p.user_id = new.id) then
    return new;
  end if;

  v_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.email);

  -- Cadastro público de PROFESSOR: cria o tenant (owner) e o profile trainer.
  insert into public.tenants (owner_id, name)
  values (new.id, coalesce(v_full_name, 'Meu negócio'))
  returning id into v_tenant_id;

  insert into public.profiles (user_id, tenant_id, role, trainer_id, full_name, email)
  values (new.id, v_tenant_id, 'trainer', null, v_full_name, new.email);

  -- Semeia o conjunto inicial de conquistas do novo tenant (idempotente).
  perform public.seed_achievements_for_tenant(v_tenant_id);

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- (b) Concessão de conquistas ao finalizar a sessão.
-- Estende award_points_on_session_finish: além de pontos + last_workout_date,
-- avalia as rules do tenant do aluno e concede as elegíveis.
--
-- Semântica das rules (ADR 0013):
--  * first_session   — primeira sessão concluída do aluno (contagem = 1).
--  * sessions_in_week — >= count sessões concluídas na semana (seg..dom, via
--                       date_trunc('week')) da data da sessão.
--  * streak_days     — sequência de dias consecutivos com >= 1 sessão concluída
--                       terminando na data da sessão >= days.
--  * points_total    — total_points (já incrementado) >= total.
-- -----------------------------------------------------------------------------
create or replace function public.award_points_on_session_finish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id       uuid;
  v_finish_date     date;
  v_total_points    integer;
  v_sessions_total  integer;
  v_sessions_week   integer;
  v_streak          integer;
  v_cursor          date;
  a                 record;
begin
  if new.finished_at is null or old.finished_at is not null then
    return new;
  end if;

  v_finish_date := (new.finished_at at time zone 'UTC')::date;

  -- Pontos e data do último treino (comportamento original), capturando o total.
  update public.profiles
    set total_points      = total_points + 10,
        last_workout_date = v_finish_date
    where user_id = new.student_id
    returning tenant_id, total_points into v_tenant_id, v_total_points;

  if v_tenant_id is null then
    return new;
  end if;

  -- Sessões concluídas do aluno (inclui a atual, já com finished_at).
  select count(*) into v_sessions_total
  from public.workout_sessions s
  where s.student_id = new.student_id
    and s.finished_at is not null;

  -- Sessões concluídas na mesma semana (seg..dom) da data da sessão.
  select count(*) into v_sessions_week
  from public.workout_sessions s
  where s.student_id = new.student_id
    and s.finished_at is not null
    and date_trunc('week', (s.finished_at at time zone 'UTC')::date)
        = date_trunc('week', v_finish_date);

  -- Streak: conta dias consecutivos com >= 1 sessão terminando em v_finish_date.
  v_streak := 0;
  v_cursor := v_finish_date;
  loop
    if exists (
      select 1
      from public.workout_sessions s
      where s.student_id = new.student_id
        and s.finished_at is not null
        and (s.finished_at at time zone 'UTC')::date = v_cursor
    ) then
      v_streak := v_streak + 1;
      v_cursor := v_cursor - 1;
    else
      exit;
    end if;
  end loop;

  -- Avalia cada conquista do tenant e concede as elegíveis (idempotente).
  for a in
    select id, rule
    from public.achievements
    where tenant_id = v_tenant_id
      and rule is not null
  loop
    if (
      (a.rule ->> 'type' = 'first_session' and v_sessions_total = 1)
      or (a.rule ->> 'type' = 'sessions_in_week'
          and v_sessions_week >= coalesce((a.rule ->> 'count')::int, 1))
      or (a.rule ->> 'type' = 'streak_days'
          and v_streak >= coalesce((a.rule ->> 'days')::int, 1))
      or (a.rule ->> 'type' = 'points_total'
          and v_total_points >= coalesce((a.rule ->> 'total')::int, 0))
    ) then
      insert into public.user_achievements (tenant_id, student_id, achievement_id)
      values (v_tenant_id, new.student_id, a.id)
      on conflict (student_id, achievement_id) do nothing;
    end if;
  end loop;

  return new;
end;
$$;
