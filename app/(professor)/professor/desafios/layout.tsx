import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { getSessionUser, isSelfManaged } from '@/lib/auth';

/**
 * Gate de rota do subtree `/professor/desafios` (painel de desafios do PERSONAL,
 * G3 — finding 6 do design). A área `(professor)` é gated só por
 * `role='trainer'`, e o aluno autônomo também é `role='trainer'` (porém
 * `account_type='self_managed'`) — logo a rota seria alcançável por URL por um
 * autônomo mesmo sem o item de menu. Este layout fecha isso: exige
 * `account_type='professional'` e redireciona o autônomo para `/aluno`.
 *
 * Espelha o gate da função `gamification_create_coach_challenge` (ambos por
 * `account_type`, nunca por `role`). Não existe layout.tsx em
 * `app/(professor)/professor/` hoje — só o do grupo `(professor)/layout.tsx`
 * (que já roda `requireRole('trainer')` e monta o AppShell) — por isso o gate
 * de `account_type` vive aqui, no layout do subtree de desafios.
 */
export default async function ProfessorDesafiosLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionUser = await getSessionUser();

  // Sem sessão (ou filiado desativado) → /login. O gate do grupo já garante
  // `role='trainer'`; aqui só resta barrar o autônomo (self_managed).
  if (!sessionUser) {
    redirect('/login');
  }

  if (isSelfManaged(sessionUser)) {
    redirect('/aluno');
  }

  return <>{children}</>;
}
