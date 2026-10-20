import { Film, Image as ImageIcon } from 'lucide-react';

/**
 * Preview de mídia do exercício. As URLs são SEMPRE assinadas (TTL curto) e
 * geradas no servidor via `lib/storage.signExerciseMedia` — este componente
 * apenas recebe as URLs já prontas, nunca monta URL pública.
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
      {videoUrl ? (
        <figure className="space-y-2">
          <figcaption className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Film className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Vídeo demonstrativo
          </figcaption>
          <video
            controls
            preload="metadata"
            poster={thumbnailUrl ?? undefined}
            className="w-full rounded-xl border border-border bg-black"
          >
            <source src={videoUrl} />
            Seu navegador não suporta a reprodução deste vídeo.
          </video>
        </figure>
      ) : thumbnailUrl ? (
        <figure className="space-y-2">
          <figcaption className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Imagem
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada de TTL curto do Storage privado; não é otimizável pelo next/image. */}
          <img
            src={thumbnailUrl}
            alt={`Demonstração do exercício ${nome}`}
            className="w-full rounded-xl border border-border"
          />
        </figure>
      ) : null}
    </div>
  );
}
