'use client';

import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/navigation/logo';
import { LogoIcon } from '@/components/navigation/logo-icon';
import type { UserRole } from '@/types/database.types';
import { roleLabel } from '@/components/navigation/nav-items';

interface AppHeaderProps {
  role: UserRole;
  rootHref: string;
}

/**
 * Cabeçalho do app: identidade FLVXUS (logo com X verde) + alternância de tema.
 * Visível em todas as larguras e para os dois papéis (aluno e professor); no
 * mobile é a faixa superior e a navegação fica na bottom-nav.
 */
export function AppHeader({ role, rootHref }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Link
        href={rootHref}
        className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Flvxus — página inicial"
      >
        <LogoIcon size="md" className="h-9 w-9 rounded-lg" />
        <span className="flex flex-col leading-tight">
          <Logo size="md" />
          <span className="text-xs text-muted-foreground">{roleLabel(role)}</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
