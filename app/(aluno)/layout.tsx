import type { ReactNode } from 'react';

import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/navigation/app-shell';

/**
 * Gate server-side da ÁREA DO ALUNO (architecture.md §5.2). Lê `profiles.role`
 * via createServerClient; sem sessão → /login, papel divergente → área correta.
 */
export default async function AlunoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole('student');

  return (
    <AppShell role={user.role} rootHref="/aluno">
      {children}
    </AppShell>
  );
}
