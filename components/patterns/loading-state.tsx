import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Quantidade de linhas de skeleton a renderizar. */
  rows?: number;
  /** Texto para leitores de tela enquanto carrega. */
  label?: string;
  /** `skeleton` (padrão) ou `spinner` (centralizado). */
  variant?: 'skeleton' | 'spinner';
}

/**
 * Estado de carregamento padrão (ADR 0006 / architecture.md §9).
 * Mostra skeletons (ou um spinner) e anuncia o carregamento para tecnologias
 * assistivas. Mobile-first: ocupa a largura disponível.
 */
export function LoadingState({
  rows = 3,
  label = 'Carregando…',
  variant = 'skeleton',
  className,
  ...props
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          'flex w-full items-center justify-center py-10 text-muted-foreground',
          className
        )}
        {...props}
      >
        <span className="sr-only">{label}</span>
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('w-full space-y-3', className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
