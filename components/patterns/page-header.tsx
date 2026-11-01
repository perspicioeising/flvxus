import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Slot acima do título: breadcrumb (desktop) ou botão voltar (mobile). */
  eyebrow?: React.ReactNode;
  emphasis?: 'default' | 'caps';
  /** id do <h1>, para `aria-labelledby` na <section> da página. */
  titleId?: string;
  className?: string;
}

export function PageHeader({
  title, subtitle, actions, eyebrow, emphasis = 'default', titleId, className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6',
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? <div className="text-sm text-muted-foreground">{eyebrow}</div> : null}
        <h1
          id={titleId}
          className={cn(
            'text-balance break-words',
            emphasis === 'caps'
              ? 'text-[clamp(2rem,9vw,3rem)] font-black uppercase leading-[0.95] tracking-tight'
              : 'text-2xl font-bold tracking-tight md:text-3xl'
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-prose text-pretty text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        // Mobile: ação primária ocupa a largura toda (alvo grande, fácil de tocar).
        // Desktop: encostada à direita, largura natural.
        <div
          className={cn(
            'flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:shrink-0',
            '[&>*]:w-full sm:[&>*]:w-auto'
          )}
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}