import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Separator } from '@/components/ui/separator';
import { FichaForm, type AlunoOpcao } from '@/components/professor/treinos/ficha-form';
import { rotationStepsSchema, type RotationStepInput } from '@/schemas/treino';
import { StatusControl } from '@/components/professor/treinos/status-control';
import { AgendarLiberacao } from '@/components/professor/treinos/agendar-liberacao';
import { FichaDeleteButton } from '@/components/professor/treinos/delete-buttons';
import { ClonarFicha } from '@/components/professor/treinos/clonar-ficha';
import type { ExercicioDisponivel } from '@/components/professor/treinos/exercise-picker';
import type { ItemEditavel, SerieEditavel } from '@/components/professor/treinos/item-editor';
import type { PlanStatus, SetKind } from '@/types/database.types';

/** Converte um valor numérico do banco em string para os inputs do editor. */
function num(valor: number | null): string {
  return valor === null || valor === undefined ? '' : String(valor);
}

/** Linha de série lida do join aninhado de `workout_plan_item_sets`. */
interface SerieLinha {
  set_number: number;
  kind: SetKind;
  note: string | null;
  target_reps: string | null;
  rest_seconds: number | null;
  target_load: number | null;
}

/**
 * Hidrata as séries detalhadas salvas (ordenadas por `set_number`) para o
 * editor. Retorna `undefined` quando não há linhas — o editor trata ausência
 * como "sem detalhamento" (padrão 'Trabalho'), preservando o legado e evitando
 * que o delete+insert de `editarFicha` apague séries não recarregadas.
 */
function hidratarSeries(linhas: SerieLinha[] | null | undefined): SerieEditavel[] | undefined {
  if (!linhas || linhas.length === 0) return undefined;
  return [...linhas]
    .sort((a, b) => a.set_number - b.set_number)
    .map((linha) => ({
      set_number: linha.set_number,
      kind: linha.kind,
      note: linha.note ?? '',
      target_reps: linha.target_reps ?? undefined,
      rest_seconds: linha.rest_seconds === null ? undefined : String(linha.rest_seconds),
      target_load: linha.target_load === null ? undefined : String(linha.target_load),
    }));
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
    .select(
      'id, name, status, student_id, source_workout_id, scheduled_release_at, rotation_steps'
    )
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
          'id, exercise_id, weekday, division, order_index, sets, reps, rest_seconds, target_load, notes, exercises(name, muscle_groups), workout_plan_item_sets(set_number, kind, note, target_reps, rest_seconds, target_load)'
        )
        .eq('plan_id', id)
        .order('order_index', { ascending: true }),
      supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
      // RLS libera catálogo global (tenant_id IS NULL) + do tenant. O seletor
      // deve mostrar só os do tenant; os globais chegam pela ação "Importar da
      // biblioteca" (separada). Sem o filtro, cada exercício importado
      // apareceria 2x (global + cópia do tenant via source_exercise_id).
      supabase
        .from('exercises')
        .select('id, name, muscle_groups')
        .not('tenant_id', 'is', null)
        .order('name', { ascending: true }),
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
    division: item.division,
    muscle_groups:
      (item.exercises as unknown as { muscle_groups: string[] | null } | null)
        ?.muscle_groups ?? [],
    series: hidratarSeries(item.workout_plan_item_sets as SerieLinha[] | null),
  }));

  const alunos: AlunoOpcao[] = alunosData ?? [];
  const exercicios: ExercicioDisponivel[] = exerciciosData ?? [];

  // Sequência de rotação persistida (jsonb). Forma inválida/ausente → `null`
  // (rotação automática), para não travar a edição por dados legados.
  const rotacaoParsed = rotationStepsSchema.safeParse(ficha.rotation_steps);
  const rotationSteps: RotationStepInput[] | null = rotacaoParsed.success
    ? rotacaoParsed.data
    : null;

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
        <div className="flex items-center gap-2">
          <ClonarFicha
            sourcePlanId={ficha.id}
            sourceName={ficha.name}
            alunos={alunos}
            variant="botao"
          />
          <FichaDeleteButton planId={ficha.id} nome={ficha.name} />
        </div>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">{ficha.name}</h1>
        <p className="text-sm text-muted-foreground">
          Controle o status e os exercícios desta ficha.
        </p>
      </header>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Status</h2>
        <StatusControl planId={ficha.id} statusAtual={ficha.status as PlanStatus} />
        <AgendarLiberacao
          planId={ficha.id}
          statusAtual={ficha.status as PlanStatus}
          scheduledReleaseAt={ficha.scheduled_release_at}
        />
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
          rotationSteps,
        }}
      />
    </section>
  );
}
