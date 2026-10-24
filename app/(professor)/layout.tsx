import type { ReactNode } from 'react';

import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/navigation/app-shell';
import { materializarAceiteProfessor } from '@/lib/legal/materializar-aceite';

/**
 * Gate server-side da ÁREA DO PROFESSOR (architecture.md §5.2). Lê
 * `profiles.role` via createServerClient; sem sessão → /login, papel divergente
 * → área correta. O papel segue para o scaffolding via props (sem fetch client).
 */
export default async function ProfessorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole('trainer');

  // Gancho best-effort (MEDIUM #3): materializa o aceite pendente do professor.
  // É o ponto que TODO login do professor atravessa (inclusive e-mail+senha,
  // que NÃO passa pelo /callback). Idempotente e NÃO bloqueia a navegação —
  // curto-circuita quando o aceite da versão corrente já existe.
  await materializarAceiteProfessor(user.userId);

  return (
    <AppShell role={user.role} rootHref="/professor" isMaster={user.isMaster}>
      {children}
    </AppShell>
  );
}
