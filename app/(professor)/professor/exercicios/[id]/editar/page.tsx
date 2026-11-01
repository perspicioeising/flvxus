import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { signExerciseMedia } from '@/lib/storage';
import { editarExercicio, type EstadoAcao } from '@/actions/exercicios';
import { ExerciseForm } from '@/components/professor/exercicios/exercise-form';
import { ExerciseMedia } from '@/components/professor/exercicios/exercise-media';
import { ExerciseMediaUpload } from '@/components/professor/exercicios/exercise-media-upload';
import { ExerciseMediaDeleteButton } from '@/components/professor/exercicios/exercise-media-delete-button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
      'id, tenant_id, name, muscle_groups, equipment, instructions, tips, common_errors, video_url, thumbnail_url'
    )
    .eq('id', id)
    .single();

  if (error || !exercicio) {
    notFound();
  }

  if (exercicio.tenant_id === null) {
    redirect(`/professor/exercicios/${id}`);
  }

  // Mídia SEMPRE por URL assinada de TTL curto (bucket privado). Nunca pública.
  const [videoUrl, thumbnailUrl] = await Promise.all([
    exercicio.video_url ? signExerciseMedia(exercicio.video_url) : Promise.resolve(null),
    exercicio.thumbnail_url
      ? signExerciseMedia(exercicio.thumbnail_url)
      : Promise.resolve(null),
  ]);

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

      {/* Mídia demonstrativa gerida INLINE na edição: preview da mídia atual
          (URL assinada) + envio/exclusão pelas actions dedicadas. É um fluxo
          independente do salvar do texto acima — salvar o texto NÃO toca a
          mídia (ver `exercicioDeDados` em actions/exercicios.ts). */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">Mídia demonstrativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExerciseMedia videoUrl={videoUrl} thumbnailUrl={thumbnailUrl} nome={exercicio.name} />

          {/* Existência checada pelas colunas CRUAS do banco (não pelas URLs
              assinadas): uma falha ao assinar retorna null mas a mídia existe,
              então o botão de excluir deve continuar disponível. */}
          <div className="space-y-2">
            <ExerciseMediaUpload exerciseId={id} kind="video" />
            {exercicio.video_url ? (
              <ExerciseMediaDeleteButton exerciseId={id} kind="video" />
            ) : null}
          </div>
          <div className="space-y-2">
            <ExerciseMediaUpload exerciseId={id} kind="thumbnail" />
            {exercicio.thumbnail_url ? (
              <ExerciseMediaDeleteButton exerciseId={id} kind="thumbnail" />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
