'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/navigation/logo';
import { LogoIcon } from '@/components/navigation/logo-icon';
import { useSupabase } from '@/app/providers';
import type { UserRole } from '@/types/database.types';
import {
  getNavItems,
  isNavItemActive,
  roleLabel,
} from '@/components/navigation/nav-items';

interface AppSidebarProps {
  role: UserRole;
  rootHref: string;
  /** Fase 3: master vê o item "Plano" (default false, aditivo). */
  isMaster?: boolean;
}

/**
 * Sidebar de desktop (md+), colapsável. Superfícies sólidas dos tokens (ADR
 * 0006), foco visível e alvos de toque confortáveis. O papel vem do layout
 * server-side (sem fetch client).
 */
export function AppSidebar({ role, rootHref, isMaster = false }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [collapsed, setCollapsed] = useState(false);
  const items = getNavItems(role, isMaster);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Identidade */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <Link
          href={rootHref}
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Flvxus — página inicial"
        >
          <LogoIcon size="md" className="h-10 w-10 rounded-xl" />
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <Logo size="md" />
              <span className="text-xs text-muted-foreground">{roleLabel(role)}</span>
            </span>
          )}
        </Link>
      </div>

      {/* Botão de colapso */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        aria-pressed={collapsed}
        className="absolute -right-3 top-5 z-10 h-6 w-6 rounded-full"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </Button>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navegação principal">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isNavItemActive(item, pathname, [rootHref]);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé: alternância de tema + sair */}
      <div className="space-y-1 border-t border-border p-3">
        {/* Tema vive aqui no desktop (removido do header); centraliza quando colapsada. */}
        <div className={cn('flex', collapsed ? 'justify-center' : 'justify-start')}>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'min-h-11 w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Sair da conta' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Sair da conta</span>}
        </Button>
      </div>
    </aside>
  );
}
