import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/patterns';

/** Um item de pendência com link para a área correspondente. */
export interface PendenciaItem {
  id: string;
  /** Texto principal (ex.: nome do aluno ou da ficha). */
  titulo: string;
  /** Texto secundário opcional (ex.: "há 120 dias"). */
  descricao?: string | null;
  /** Rota de destino do item. */
  href: string;
  /** Rótulo opcional exibido como Badge (ex.: status da ficha). */
  badge?: { label: string; variant?: BadgeProps['variant'] };
}

export interface PendenciasCardProps {
  /** Título do bloco. */
  titulo: string;
  /** Descrição curta do bloco. */
  descricao: string;
  /** Ícone do cabeçalho. */
  icon: LucideIcon;
  /** Itens de pendência (já limitados/ordenados pelo chamador). */
  itens: PendenciaItem[];
  /** Estado vazio: título exibido quando não há pendências. */
  vazioTitulo: string;
  /** Estado vazio: descrição. */
  vazioDescricao: string;
  /** Link opcional "ver todos" no rodapé do bloco. */
  verTodos?: { label: string; href: string };
}

/**
 * Bloco de pendências do painel: cabeçalho + lista compacta com links para a
 * área correspondente, ou EmptyState quando não há nada a resolver.
 * Mobile-first, acessível (alvos de toque ≥ 44px, foco visível).
 */
export function PendenciasCard({
  titulo,
  descricao,
  icon: Icon,
  itens,
  vazioTitulo,
  vazioDescricao,
  verTodos,
}: PendenciasCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          {titulo}
        </CardTitle>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        {itens.length === 0 ? (
          <EmptyState title={vazioTitulo} description={vazioDescricao} />
        ) : (
          <ul className="divide-y divide-border">
            {itens.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {item.titulo}
                    </span>
                    {item.descricao ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.descricao}
                      </span>
                    ) : null}
                  </span>
                  {item.badge ? (
                    <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
                  ) : null}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {verTodos && itens.length > 0 ? (
        <div className="border-t border-border p-3">
          <Link
            href={verTodos.href}
            className="flex min-h-11 items-center justify-center gap-1 rounded-md text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {verTodos.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
