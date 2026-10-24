import * as React from 'react';

import { cn } from '@/lib/utils';

export type StatusTone =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tom do selo. */
  tone?: StatusTone;
  children: React.ReactNode;
}

const TONE: Record<StatusTone, string> = {
  brand: 'bg-primary-soft text-primary-soft-foreground',
  success: 'bg-primary-soft text-primary-soft-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-info text-info-foreground',
};

/**
 * Selo de status genérico (não colide com o StatusBadge de domínio de treinos).
 * Mapa de tons completo; todas as classes resolvem no Tailwind.
 */
export function StatusBadge({
  tone = 'neutral',
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide',
        TONE[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
