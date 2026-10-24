'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSupabase } from '@/app/providers';
import type { UserRole } from '@/types/database.types';
import {
  getNavItems,
  isNavItemActive,
  roleLabel,
} from '@/components/navigation/nav-items';

interface BottomNavProps {
  role: UserRole;
  rootHref: string;
}

/** Quantos itens aparecem na barra inferior antes do botão "Menu". */
const PRIMARY_COUNT = 3;

/**
 * Navegação inferior (mobile, <md). Mostra os primeiros itens do papel como
 * atalhos e agrupa o restante em um Sheet acessível. Alvos de toque >=44px.
 */
export function BottomNav({ role, rootHref }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [open, setOpen] = useState(false);

  const items = getNavItems(role);
  const primary = items.slice(0, PRIMARY_COUNT);
  const overflow = items.slice(PRIMARY_COUNT);

  async function handleSignOut() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    // Wrapper fixo que ocupa a largura inteira e respeita a safe-area; não
    // captura toques (pointer-events-none) para não bloquear o conteúdo nas
    // margens laterais da pilula flutuante.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] md:hidden">
      <nav
        className="pointer-events-auto mx-4 mb-4 overflow-hidden rounded-3xl border border-border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
        aria-label="Navegação principal"
      >
        <ul className="flex items-stretch justify-around">
        {primary.map((item) => {
          const active = isNavItemActive(item, pathname, [rootHref]);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span>Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Menu — {roleLabel(role)}</SheetTitle>
              </SheetHeader>
              <ul className="mt-4 space-y-1">
                {overflow.map((item) => {
                  const active = isNavItemActive(item, pathname, [rootHref]);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-1 border-t border-border pt-4">
                {/* Tema vive aqui no mobile (removido do header). */}
                <div className="flex justify-start">
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="min-h-11 w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Sair da conta</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </li>
        </ul>
      </nav>
    </div>
  );
}
