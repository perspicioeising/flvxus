import Link from 'next/link';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/**
 * Paginação server-side por links (preserva `searchParams`). Renderizada no RSC
 * da listagem — sem estado client. "Anterior"/"Próxima" desabilitam nos limites.
 */
export function ExercisesPagination({
  page,
  totalPages,
  total,
  pageSize,
  searchParams,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}) {
  const hrefPara = (novaPagina: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== 'page') params.set(k, v);
    }
    params.set('page', String(novaPagina));
    return `/professor/exercicios?${params.toString()}`;
  };

  const inicio = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, total);
  const temAnterior = page > 1;
  const temProxima = page < totalPages;

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
      aria-label="Paginação de exercícios"
    >
      <p className="text-sm text-muted-foreground">
        Mostrando {inicio} a {fim} de {total} exercício(s)
      </p>

      <div className="flex items-center gap-2">
        {temAnterior ? (
          <Link
            href={hrefPara(page - 1)}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11')}
            rel="prev"
          >
            Anterior
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'min-h-11 pointer-events-none opacity-50'
            )}
            aria-disabled="true"
          >
            Anterior
          </span>
        )}

        <span className="text-sm text-muted-foreground" aria-current="page">
          Página {page} de {totalPages}
        </span>

        {temProxima ? (
          <Link
            href={hrefPara(page + 1)}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11')}
            rel="next"
          >
            Próxima
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'min-h-11 pointer-events-none opacity-50'
            )}
            aria-disabled="true"
          >
            Próxima
          </span>
        )}
      </div>
    </nav>
  );
}
