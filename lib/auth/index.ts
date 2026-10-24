import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database.types';

/**
 * Helpers de papel/tenant para o gate server-side (architecture.md §5.2).
 *
 * O papel NUNCA é decidido no cliente nem no middleware: cada layout de área
 * (`(professor)`/`(aluno)`) chama `requireRole(...)` que lê `profiles.role` via
 * `createServerClient`. Isso corrige o antipadrão da v1 (userRole via
 * `fetch('/api/profile')` dentro de um layout client em
 * `app/(dashboard)/dashboard/layout.tsx`).
 */

/** Usuário autenticado + seu perfil mínimo (papel/tenant), já tipado. */
export interface SessionUser {
  userId: string;
  role: UserRole;
  tenantId: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  /**
   * TRUE quando o usuário é o MASTER (dono) do tenant — Fase 3. Base dos gates
   * de billing/filiados/visibilidade (`requireMaster`/`assertMaster`).
   */
  isMaster: boolean;
}

/** Para onde cada papel é enviado quando acessa a área do outro papel. */
const HOME_BY_ROLE: Record<UserRole, string> = {
  trainer: '/professor',
  student: '/aluno',
};

/**
 * Retorna o usuário autenticado com seu perfil (papel/tenant) ou `null` quando
 * não há sessão válida. Não redireciona — use `requireRole` para proteger áreas.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, tenant_id, email, full_name, avatar_url, is_tenant_master, deactivated_at')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  // Fase 3 (design §6b): filiado DESATIVADO perde acesso. Como `null` já
  // significa "sem sessão válida" para todos os chamadores (layouts redirecionam
  // para /login; actions retornam { ok:false }), cortamos aqui — o ponto único
  // que layouts E Server Actions atravessam. A RLS NÃO é a fronteira de
  // desativação (o token ainda satisfaz app_role()='trainer').
  if (profile.deactivated_at) {
    return null;
  }

  return {
    userId: user.id,
    role: profile.role,
    tenantId: profile.tenant_id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    isMaster: profile.is_tenant_master,
  };
}

/**
 * Gate server-side de papel. Deve ser chamado no `layout.tsx` de cada área.
 * - Sem sessão → redireciona para `/login`.
 * - Papel divergente → redireciona para a área correta do usuário.
 * - Caso contrário, devolve o `SessionUser` tipado para o scaffolding usar.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/login');
  }

  if (sessionUser.role !== role) {
    redirect(HOME_BY_ROLE[sessionUser.role]);
  }

  return sessionUser;
}

/**
 * Gate server-side de MASTER (Fase 3, design §7). Para rotas/áreas exclusivas do
 * master (billing, filiados, visibilidade). Sem sessão → `/login`; filiado (ou
 * qualquer não-master) → `/professor`. Devolve o `SessionUser` do master.
 *
 * É o gate REAL (FR9.5) — esconder o menu não basta; as rotas chamam isto.
 */
export async function requireMaster(): Promise<SessionUser> {
  const sessionUser = await requireRole('trainer');

  if (!sessionUser.isMaster) {
    redirect('/professor');
  }

  return sessionUser;
}

/**
 * Checagem de master-only para Server Actions (não redireciona). Retorna o
 * `SessionUser` quando o usuário é master, ou `null` caso contrário — o chamador
 * devolve `{ ok:false, message:'Acesso negado.' }`. Reusa `getSessionUser` (que
 * já corta filiado desativado e usuário sem sessão).
 */
export async function assertMaster(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== 'trainer' || !user.isMaster) {
    return null;
  }
  return user;
}
