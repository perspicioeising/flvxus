import * as React from 'react';

import { cn } from '@/lib/utils';
import { LoadingState } from './loading-state';
import { EmptyState, type EmptyStateProps } from './empty-state';

export interface DataListProps<T> {
  /** Itens a renderizar. */
  items: T[];
  /** Render de cada item. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Chave estável por item. */
  getKey: (item: T, index: number) => React.Key;
  /** Estado de carregamento. */
  loading?: boolean;
  /** Propriedades do estado vazio. */
  empty?: EmptyStateProps;
  /** Linhas do skeleton de carregamento. */
  loadingRows?: number;
  className?: string;
}

/**
 * Lista server-safe com estados empty/loading/filled padronizados.
 * Não usa estado próprio; o chamador decide loading/empty.
 */
export function DataList<T>({
  items,
  renderItem,
  getKey,
  loading = false,
  empty,
  loadingRows = 3,
  className,
}: DataListProps<T>) {
  if (loading) {
    return <LoadingState rows={loadingRows} />;
  }

  if (items.length === 0) {
    return empty ? <EmptyState {...empty} /> : null;
  }

  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <li key={getKey(item, index)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
