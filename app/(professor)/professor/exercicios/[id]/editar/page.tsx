import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { editarExercicio, type EstadoAcao } from '@/actions/exercicios';
import { ExerciseForm } from '@/components/professor/exercicios/exercise-form';

/**
 * Edição de exercício do tenant. Carrega via RSC (RLS) e submete via Server
 * Action `editarExercicio`. Exercícios globais (`tenant_id` nulo) não são
 * editáveis: redirecionamos de volta ao detalhe (o RLS também bloqueia).
 */
export default async function EditarExercicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exercicio, error } = await supabase
    .from('exercises')
    .select(
      'id, tenant_id, name, muscle_groups, equipment, instructions, tips, common_errors'
    )
    .eq('id', id)
    .single();

  if (error || !exercicio) {
    notFound();
  }

  if (exercicio.tenant_id === null) {
    redirect(`/professor/exercicios/${id}`);
  }

  async function action(formData: FormData): Promise<EstadoAcao> {
    'use server';
    return editarExercicio(id, undefined, formData);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href={`/professor/exercicios/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para o exercício
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Editar exercício</h1>
        <p className="text-sm text-muted-foreground">Atualize os dados do exercício.</p>
      </header>

      <ExerciseForm
        modo="editar"
        onSubmitAction={action}
        redirecionarPara={`/professor/exercicios/${id}`}
        valoresIniciais={{
          name: exercicio.name ?? '',
          muscle_groups: exercicio.muscle_groups ?? [],
          equipment: exercicio.equipment ?? [],
          instructions: exercicio.instructions ?? '',
          tips: exercicio.tips ?? [],
          common_errors: exercicio.common_errors ?? [],
        }}
      />
    </section>
  );
}
