import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClipboardList, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import {
  intervaloPagina,
  normalizarPagina,
  normalizarTamanho,
  totalPaginas,
} from '@/lib/paginacao';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { ListaModelos } from '@/components/professor/modelos/lista-modelos';
import { ModelosFilters } from '@/components/professor/modelos/modelos-filters';
import { ModelosPagination } from '@/components/professor/modelos/modelos-pagination';

type SearchParams = Record<string, string | string[] | undefined>;

/** Lê um parâmetro único, ignorando arrays (ex.: `?q=a&q=b`). */
function umParam(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

/**
 * Listagem de MODELOS de treino reutilizáveis (`workouts is_template=true`).
 * Leitura via RSC com `createClient()` (RLS entrega só os do tenant). Busca por
 * nome e paginação server-side com estado na URL (`?q=&page=&pageSize=`),
 * ordenada por `created_at desc` (último modelo cadastrado primeiro) — espelha
 * o padrão da tela de fichas (`/professor/treinos`).
 */
export default async function ModelosTreinoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (umParam(sp.q) ?? '').trim();
  const page = normalizarPagina(umParam(sp.page));
  const pageSize = normalizarTamanho(umParam(sp.pageSize));
  const { from, to } = intervaloPagina(page, pageSize);

  const supabase = await createClient();

  let consulta = supabase
    .from('workouts')
    .select('id, name, description, workout_exercises(count)', { count: 'exact' })
    .eq('is_template', true);

  if (q) {
    consulta = consulta.ilike('name', `%${q}%`);
  }

  const { data, error, count } = await consulta
    .order('created_at', { ascending: false })
    .range(from, to);

  // page > 1 e janela vazia ⇒ offset além do fim: volta à página 1 (sem perder q/pageSize).
  if (!error && (!data || data.length === 0) && page > 1) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('pageSize', String(pageSize));
    redirect(`/professor/modelos-treino?${params.toString()}`);
  }

  const modelos = (data ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    totalItens:
      (w.workout_exercises as unknown as Array<{ count: number }>)?.[0]?.count ?? 0,
  }));

  const total = count ?? 0;
  const totalPages = totalPaginas(total, pageSize);

  const paramsParaLinks = {
    q: q || undefined,
    pageSize: String(pageSize),
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">
            Modelos de treino
          </h1>
          <p className="text-sm text-muted-foreground">
            Rotinas reutilizáveis para montar fichas de alunos mais rápido.
          </p>
        </div>
        <Button asChild className="min-h-11">
          <Link href="/professor/modelos-treino/novo">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo modelo
          </Link>
        </Button>
      </header>

      <ModelosFilters initialQuery={q} />

      {error ? (
        <ErrorState
          title="Não foi possível carregar os modelos"
          description="Ocorreu um erro ao buscar os modelos. Tente novamente."
        />
      ) : modelos.length === 0 ? (
        q ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum modelo encontrado"
            description="Ajuste a busca para ver mais resultados."
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <EmptyState
              icon={ClipboardList}
              title="Nenhum modelo ainda"
              description="Crie um modelo reutilizável para montar fichas com poucos cliques."
            />
            <Button asChild className="min-h-11">
              <Link href="/professor/modelos-treino/novo">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Novo modelo
              </Link>
            </Button>
          </div>
        )
      ) : (
        <>
          <ListaModelos modelos={modelos} />

          <ModelosPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            searchParams={paramsParaLinks}
          />
        </>
      )}
    </section>
  );
}
