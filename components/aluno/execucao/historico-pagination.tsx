import Link from 'next/link';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

/**
 * Paginação server-side por links do histórico, no PADRÃO REAL do projeto
 * (searchParams no RSC, como a listagem de treinos do professor) — e NÃO o
 * componente client `data-pagination`. Renderizada no RSC: sem estado client.
 *
 * `paramPagina` isola o nome do searchParam de página (ex.: `page` na rota do
 * aluno, `hist_page` na seção do professor) e `basePath` + `paramsExtra`
 * preservam o restante da URL (incluindo a âncora `#historico` do professor).
 * "Anterior"/"Próxima" desabilitam nos limites.
 */
export function HistoricoPagination({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  paramPagina,
  paramsExtra = {},
  hash,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath: string;
  paramPagina: string;
  paramsExtra?: Record<string, string | undefined>;
  hash?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const hrefPara = (novaPagina: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(paramsExtra)) {
      if (v && k !== paramPagina) params.set(k, v);
    }
    params.set(paramPagina, String(novaPagina));
    return `${basePath}?${params.toString()}${hash ?? ''}`;
  };

  const inicio = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, total);
  const temAnterior = page > 1;
  const temProxima = page < totalPages;

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
      aria-label="Paginação do histórico"
    >
      <p className="text-sm text-muted-foreground">
        Mostrando {inicio} a {fim} de {total} treino(s)
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
