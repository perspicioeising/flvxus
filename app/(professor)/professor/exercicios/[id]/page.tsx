import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Lightbulb, Lock, Pencil, TriangleAlert } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { signExerciseMedia } from '@/lib/storage';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer, StatusBadge } from '@/components/patterns';
import { ExerciseMedia } from '@/components/professor/exercicios/exercise-media';
import { ExerciseMediaUpload } from '@/components/professor/exercicios/exercise-media-upload';
import { ExerciseDeleteButton } from '@/components/professor/exercicios/exercise-delete-button';
import { ExerciseDuplicateButton } from '@/components/professor/exercicios/exercise-duplicate-button';

export default async function ExercicioDetalhePage({
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

  const ehGlobal = exercicio.tenant_id === null;

  // Mídia SEMPRE por URL assinada de TTL curto (bucket privado). Nunca pública.
  const [videoUrl, thumbnailUrl] = await Promise.all([
    exercicio.video_url ? signExerciseMedia(exercicio.video_url) : Promise.resolve(null),
    exercicio.thumbnail_url ? signExerciseMedia(exercicio.thumbnail_url) : Promise.resolve(null),
  ]);

  const tips = exercicio.tips ?? [];
  const errosComuns = exercicio.common_errors ?? [];

  return (
    <PageContainer>
      <div>
        <Link
          href="/professor/exercicios"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para exercícios
        </Link>
      </div>

      {/* Cabeçalho do exercício */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-4xl">
              {exercicio.name}
            </h1>
            {ehGlobal ? (
              <StatusBadge tone="neutral" className="normal-case">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Catálogo (somente leitura)
              </StatusBadge>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {(exercicio.muscle_groups ?? []).map((grupo: string) => (
              <StatusBadge key={grupo} tone="brand" className="normal-case">
                {grupo}
              </StatusBadge>
            ))}
            {(exercicio.equipment ?? []).map((equip: string) => (
              <StatusBadge key={equip} tone="neutral" className="normal-case">
                {equip}
              </StatusBadge>
            ))}
          </div>
        </div>

        {ehGlobal ? (
          // Exercício do catálogo global: imutável, mas o professor pode
          // duplicar para o próprio acervo e então personalizar a cópia.
          <div className="flex shrink-0">
            <ExerciseDuplicateButton exerciseId={id} />
          </div>
        ) : (
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/professor/exercicios/${id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Editar
              </Link>
            </Button>
            <ExerciseDeleteButton exerciseId={id} nome={exercicio.name} />
          </div>
        )}
      </div>

      {/* Mídia + conteúdo descritivo */}
      <Card className="rounded-2xl">
        <CardContent className="space-y-6 p-4 sm:p-6">
          <ExerciseMedia videoUrl={videoUrl} thumbnailUrl={thumbnailUrl} nome={exercicio.name} />

          {exercicio.instructions ? (
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Instruções</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {exercicio.instructions}
              </p>
            </div>
          ) : null}

          {tips.length > 0 ? (
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
                Dicas
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {tips.map((dica: string, i: number) => (
                  <li key={`${dica}-${i}`}>{dica}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {errosComuns.length > 0 ? (
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <TriangleAlert className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Erros comuns
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {errosComuns.map((erro: string, i: number) => (
                  <li key={`${erro}-${i}`}>{erro}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Upload de mídia apenas para exercícios do tenant (o global é imutável). */}
      {!ehGlobal ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Mídia demonstrativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ExerciseMediaUpload exerciseId={id} kind="video" />
            <ExerciseMediaUpload exerciseId={id} kind="thumbnail" />
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
