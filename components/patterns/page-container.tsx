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
 *
 * `min-w-0 overflow-x-hidden`: o <main> do AppShell tem `overflow-y: auto`, o
 * que faz o navegador computar `overflow-x: auto` no mesmo nó. Qualquer estouro
 * horizontal de um descendente (ex.: artefato de medição do ResponsiveContainer
 * do Recharts, AspectRatio de vídeo) gerava uma 2ª barra de rolagem dentro do
 * <main> — o "scroll duplo" das telas de detalhe. Conter o eixo horizontal aqui
 * resolve de forma determinística para TODAS as páginas sem tocar o AppShell.
 * É no-op quando não há estouro (as grades usam minmax(0,1fr) e encolhem).
 */
export function PageContainer({
  width = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 space-y-6 overflow-x-hidden',
        WIDTH[width],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
