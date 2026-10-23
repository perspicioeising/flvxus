import { Film } from 'lucide-react';

import { ExerciseVideoPlayer } from '@/components/shared/exercise-video-player';

/**
 * Preview de mídia do exercício. As URLs são resolvidas no servidor via
 * `lib/storage.signExerciseMedia` (PATH privado → URL assinada de TTL curto;
 * URL http(s) pública → repassada direto) — este componente apenas recebe as
 * URLs já prontas, nunca monta URL pública por conta própria.
 */
export function ExerciseMedia({
  videoUrl,
  thumbnailUrl,
  nome,
}: {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  nome: string;
}) {
  if (!videoUrl && !thumbnailUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-muted-foreground">
        <Film className="h-8 w-8" aria-hidden="true" />
        <p className="text-sm">Sem mídia demonstrativa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <figure className="space-y-2">
        <figcaption className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Film className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Vídeo demonstrativo
        </figcaption>
        <ExerciseVideoPlayer
          videoUrl={videoUrl}
          thumbnailUrl={thumbnailUrl}
          nome={nome}
        />
      </figure>
    </div>
  );
}
