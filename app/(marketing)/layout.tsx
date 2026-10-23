import type { ReactNode } from 'react';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Layout público (marketing). Não exige login. Header sóbrio com identidade,
 * alternância de tema e acessos a entrar/cadastrar (ADR 0006: base sóbria).
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Flvxus — início"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Dumbbell className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">Flvxus</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="min-h-11">
              <Link href="/documentacao">Documentação</Link>
            </Button>
            <Button variant="ghost" asChild className="min-h-11">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="min-h-11">
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <p>Flvxus — plataforma para personal trainers gerenciarem seus alunos.</p>
          <p className="mt-2">
            <Link
              href="/documentacao"
              className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Documentação
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
