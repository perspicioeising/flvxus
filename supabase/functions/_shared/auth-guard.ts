/**
 * Guarda de autenticação/autorização das Edge Functions de IA.
 *
 * Ordem obrigatória (architecture §4.4):
 * 1. Validar o JWT do header `Authorization` (401 se ausente/ inválido).
 * 2. SOMENTE APÓS validar o JWT, resolver papel/tenant consultando `profiles`
 *    com service_role.
 * 3. 403 se o papel não for `trainer`.
 *
 * As dependências (verificador de JWT e buscador de perfil) são INJETÁVEIS para
 * manter a lógica de ordem/decisão testável sem Supabase real. NUNCA loga token.
 */

import { forbidden, unauthorized } from './errors.ts';

/** Papel do usuário (espelha o enum `user_role`). */
export type UserRole = 'trainer' | 'student';

/** Identidade resolvida a partir do JWT (apenas o `sub`/userId). */
export interface AuthenticatedUser {
  userId: string;
}

/** Perfil mínimo lido de `profiles` após a validação do JWT. */
export interface ProfileContext {
  tenantId: string;
  role: UserRole;
}

/** Contexto completo devolvido a uma função autorizada. */
export interface GuardContext {
  userId: string;
  tenantId: string;
  role: UserRole;
}

/**
 * Verificador de JWT injetável: recebe o valor cru do header `Authorization`
 * e devolve o usuário autenticado, ou `null` se inválido/ausente.
 * A implementação real usa o client anon com o token (`auth.getUser`).
 */
export type JwtVerifier = (
  authorizationHeader: string | null,
) => Promise<AuthenticatedUser | null>;

/**
 * Buscador de perfil injetável: SÓ é chamado após o JWT ser validado.
 * A implementação real consulta `profiles` por `user_id` com service_role.
 */
export type ProfileResolver = (userId: string) => Promise<ProfileContext | null>;

/**
 * Executa a guarda. Lança `AiError` (401/403) em caso de falha; devolve o
 * contexto se o usuário for um `trainer` autenticado do seu tenant.
 */
export async function requireTrainer(
  authorizationHeader: string | null,
  verifyJwt: JwtVerifier,
  resolveProfile: ProfileResolver,
): Promise<GuardContext> {
  // 1. JWT primeiro — nada de service_role antes disso.
  const user = await verifyJwt(authorizationHeader);
  if (!user) {
    throw unauthorized();
  }

  // 2. Só agora, com JWT válido, resolvemos papel/tenant via service_role.
  const profile = await resolveProfile(user.userId);
  if (!profile) {
    throw forbidden('Perfil não encontrado para o usuário autenticado.');
  }

  // 3. Apenas trainer pode acionar a IA (architecture §8).
  if (profile.role !== 'trainer') {
    throw forbidden('Apenas o professor pode usar os recursos de IA.');
  }

  return { userId: user.userId, tenantId: profile.tenantId, role: profile.role };
}
