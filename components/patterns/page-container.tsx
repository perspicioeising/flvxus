import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Largura máxima do conteúdo. */
  width?: 'default' | 'wide';
}

const WIDTH: Record<NonNullable<PageContainerProps['width']>, string> = {
  default: 'max-w-2xl',
  wide: 'max-w-4xl',
};

/**
 * Container centralizado das páginas. O <main> do AppShell cuida de
 * padding/scroll; este container cuida de largura máxima e respiro vertical.
 */
export function PageContainer({
  width = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full space-y-6', WIDTH[width], className)}
      {...props}
    >
      {children}
    </div>
  );
}
