import type { ReactNode } from 'react';

import type { UserRole } from '@/types/database.types';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { AppHeader } from '@/components/navigation/app-header';
import { BottomNav } from '@/components/navigation/bottom-nav';

interface AppShellProps {
  role: UserRole;
  rootHref: string;
  children: ReactNode;
}

/**
 * Scaffolding de navegação por papel: sidebar colapsável no desktop, header com
 * troca de tema e bottom-nav no mobile. O papel/root vem do layout server-side
 * que já fez o gate — nenhum fetch de perfil no cliente.
 */
export function AppShell({ role, rootHref, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar role={role} rootHref={rootHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader role={role} rootHref={rootHref} />
        {/* pb extra no mobile para não ficar sob a bottom-nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav role={role} rootHref={rootHref} />
    </div>
  );
}
