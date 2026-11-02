-- =============================================================================
-- Flvxus v2 — Arena G3 (2/5): RLS das 3 tabelas sociais.
-- Contrato: design.md §RLS das tabelas sociais (migration 2) · FEAT-001.
--
-- ORDEM DE APLICAÇÃO: depois de 20261030090000 (tabelas sociais).
--
-- IGUAL A G1 (20261026090200): SOMENTE policy de SELECT para `authenticated`,
-- restrita às próprias linhas. NENHUMA policy de INSERT/UPDATE/DELETE — TODA
-- escrita (criar/aceitar/recusar/remover/bloquear/criar duelo/criar desafio do
-- coach/apurar) passa exclusivamente pelas funções SECURITY DEFINER (090200/090300),
-- onde as transições são validadas num só lugar.
--
-- A RLS do Postgres NÃO restringe colunas: as policies de SELECT só liberam as
-- PRÓPRIAS linhas; a projeção pública de dados de terceiros (nome/nível/XP/posição)
-- vem exclusivamente das funções SECURITY DEFINER.
--
-- ADITIVA e IDEMPOTENTE: `drop policy if exists` + `create policy`. Rollback em
-- 20261030090100_gamification_social_rls_rollback.sql.
-- =============================================================================

alter table public.gamification_friends            enable row level security;
alter table public.gamification_challenges          enable row level security;
alter table public.gamification_challenge_members   enable row level security;

-- -----------------------------------------------------------------------------
-- gamification_friends: SELECT só das amizades em que EU sou um dos lados.
-- Impede enumerar terceiros. Sem write direto (funções SECURITY DEFINER).
-- -----------------------------------------------------------------------------
drop policy if exists gamification_friends_select on public.gamification_friends;
create policy gamification_friends_select on public.gamification_friends
  for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- -----------------------------------------------------------------------------
-- gamification_challenges: SELECT dos desafios que criei OU dos quais participo.
-- Para 'coach', o professor dono vê os seus; alunos membros veem via membership.
-- Sem write direto (funções SECURITY DEFINER).
-- -----------------------------------------------------------------------------
drop policy if exists gamification_challenges_select on public.gamification_challenges;
create policy gamification_challenges_select on public.gamification_challenges
  for select to authenticated
  using (
    creator_id = auth.uid()
    or exists (
      select 1 from public.gamification_challenge_members m
      where m.challenge_id = id and m.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- gamification_challenge_members: SELECT das minhas linhas de membership OU das
-- de desafios que eu criei (para o criador montar o placar). A projeção pública
-- dos OUTROS membros vem da função. Sem write direto (funções SECURITY DEFINER).
-- -----------------------------------------------------------------------------
drop policy if exists gamification_challenge_members_select on public.gamification_challenge_members;
create policy gamification_challenge_members_select on public.gamification_challenge_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.gamification_challenges c
      where c.id = challenge_id and c.creator_id = auth.uid()
    )
  );
