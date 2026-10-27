import type { ReactNode } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/navigation/logo';
import { LogoIcon } from '@/components/navigation/logo-icon';

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
            <LogoIcon size="md" className="h-9 w-9 rounded-lg" />
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {/* No mobile os ghosts "Documentação" e "Entrar" são colapsados para
               não espremer o header em telas estreitas: ambos os destinos já
               aparecem no corpo da landing ("Ver documentação" e "Já tenho
               conta"), então nada se perde. Reaparecem em sm:+. */}
            <Button variant="ghost" asChild className="hidden min-h-11 sm:inline-flex">
              <Link href="/documentacao">Documentação</Link>
            </Button>
            <Button variant="ghost" asChild className="hidden min-h-11 sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            {/* CTA principal sempre visível; compacto no mobile (alvo >=44px via
               min-h-11) e volta ao tamanho xl do desktop em sm:+. */}
            <Button
              asChild
              size="xl"
              className="h-11 min-h-11 px-4 text-sm sm:h-12 sm:px-8 sm:text-base"
            >
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <Logo size="sm" className="mb-3" />
          <p>Flvxus — plataforma para personal trainers gerenciarem seus alunos.</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/documentacao"
              className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Documentação
            </Link>
            <Link
              href="/termos"
              className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Política de Privacidade
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
