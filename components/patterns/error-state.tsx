'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  ErrorBoundary,
  type ErrorBoundaryProps,
  type FallbackProps,
} from 'react-error-boundary';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título do erro. */
  title?: string;
  /** Mensagem explicativa (pt-BR). */
  description?: string;
  /** Ação de nova tentativa. */
  onRetry?: () => void;
  /** Rótulo do botão de retry. */
  retryLabel?: string;
}

/**
 * Estado de erro padrão (ADR 0006 / architecture.md §9).
 * Mensagem amigável em pt-BR + botão de nova tentativa. Mobile-first,
 * acessível (role="alert"), alvo de toque ≥ 44px no botão.
 */
export function ErrorState({
  title = 'Algo deu errado',
  description = 'Não foi possível carregar estas informações. Tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-2 min-h-11 px-6"
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Error boundary de produto: captura exceções de render e exibe o ErrorState
 * com retry via react-error-boundary. Use `onReset`/`resetKeys` para
 * recarregar os dados ao tentar novamente.
 */
export function PatternErrorBoundary({
  children,
  title,
  description,
  retryLabel,
  ...boundaryProps
}: Omit<ErrorBoundaryProps, 'fallback' | 'fallbackRender' | 'FallbackComponent'> & {
  children: React.ReactNode;
  title?: string;
  description?: string;
  retryLabel?: string;
}) {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }: FallbackProps) => (
        <ErrorState
          title={title}
          description={description}
          retryLabel={retryLabel}
          onRetry={resetErrorBoundary}
        />
      )}
      {...boundaryProps}
    >
      {children}
    </ErrorBoundary>
  );
}
