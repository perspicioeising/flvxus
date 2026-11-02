-- =============================================================================
-- Flvxus v2 — ROLLBACK de 20261031090000_gamification_challenges_rls_recursion_fix.sql
-- APLICADO À MÃO. NÃO roda no fluxo forward-only. `if exists`.
--
-- Restaura as policies de SELECT ao estado de 20261030090100 (subconsultas
-- cruzadas diretas, que RE-INTRODUZEM a recursão 42P17) e remove os helpers.
-- Só use se for reverter a correção inteira.
-- =============================================================================

-- Restaura a policy original de gamification_challenges (subquery direta).
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

-- Restaura a policy original de gamification_challenge_members (subquery direta).
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

-- Remove os helpers SECURITY DEFINER.
drop function if exists public.gamification_is_challenge_member(uuid);
drop function if exists public.gamification_is_challenge_creator(uuid);
