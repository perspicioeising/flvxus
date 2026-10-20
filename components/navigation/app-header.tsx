'use client';

import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import type { UserRole } from '@/types/database.types';
import { roleLabel } from '@/components/navigation/nav-items';

interface AppHeaderProps {
  role: UserRole;
  rootHref: string;
}

/**
 * Cabeçalho do app: identidade Flvxus + alternância de tema. Visível em todas as
 * larguras; no mobile é a faixa superior e a navegação fica na bottom-nav.
 */
export function AppHeader({ role, rootHref }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Link
        href={rootHref}
        className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label="Flvxus — página inicial"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight">Flvxus</span>
          <span className="text-xs text-muted-foreground">{roleLabel(role)}</span>
        </span>
      </Link>

      {/* Em desktop a identidade mora na sidebar; mantém o toggle à direita. */}
      <span className="hidden text-sm font-medium text-muted-foreground md:inline">
        Área do {roleLabel(role).toLowerCase()}
      </span>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
