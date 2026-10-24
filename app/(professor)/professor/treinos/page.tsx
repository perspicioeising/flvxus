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
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { FichaCard } from '@/components/professor/treinos/ficha-card';
import { ClonarFicha } from '@/components/professor/treinos/clonar-ficha';
import { CriarDeModelo } from '@/components/professor/treinos/criar-de-modelo';
import { TreinosFilters } from '@/components/professor/treinos/treinos-filters';
import { TreinosPagination } from '@/components/professor/treinos/treinos-pagination';
import { SugerirTreinoIa } from '@/components/professor/ia/sugerir-treino';
import type { Database, PlanStatus } from '@/types/database.types';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Linha retornada pela RPC `search_workout_plans`. O client do `@supabase/ssr`
 * resolve o schema de `rpc()` como `any` nesta versão, então tipamos o retorno
 * a partir do `Database` (fonte única) para não cair em `any` implícito.
 */
type FichaBuscaRow =
  Database['public']['Functions']['search_workout_plans']['Returns'][number];

/** Lê um parâmetro único, ignorando arrays (ex.: `?q=a&q=b`). */
function umParam(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

/**
 * Listagem de FICHAS por aluno (`workout_plans`). Leitura via RSC (RLS entrega
 * só as fichas do tenant/professor). Busca server-side por nome da ficha OU
 * nome do aluno, paginada e com estado na URL (`?q=&page=&pageSize=`). Oferece
 * criar do zero ou a partir de um modelo.
 */
export default async function TreinosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (umParam(sp.q) ?? '').trim();
  const page = normalizarPagina(umParam(sp.page));
  const pageSize = normalizarTamanho(umParam(sp.pageSize));
  const { from } = intervaloPagina(page, pageSize);

  const supabase = await createClient();

  const [{ data, error }, { data: modelosData }, { data: alunosData }] =
    await Promise.all([
      supabase.rpc('search_workout_plans', {
        p_query: q.slice(0, 80),
        p_limit: pageSize,
        p_offset: from,
      }),
      supabase
        .from('workouts')
        .select('id, name')
        .eq('is_template', true)
        .order('name', { ascending: true }),
      supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
    ]);

  // page > 1 e janela vazia ⇒ offset além do fim: volta à página 1 (sem perder q/pageSize).
  if (!error && (!data || data.length === 0) && page > 1) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('pageSize', String(pageSize));
    redirect(`/professor/treinos?${params.toString()}`);
  }

  const linhas = (data ?? []) as FichaBuscaRow[];

  const fichas = linhas.map((f) => ({
    id: f.id,
    name: f.name,
    status: f.status as PlanStatus,
    scheduledReleaseAt: f.scheduled_release_at,
    alunoNome: f.student_name ?? null,
  }));

  // total_count chega como int do SQL; Number() blinda contra bigint->string.
  const total = Number(linhas[0]?.total_count ?? 0);
  const totalPages = totalPaginas(total, pageSize);

  const modelos = modelosData ?? [];
  const alunos = alunosData ?? [];

  const paramsParaLinks = {
    q: q || undefined,
    pageSize: String(pageSize),
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Treinos"
        subtitle="Fichas de treino por aluno. Só fichas liberadas ficam visíveis ao aluno."
        actions={
          <>
            <SugerirTreinoIa alunos={alunos} />
            <CriarDeModelo modelos={modelos} alunos={alunos} />
            <Button asChild className="min-h-11">
              <Link href="/professor/treinos/nova">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Nova ficha
              </Link>
            </Button>
          </>
        }
      />

      {alunos.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Para montar uma ficha você precisa de um aluno.{' '}
          <Link href="/professor/alunos/novo" className="font-medium text-foreground underline">
            Cadastre um aluno
          </Link>{' '}
          e o botão “Criar a partir de modelo” será liberado.
        </p>
      ) : modelos.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Você ainda não tem modelos de treino.{' '}
          <Link href="/professor/modelos-treino/novo" className="font-medium text-foreground underline">
            Crie um modelo
          </Link>{' '}
          para reaproveitá-lo em várias fichas.
        </p>
      ) : null}

      <TreinosFilters initialQuery={q} />

      {error ? (
        <ErrorState
          title="Não foi possível carregar as fichas"
          description="Ocorreu um erro ao buscar as fichas. Tente novamente."
        />
      ) : fichas.length === 0 ? (
        <EmptyStateTreinos temFiltro={Boolean(q)} />
      ) : (
        <>
          <ul className="space-y-3">
            {fichas.map((ficha) => (
              <li key={ficha.id} className="relative">
                <FichaCard ficha={ficha} />
                {/* Ação discreta no canto do card; irmã do Link (não aninhada),
                    então clicar aqui abre o diálogo sem navegar e clicar no
                    restante do card abre o detalhe. */}
               
              </li>
            ))}
          </ul>

          <TreinosPagination
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

/** Estado vazio: distingue "sem fichas ainda" de "sem resultados para a busca". */
function EmptyStateTreinos({ temFiltro }: { temFiltro: boolean }) {
  if (temFiltro) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma ficha encontrada"
        description="Ajuste a busca para ver mais resultados."
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        icon={ClipboardList}
        title="Nenhuma ficha ainda"
        description="Crie a primeira ficha de treino para um aluno, do zero ou a partir de um modelo."
      />
      <Button asChild className="min-h-11">
        <Link href="/professor/treinos/nova">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nova ficha
        </Link>
      </Button>
    </div>
  );
}
