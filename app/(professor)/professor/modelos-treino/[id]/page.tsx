import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { ModeloForm } from '@/components/professor/treinos/modelo-form';
import { ModeloDeleteButton } from '@/components/professor/treinos/delete-buttons';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';
import type { ItemEditavel } from '@/components/professor/treinos/item-editor';

/** Converte um valor numérico do banco em string para os inputs do editor. */
function num(valor: number | null): string {
  return valor === null || valor === undefined ? '' : String(valor);
}

/**
 * Edição de MODELO de treino. Carrega o cabeçalho + itens (com o nome do
 * exercício) e a biblioteca para o seletor. O RLS impede abrir modelo de outro
 * tenant (retorna vazio → 404).
 */
export default async function EditarModeloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: modelo } = await supabase
    .from('workouts')
    .select('id, name, description, is_template')
    .eq('id', id)
    .eq('is_template', true)
    .single();

  if (!modelo) {
    notFound();
  }

  const [{ data: itensData }, { data: exerciciosData }] = await Promise.all([
    supabase
      .from('workout_exercises')
      .select(
        'id, exercise_id, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name)'
      )
      .eq('workout_id', id)
      .order('order_index', { ascending: true }),
    supabase.from('exercises').select('id, name, muscle_groups').order('name', { ascending: true }),
  ]);

  const itens: ItemEditavel[] = (itensData ?? []).map((item) => ({
    key: item.id,
    exercise_id: item.exercise_id,
    exercise_name:
      (item.exercises as unknown as { name: string } | null)?.name ?? 'Exercício',
    sets: num(item.sets),
    reps: item.reps ?? '',
    rest_seconds: num(item.rest_seconds),
    target_load: num(item.target_load),
    notes: item.notes ?? '',
    weekday: null,
  }));

  const exercicios: ExercicioDisponivel[] = exerciciosData ?? [];

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/professor/modelos-treino"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para modelos
        </Link>
        <ModeloDeleteButton workoutId={modelo.id} nome={modelo.name} />
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar modelo</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste os exercícios e a ordem. Salvar substitui a lista atual.
        </p>
      </header>

      <ModeloForm
        modo="editar"
        workoutId={modelo.id}
        exercicios={exercicios}
        valoresIniciais={{
          name: modelo.name,
          description: modelo.description ?? '',
          itens,
        }}
      />
    </section>
  );
}
