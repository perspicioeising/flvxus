import type { LucideIcon } from 'lucide-react';
import { Hammer } from 'lucide-react';

import { EmptyState } from '@/components/patterns';

interface PageStubProps {
  /** Título da tela (pt-BR). */
  title: string;
  /** O que esta tela fará quando pronta. */
  description?: string;
  /** Ícone ilustrativo opcional. */
  icon?: LucideIcon;
}

/**
 * Stub coerente "em construção": mantém o layout e a navegação reais, deixando
 * claro que a tela ainda será implementada nas próximas fases. Server Component.
 */
export function PageStub({
  title,
  description = 'Esta área está em construção e será liberada em breve.',
  icon = Hammer,
}: PageStubProps) {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">Em construção</p>
      </header>
      <EmptyState icon={icon} title={title} description={description} />
    </section>
  );
}
