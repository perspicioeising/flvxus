import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateAction {
  /** Rótulo do botão de ação (pt-BR). */
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ícone ilustrativo (lucide-react). Padrão: caixa de entrada vazia. */
  icon?: LucideIcon;
  /** Título curto do estado vazio. */
  title: string;
  /** Descrição opcional orientando o próximo passo. */
  description?: string;
  /** Ação sugerida (ex.: "Adicionar aluno"). */
  action?: EmptyStateAction;
}

/**
 * Estado vazio padrão (ADR 0006 / architecture.md §9).
 * Ícone + título + descrição + ação sugerida. Mobile-first, centralizado,
 * com alvo de toque ≥ 44px no botão de ação.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-4 py-10 text-center',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <Button
          type="button"
          onClick={action.onClick}
          className="mt-2 min-h-11 px-6"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
