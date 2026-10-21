'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Player de vídeo demonstrativo compartilhado entre a execução do aluno e a
 * biblioteca do professor. As URLs chegam SEMPRE já assinadas (TTL curto) do
 * RSC — este componente apenas exibe, nunca assina mídia.
 *
 * Fechado: miniatura compacta (AspectRatio 16/9 + limite de altura) para que
 * vídeos verticais 9:16 não cresçam demais. Ao dar play, abre um Dialog com o
 * vídeo em área maior.
 */
export function ExerciseVideoPlayer({
  videoUrl,
  thumbnailUrl,
  nome,
}: {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  nome: string;
}) {
  const [aberto, setAberto] = useState(false);

  // Sem nenhuma mídia: o chamador decide o fallback de "sem mídia".
  if (!videoUrl && !thumbnailUrl) {
    return null;
  }

  // Miniatura compacta reutilizada nos dois ramos (com e sem vídeo).
  const miniatura = (
    <AspectRatio
      ratio={16 / 9}
      className="mx-auto max-h-[40vh] w-auto overflow-hidden rounded-xl border border-border bg-black"
    >
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL assinada de TTL curto do Storage privado; não é otimizável pelo next/image.
        <img
          src={thumbnailUrl}
          alt={`Demonstração do exercício ${nome}`}
          className="h-full w-full object-contain"
        />
      ) : null}
    </AspectRatio>
  );

  // Apenas thumbnail (sem vídeo): imagem compacta, sem play nem Dialog.
  if (!videoUrl) {
    return miniatura;
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <div className="relative mx-auto max-h-[40vh] w-auto">
        {miniatura}
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`Reproduzir vídeo demonstrativo de ${nome}`}
            className="absolute inset-0 mx-auto flex min-h-11 min-w-11 items-center justify-center"
          >
            <span className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/60 text-foreground">
              <Play className="h-6 w-6" aria-hidden="true" />
            </span>
          </button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="sr-only">
          Vídeo demonstrativo de {nome}
        </DialogTitle>
        <video
          controls
          autoPlay
          preload="metadata"
          poster={thumbnailUrl ?? undefined}
          className="w-full max-h-[80vh] object-contain bg-black"
        >
          <source src={videoUrl} />
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </DialogContent>
    </Dialog>
  );
}
