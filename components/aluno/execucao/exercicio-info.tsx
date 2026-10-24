'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ExerciseVideoPlayer } from '@/components/shared/exercise-video-player';

/** Dados de exibição de um exercício na execução (mídia + prescrição + dicas). */
export interface ExercicioInfo {
  nome: string;
  /** URL JÁ ASSINADA do vídeo (TTL curto) ou `null`. O client nunca assina. */
  videoUrl: string | null;
  /** URL JÁ ASSINADA da thumbnail (TTL curto) ou `null`. */
  thumbnailUrl: string | null;
  sets: number;
  reps: string | null;
  cargaAlvo: number | null;
  descansoSegundos: number | null;
  observacoes: string | null;
  instrucoes: string | null;
  dicas: string[];
  errosComuns: string[];
  gruposMusculares: string[];
  equipamento: string[];
}

/** Quebra um texto de instruções em passos (por linha ou por frase). */
function emPassos(texto: string | null): string[] {
  if (!texto || texto.trim() === '') return [];
  const porLinha = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (porLinha.length > 1) return porLinha;
  return texto
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

/**
 * Mídia e informações de um exercício durante a execução, em abas
 * (Como fazer / Dicas / Músculos). As URLs de vídeo/thumbnail chegam JÁ
 * ASSINADAS do RSC (bucket privado) — este componente só exibe. Os mesmos
 * dados de `info` da versão anterior; só muda a apresentação.
 */
export function ExercicioInfo({ info }: { info: ExercicioInfo }) {
  const passos = emPassos(info.instrucoes);
  const temComoFazer = passos.length > 0 || (info.observacoes?.trim() ?? '') !== '';
  const temDicas = info.dicas.length > 0 || info.errosComuns.length > 0;
  const temMusculos =
    info.gruposMusculares.length > 0 || info.equipamento.length > 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl">
        <ExerciseVideoPlayer
          videoUrl={info.videoUrl}
          thumbnailUrl={info.thumbnailUrl}
          nome={info.nome}
        />
      </div>

      {temComoFazer || temDicas || temMusculos ? (
        <Tabs defaultValue={temComoFazer ? 'como' : temDicas ? 'dicas' : 'musculos'}>
          <TabsList className="w-full justify-start">
            {temComoFazer ? (
              <TabsTrigger value="como">Como fazer</TabsTrigger>
            ) : null}
            {temDicas ? <TabsTrigger value="dicas">Dicas</TabsTrigger> : null}
            {temMusculos ? (
              <TabsTrigger value="musculos">Músculos</TabsTrigger>
            ) : null}
          </TabsList>

          {temComoFazer ? (
            <TabsContent value="como" className="space-y-4 pt-4">
              {passos.length > 0 ? (
                <ol className="space-y-3">
                  {passos.map((passo, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <p className="pt-0.5 text-sm text-foreground">{passo}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
              {info.observacoes?.trim() ? (
                <div className="rounded-2xl bg-primary-soft p-4 text-sm text-primary-soft-foreground">
                  <p className="font-bold">Observações do professor</p>
                  <p className="mt-1 whitespace-pre-line">{info.observacoes}</p>
                </div>
              ) : null}
            </TabsContent>
          ) : null}

          {temDicas ? (
            <TabsContent value="dicas" className="space-y-4 pt-4">
              {info.dicas.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Dicas</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {info.dicas.map((d, i) => (
                      <li key={`dica-${i}`}>{d}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {info.errosComuns.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground">
                    Erros comuns
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {info.errosComuns.map((e, i) => (
                      <li key={`erro-${i}`}>{e}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </TabsContent>
          ) : null}

          {temMusculos ? (
            <TabsContent value="musculos" className="space-y-3 pt-4">
              {info.gruposMusculares.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {info.gruposMusculares.map((g) => (
                    <Badge key={`grupo-${g}`} variant="secondary">
                      {g}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {info.equipamento.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {info.equipamento.map((e) => (
                    <Badge key={`equip-${e}`} variant="outline">
                      {e}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </TabsContent>
          ) : null}
        </Tabs>
      ) : null}
    </div>
  );
}
