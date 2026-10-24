import Link from 'next/link';
import { Dumbbell, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import {
  intervaloPagina,
  normalizarPagina,
  normalizarTamanho,
  totalPaginas,
} from '@/lib/paginacao';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from '@/components/professor/exercicios/exercise-card';
import { ExerciseFilters } from '@/components/professor/exercicios/exercise-filters';
import { ExercisesPagination } from '@/components/professor/exercicios/exercises-pagination';

type SearchParams = Record<string, string | string[] | undefined>;

/** Lê um parâmetro único, ignorando arrays (ex.: `?q=a&q=b`). */
function umParam(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function ExerciciosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (umParam(sp.q) ?? '').trim();
  const muscleGroup = (umParam(sp.muscle_group) ?? '').trim();
  const equipment = (umParam(sp.equipment) ?? '').trim();
  const page = normalizarPagina(umParam(sp.page));
  const pageSize = normalizarTamanho(umParam(sp.pageSize));
  const { from, to } = intervaloPagina(page, pageSize);

  const supabase = await createClient();

  // RLS já entrega catálogo global (tenant_id null) + exercícios do tenant.
  let query = supabase
    .from('exercises')
    .select('id, name, muscle_groups, equipment, tenant_id', { count: 'exact' });

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }
  if (muscleGroup) {
    query = query.contains('muscle_groups', [muscleGroup]);
  }
  if (equipment) {
    query = query.contains('equipment', [equipment]);
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to);

  const paramsParaLinks = {
    q: q || undefined,
    muscle_group: muscleGroup || undefined,
    equipment: equipment || undefined,
    pageSize: String(pageSize),
  };

  const temFiltro = Boolean(q || muscleGroup || equipment);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-5xl">Exercícios</h1>
          <p className="text-sm text-muted-foreground">
            Biblioteca de exercícios do catálogo e os criados por você.
          </p>
        </div>
        <Button asChild className="min-h-11">
          <Link href="/professor/exercicios/novo">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo exercício
          </Link>
        </Button>
      </header>

      <ExerciseFilters
        initialQuery={q}
        initialMuscleGroup={muscleGroup}
        initialEquipment={equipment}
      />

      {error ? (
        <ErrorState
          title="Não foi possível carregar os exercícios"
          description="Ocorreu um erro ao buscar a biblioteca. Tente novamente."
        />
      ) : !data || data.length === 0 ? (
        temFiltro ? (
          <EmptyState
            icon={Dumbbell}
            title="Nenhum exercício encontrado"
            description="Ajuste a busca ou os filtros para ver mais resultados."
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <EmptyState
              icon={Dumbbell}
              title="Sua biblioteca está vazia"
              description="Crie o primeiro exercício para montar treinos para seus alunos."
            />
            <Button asChild className="min-h-11">
              <Link href="/professor/exercicios/novo">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Novo exercício
              </Link>
            </Button>
          </div>
        )
      ) : (
        <>
          <ul className="space-y-3">
            {data.map((exercicio) => (
              <li key={exercicio.id}>
                <ExerciseCard exercicio={exercicio} />
              </li>
            ))}
          </ul>

          <ExercisesPagination
            page={page}
            totalPages={totalPaginas(count, pageSize)}
            total={count ?? 0}
            pageSize={pageSize}
            searchParams={paramsParaLinks}
          />
        </>
      )}
    </section>
  );
}
