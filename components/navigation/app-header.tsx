'use client';

import Link from 'next/link';

import { Logo } from '@/components/navigation/logo';
import { LogoIcon } from '@/components/navigation/logo-icon';
import type { UserRole } from '@/types/database.types';
import { roleLabel } from '@/components/navigation/nav-items';

interface AppHeaderProps {
  role: UserRole;
  rootHref: string;
}

/**
 * Cabeçalho do app: identidade FLVXUS (logo com X verde) apenas no mobile,
 * onde a sidebar fica oculta. No desktop a marca vive na sidebar, então o
 * header não repete a logo (sem duplicação). A alternância de tema não vive
 * mais aqui — no desktop fica no rodapé da sidebar e no mobile dentro do
 * Sheet do menu da bottom-nav.
 */
export function AppHeader({ role, rootHref }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* No desktop a sidebar (md+) já exibe a marca; o header só mostra a logo
          no mobile, onde a sidebar fica oculta. Evita a logo duplicada. */}
      <Link
        href={rootHref}
        className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label="Flvxus — página inicial"
      >
        <LogoIcon size="md" className="h-9 w-9 rounded-lg" />
        <span className="flex flex-col leading-tight">
          <Logo size="md" />
          <span className="text-xs text-muted-foreground">{roleLabel(role)}</span>
        </span>
      </Link>
    </header>
  );
}
