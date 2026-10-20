import type { ReactNode } from 'react';

import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/navigation/app-shell';

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

  return (
    <AppShell role={user.role} rootHref="/professor">
      {children}
    </AppShell>
  );
}
