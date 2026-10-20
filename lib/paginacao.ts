/**
 * Helpers puros de paginação server-side (architecture.md §4 / plan.md).
 *
 * A paginação da área do professor é feita no servidor via `range()` do
 * PostgREST com `count: 'exact'`, lendo `searchParams` no RSC. Estas funções
 * concentram a aritmética (sem UI, sem acesso a dados) para ser testável e
 * reutilizada por todas as listagens.
 */

/** Tamanhos de página aceitos (espelha components/ui/data-pagination.tsx). */
export const TAMANHOS_PAGINA = [10, 25, 50, 100] as const;

/** Valores padrão quando `searchParams` não traz page/pageSize válidos. */
export const PAGINA_PADRAO = 1;
export const TAMANHO_PADRAO = 10;

/** Intervalo `[from, to]` para `.range(from, to)` do Supabase (0-based, inclusivo). */
export interface IntervaloPagina {
  from: number;
  to: number;
}

/**
 * Converte um valor possivelmente inválido (string de `searchParams`, número,
 * `undefined`) num inteiro >= `minimo`, caindo no `padrao` quando não dá.
 */
function inteiroPositivo(
  valor: string | number | undefined | null,
  padrao: number,
  minimo = 1
): number {
  const n = typeof valor === 'string' ? Number.parseInt(valor, 10) : valor;
  if (n === undefined || n === null || Number.isNaN(n) || n < minimo) {
    return padrao;
  }
  return Math.floor(n);
}

/** Normaliza o número da página (1-based) vindo da URL. */
export function normalizarPagina(valor: string | number | undefined | null): number {
  return inteiroPositivo(valor, PAGINA_PADRAO);
}

/**
 * Normaliza o tamanho da página, restringindo aos tamanhos permitidos para não
 * aceitar valores arbitrários (ex.: `?pageSize=99999`) vindos da URL.
 */
export function normalizarTamanho(valor: string | number | undefined | null): number {
  const n = inteiroPositivo(valor, TAMANHO_PADRAO);
  return (TAMANHOS_PAGINA as readonly number[]).includes(n) ? n : TAMANHO_PADRAO;
}

/**
 * Calcula o intervalo 0-based `{from, to}` para `.range()` a partir de uma
 * página 1-based e do tamanho de página.
 */
export function intervaloPagina(page: number, pageSize: number): IntervaloPagina {
  const paginaSegura = Math.max(1, Math.floor(page));
  const tamanhoSeguro = Math.max(1, Math.floor(pageSize));
  const from = (paginaSegura - 1) * tamanhoSeguro;
  const to = from + tamanhoSeguro - 1;
  return { from, to };
}

/**
 * Total de páginas a partir do `count` (total de registros) e do tamanho de
 * página. Sempre >= 1 para a UI não exibir "página 1 de 0".
 */
export function totalPaginas(count: number | null, pageSize: number): number {
  const total = count ?? 0;
  const tamanhoSeguro = Math.max(1, Math.floor(pageSize));
  if (total <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / tamanhoSeguro));
}
