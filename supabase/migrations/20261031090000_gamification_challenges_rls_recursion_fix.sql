-- =============================================================================
-- Flvxus v2 — Arena G3 (fix): quebra a RECURSÃO MÚTUA de RLS entre
-- gamification_challenges e gamification_challenge_members.
--
-- ORDEM DE APLICAÇÃO: depois de 20261030090000..090400. Aplicada À MÃO.
--
-- CAUSA RAIZ (Postgres 42P17 "infinite recursion detected in policy"):
--   * gamification_challenges_select referencia gamification_challenge_members
--     (OR exists(... membership ...)).
--   * gamification_challenge_members_select referencia gamification_challenges
--     (OR exists(... creator ...)).
--   Ao avaliar o SELECT de QUALQUER das duas tabelas sob RLS, o Postgres precisa
--   avaliar a policy da outra, que por sua vez reavalia a primeira — ciclo. O
--   Postgres aborta com 42P17 e o SELECT inteiro FALHA. Resultado observado:
--     - Convidado de duelo (accepted=false): a leitura de gamification_challenges
--       em lib/arena/dados.ts erra -> lista vazia -> o convite nunca aparece.
--     - Professor ao listar desafios coach: a leitura em
--       lib/professor/desafios-dados.ts erra -> "Nenhum desafio ainda".
--   (A criação funcionava porque passa por funções SECURITY DEFINER, imunes à RLS.)
--
-- CORREÇÃO (padrão do projeto — ver app_tenant_id()/app_role()): mover as
-- subconsultas cruzadas para funções SECURITY DEFINER (search_path vazio), que
-- leem as tabelas SEM reavaliar a RLS do chamador, quebrando o ciclo. As policies
-- passam a chamar essas funções em vez de um `exists(select ... from <outra tabela>)`.
--
-- SEGURANÇA PRESERVADA: o escopo liberado é EXATAMENTE o mesmo de antes
--   - challenges: creator_id = auth.uid() OU sou membro do desafio;
--   - members: user_id = auth.uid() OU sou o criador do desafio.
-- Nenhuma policy é afrouxada; dados de terceiros continuam só via SECURITY DEFINER
-- (o placar projeta o contrato público). As funções usam auth.uid() internamente,
-- nunca recebem o usuário por parâmetro.
--
-- ADITIVA e IDEMPOTENTE: `create or replace function` + `drop policy if exists` +
-- `create policy`. Rollback em
-- 20261031090000_gamification_challenges_rls_recursion_fix_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers SECURITY DEFINER — leem as tabelas sociais SEM disparar a RLS do
-- chamador (search_path vazio, schema-qualificado). É o mesmo recurso usado por
-- app_tenant_id()/app_role() para ler profiles sem recursão.
-- -----------------------------------------------------------------------------

-- Sou membro do desafio? (usado pela policy de gamification_challenges.)
create or replace function public.gamification_is_challenge_member(p_challenge_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gamification_challenge_members m
    where m.challenge_id = p_challenge_id
      and m.user_id = auth.uid()
  );
$$;

comment on function public.gamification_is_challenge_member(uuid) is
  'Arena G3: true se auth.uid() é membro do desafio. SECURITY DEFINER para evitar '
  'a recursão mútua de RLS entre challenges e challenge_members (42P17).';

-- Sou o criador do desafio? (usado pela policy de gamification_challenge_members.)
create or replace function public.gamification_is_challenge_creator(p_challenge_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gamification_challenges c
    where c.id = p_challenge_id
      and c.creator_id = auth.uid()
  );
$$;

comment on function public.gamification_is_challenge_creator(uuid) is
  'Arena G3: true se auth.uid() é o criador do desafio. SECURITY DEFINER para '
  'evitar a recursão mútua de RLS entre challenges e challenge_members (42P17).';

revoke all on function public.gamification_is_challenge_member(uuid) from public;
revoke all on function public.gamification_is_challenge_creator(uuid) from public;
grant execute on function public.gamification_is_challenge_member(uuid) to authenticated;
grant execute on function public.gamification_is_challenge_creator(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Recria as policies de SELECT usando os helpers (mesmo escopo, sem recursão).
-- -----------------------------------------------------------------------------

-- gamification_challenges: desafios que criei OU dos quais participo.
drop policy if exists gamification_challenges_select on public.gamification_challenges;
create policy gamification_challenges_select on public.gamification_challenges
  for select to authenticated
  using (
    creator_id = auth.uid()
    or public.gamification_is_challenge_member(id)
  );

-- gamification_challenge_members: minhas linhas de membership OU as de desafios
-- que eu criei (para o criador montar/listar o placar).
drop policy if exists gamification_challenge_members_select on public.gamification_challenge_members;
create policy gamification_challenge_members_select on public.gamification_challenge_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.gamification_is_challenge_creator(challenge_id)
  );
