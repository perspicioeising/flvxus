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
    // h-dvh fixa o shell DIRETO na viewport (altura dinâmica), sem depender da
    // cadeia height:100% de html>body>layouts — que quebrava no desktop e deixava
    // o DOCUMENTO rolar (segundo scroll + área morta sob o conteúdo nas telas de
    // detalhe). `overflow-hidden` trava o scroll no container raiz: o shell ocupa
    // exatamente a viewport e não transborda, então o <body> não rola e o scroll
    // vive SÓ no <main>. O lock é do SHELL (não do <body> global), então as rotas
    // sem AppShell (auth/marketing) continuam rolando o documento.
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <AppSidebar role={role} rootHref={rootHref} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader role={role} rootHref={rootHref} />
        {/* O <main> é a área rolável. pb extra no mobile para o conteúdo não
            ficar sob a bottom-nav fixa. */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav role={role} rootHref={rootHref} />
    </div>
  );
}
