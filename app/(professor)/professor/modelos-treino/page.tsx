import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { ListaModelos } from '@/components/professor/modelos/lista-modelos';

/**
 * Listagem de MODELOS de treino reutilizáveis (`workouts is_template=true`).
 * Leitura via RSC com `createClient()` (RLS entrega só os do tenant).
 */
export default async function ModelosTreinoPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, description, workout_exercises(count)')
    .eq('is_template', true)
    .order('name', { ascending: true });

  const modelos = (data ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    totalItens:
      (w.workout_exercises as unknown as Array<{ count: number }>)?.[0]?.count ?? 0,
  }));

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

      {error ? (
        <ErrorState
          title="Não foi possível carregar os modelos"
          description="Ocorreu um erro ao buscar os modelos. Tente novamente."
        />
      ) : modelos.length === 0 ? (
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
      ) : (
        <ListaModelos modelos={modelos} />
      )}
    </section>
  );
}
