-- =============================================================================
-- Flvxus v2 — Arena G3 (1/5): núcleo SOCIAL — enums + 3 tabelas novas + índices.
-- Contrato: design.md §Esquema de dados (migration 1) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO OBRIGATÓRIA (aplicada À MÃO pelo usuário, sem Docker):
--   20261030090000 (este)  -> enums + profiles.social_handle + 3 tabelas sociais
--   20261030090100          -> RLS (só SELECT) das 3 tabelas
--   20261030090200          -> funções de amizade/convite/ranking de amigos
--   20261030090300          -> funções de desafio + recriação de gamification_award
--   20261030090400          -> seed da conquista challenge_winner
-- As migrations 090100..090400 dependem das tabelas criadas aqui.
--
-- TIMESTAMPS (design.md §Timestamps): a faixa 20261030090000..090400 é
-- estritamente maior que o maior timestamp de qualquer branch (20261029090000)
-- aplicada ao MESMO Supabase compartilhado. Reconferir antes da aplicação manual.
--
-- ADITIVA e IDEMPOTENTE (forward 2x seguro): `do $$ ... if not exists` (enums),
-- `create ... if not exists`, `add column if not exists`, `add constraint` guarda-
-- do por catálogo. Espelha o padrão de 20261026090000_gamification_core.sql e de
-- 20261025090050_account_type.sql. RLS fica em 090100. Rollback em
-- 20261030090000_gamification_social_core_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums da camada social — guarda idempotente (NIT #6 de account_type): `create
-- type` não aceita `if not exists`, então só cria se ainda não existir.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'friend_status') then
    create type public.friend_status as enum ('pending', 'accepted', 'blocked');
  end if;
  if not exists (select 1 from pg_type where typname = 'challenge_kind') then
    create type public.challenge_kind as enum ('duel', 'coach');
  end if;
  if not exists (select 1 from pg_type where typname = 'challenge_status') then
    create type public.challenge_status as enum ('active', 'finished', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'challenge_member_result') then
    create type public.challenge_member_result as enum ('pending', 'won', 'lost', 'tie');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- profiles.social_handle — handle público opcional (opt-in) para descoberta por
-- igualdade exata (D2). NULL por padrão: quem não define não é "adicionável".
-- Unicidade case-insensitive via índice em lower(...), só linhas com handle.
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists social_handle text;

comment on column public.profiles.social_handle is
  'Handle público opcional (opt-in) da Arena social. Único case-insensitive. '
  'Descoberta só por igualdade exata (D2); NULL = não adicionável. '
  'Formato ^[a-z0-9_]{3,30}$ (constraint + borda).';

create unique index if not exists profiles_social_handle_lower_uidx
  on public.profiles (lower(social_handle))
  where social_handle is not null;

-- Formato validado no banco (defesa em profundidade; a borda também valida).
-- not valid: não reprocessa linhas antigas (todas NULL) na aplicação manual;
-- o constraint já vale para TODA escrita nova. Guarda idempotente por catálogo.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_social_handle_format'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_social_handle_format
      check (social_handle is null or social_handle ~ '^[a-z0-9_]{3,30}$')
      not valid;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- gamification_friends — UMA única linha por par (não duas), com direção
-- registrada (requester/addressee) e blocked_by. Estados: pending/accepted/
-- blocked. Recusar/remover = delete da linha (volta a "sem relação").
-- Unicidade do par independente da direção via índice em least/greatest.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_friends (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (user_id) on delete cascade,
  addressee_id uuid not null references public.profiles (user_id) on delete cascade,
  status       public.friend_status not null default 'pending',
  blocked_by   uuid references public.profiles (user_id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  responded_at timestamptz,
  constraint gamification_friends_no_self check (requester_id <> addressee_id),
  -- blocked_by só preenchido quando status = 'blocked', e tem de ser um dos lados.
  constraint gamification_friends_blocked_by_valid check (
    (status = 'blocked' and blocked_by in (requester_id, addressee_id))
    or (status <> 'blocked' and blocked_by is null)
  )
);

comment on table public.gamification_friends is
  'Amizades da Arena (opt-in, cross-tenant, consentimento mútuo). Uma linha por '
  'par (unicidade via least/greatest). Toda escrita via funções SECURITY DEFINER.';

-- Unicidade do PAR independente da direção: no máximo uma linha entre A e B.
create unique index if not exists gamification_friends_pair_uidx
  on public.gamification_friends (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

create index if not exists gamification_friends_requester_idx
  on public.gamification_friends (requester_id, status);
create index if not exists gamification_friends_addressee_idx
  on public.gamification_friends (addressee_id, status);

drop trigger if exists gamification_friends_set_updated_at on public.gamification_friends;
create trigger gamification_friends_set_updated_at
  before update on public.gamification_friends
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- gamification_challenges — desafios de período (dia-SP). kind='duel' (1x1 entre
-- amigos, tenant_id NULL) ou kind='coach' (painel do personal, intra-tenant,
-- tenant_id NOT NULL). duration_days ∈ {7,15,30}; ends_on = starts_on + dias - 1.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_challenges (
  id            uuid primary key default gen_random_uuid(),
  kind          public.challenge_kind not null,
  status        public.challenge_status not null default 'active',
  creator_id    uuid not null references public.profiles (user_id) on delete cascade,
  -- tenant_id SÓ para kind='coach' (painel do personal, intra-tenant). NULL p/ 'duel'.
  tenant_id     uuid references public.tenants (id) on delete cascade,
  title         text,
  goal_text     text,        -- meta (texto livre; usado em 'coach')
  reward_text   text,        -- recompensa (texto livre; usado em 'coach')
  duration_days smallint not null check (duration_days in (7, 15, 30)),
  starts_on     date not null,    -- dia-SP de início (inclusive)
  ends_on       date not null,    -- dia-SP de fim (inclusive) = starts_on + duration_days - 1
  settled_at    timestamptz,      -- carimbo da apuração (null enquanto active)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint gamification_challenges_coach_tenant check (
    (kind = 'coach' and tenant_id is not null)
    or (kind = 'duel' and tenant_id is null)
  ),
  constraint gamification_challenges_period check (ends_on >= starts_on)
);

comment on table public.gamification_challenges is
  'Desafios da Arena (dia-SP). duel = 1x1 entre amigos (tenant_id NULL); coach = '
  'painel do personal intra-tenant (tenant_id NOT NULL). Escrita via SECURITY DEFINER.';

create index if not exists gamification_challenges_creator_idx
  on public.gamification_challenges (creator_id, status);
create index if not exists gamification_challenges_tenant_idx
  on public.gamification_challenges (tenant_id, status) where tenant_id is not null;
create index if not exists gamification_challenges_settle_idx
  on public.gamification_challenges (status, ends_on);

drop trigger if exists gamification_challenges_set_updated_at on public.gamification_challenges;
create trigger gamification_challenges_set_updated_at
  before update on public.gamification_challenges
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- gamification_challenge_members — PK composta (challenge_id, user_id). accepted
-- cobre o aceite do duelo (desafiado aceita/recusa). final_xp/result são CACHE
-- PÓS-APURAÇÃO: NULL/pending enquanto active; preenchidos só por settle (4.5).
-- O placar ao vivo (4.4) SEMPRE recomputa do ledger, nunca lê final_xp/result.
-- -----------------------------------------------------------------------------
create table if not exists public.gamification_challenge_members (
  challenge_id uuid not null references public.gamification_challenges (id) on delete cascade,
  user_id      uuid not null references public.profiles (user_id) on delete cascade,
  -- aceite do convite de desafio (duel): o desafiado precisa aceitar para valer.
  accepted     boolean not null default false,
  -- resultado apurado (preenchido na apuração; cache do ledger).
  result       public.challenge_member_result not null default 'pending',
  final_xp     integer,       -- XP do período apurado (cache; null enquanto active)
  created_at   timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

comment on table public.gamification_challenge_members is
  'Membros de um desafio. accepted = aceite do duelo; final_xp/result são cache '
  'pós-apuração (NULL/pending enquanto active). Fonte de verdade = gamification_events.';

create index if not exists gamification_challenge_members_user_idx
  on public.gamification_challenge_members (user_id);
