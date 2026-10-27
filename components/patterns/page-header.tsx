import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Título da página. Expõe exatamente 1 <h1>. */
  title: React.ReactNode;
  /** Subtítulo opcional abaixo do título. */
  subtitle?: React.ReactNode;
  /** Ações à direita (ex.: botão primário). */
  actions?: React.ReactNode;
  /**
   * Ênfase tipográfica do título.
   * `default` = forte; `caps` = caixa-alta gigante (padrão do aluno v2).
   */
  emphasis?: 'default' | 'caps';
  className?: string;
}

/**
 * Cabeçalho de página padrão. Garante exatamente 1 <h1>, com variante
 * caixa-alta gigante (`emphasis="caps"`) para a área do aluno (escala v2).
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  emphasis = 'default',
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1
          className={cn(
            emphasis === 'caps'
              ? 'text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-5xl'
              : 'text-2xl font-bold tracking-tight md:text-3xl'
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        // Mobile: ações quebram em várias linhas (flex-wrap) em vez de
        // transbordar numa linha única com scroll horizontal. Desktop (sm+):
        // linha única encostada à direita, sem encolher.
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
