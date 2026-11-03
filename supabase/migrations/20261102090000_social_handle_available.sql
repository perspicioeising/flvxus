-- =============================================================================
-- Flvxus v2 — Arena G3: checagem de disponibilidade de `social_handle`.
-- Contrato: FEAT-001 (onboarding de nome de usuário).
--
-- ORDEM DE APLICAÇÃO: depois de 20261030090200 (funções sociais G3).
--
-- SECURITY DEFINER + `set search_path = ''`, schema-qualificada, e ao fim
-- revoke all from public + grant execute to authenticated (padrão G1/G2/G3).
--
-- ANTI-ENUMERAÇÃO: responde SOMENTE true/false para UM valor exato de handle.
-- NUNCA lista handles nem devolve user_ids — é um oráculo de disponibilidade,
-- não de existência de contas.
--
-- ADITIVA e IDEMPOTENTE: `create or replace`. Rollback em
-- 20261102090000_social_handle_available_rollback.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- gamification_social_handle_available(p_handle) -> boolean
-- Normaliza o handle (trim + lower). Formato inválido (regex da constraint) =>
-- false. Caso válido: true quando NENHUM profile usa esse handle (comparação
-- case-insensitive), senão false.
-- -----------------------------------------------------------------------------
create or replace function public.gamification_social_handle_available(p_handle text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select case
    when lower(btrim(coalesce(p_handle, ''))) !~ '^[a-z0-9_]{3,30}$' then false
    else not exists (
      select 1
      from public.profiles p
      where lower(p.social_handle) = lower(btrim(coalesce(p_handle, '')))
    )
  end;
$$;

revoke all on function public.gamification_social_handle_available(text) from public;
grant execute on function public.gamification_social_handle_available(text) to authenticated;
