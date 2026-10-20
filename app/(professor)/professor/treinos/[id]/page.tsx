import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Separator } from '@/components/ui/separator';
import { FichaForm, type AlunoOpcao } from '@/components/professor/treinos/ficha-form';
import { StatusControl } from '@/components/professor/treinos/status-control';
import { FichaDeleteButton } from '@/components/professor/treinos/delete-buttons';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';
import type { ItemEditavel } from '@/components/professor/treinos/item-editor';
import type { PlanStatus } from '@/types/database.types';

/** Converte um valor numérico do banco em string para os inputs do editor. */
function num(valor: number | null): string {
  return valor === null || valor === undefined ? '' : String(valor);
}

/**
 * Detalhe/edição de uma FICHA. Reúne o controle de status (com indicação clara
 * do que o aluno vê), o editor de itens por dia da semana e a exclusão. O RLS
 * impede abrir ficha de outro tenant (vazio → 404).
 */
export default async function FichaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ficha } = await supabase
    .from('workout_plans')
    .select('id, name, status, student_id, source_workout_id')
    .eq('id', id)
    .single();

  if (!ficha) {
    notFound();
  }

  const [{ data: itensData }, { data: alunosData }, { data: exerciciosData }] =
    await Promise.all([
      supabase
        .from('workout_plan_items')
        .select(
          'id, exercise_id, weekday, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name)'
        )
        .eq('plan_id', id)
        .order('order_index', { ascending: true }),
      supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
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
    weekday: item.weekday,
  }));

  const alunos: AlunoOpcao[] = alunosData ?? [];
  const exercicios: ExercicioDisponivel[] = exerciciosData ?? [];

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/professor/treinos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para treinos
        </Link>
        <FichaDeleteButton planId={ficha.id} nome={ficha.name} />
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{ficha.name}</h1>
        <p className="text-sm text-muted-foreground">
          Controle o status e os exercícios desta ficha.
        </p>
      </header>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Status</h2>
        <StatusControl planId={ficha.id} statusAtual={ficha.status as PlanStatus} />
      </div>

      <Separator />

      <FichaForm
        modo="editar"
        planId={ficha.id}
        exercicios={exercicios}
        alunos={alunos}
        valoresIniciais={{
          student_id: ficha.student_id,
          name: ficha.name,
          source_workout_id: ficha.source_workout_id,
          itens,
        }}
      />
    </section>
  );
}
