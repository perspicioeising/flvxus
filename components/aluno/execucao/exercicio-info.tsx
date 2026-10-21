'use client';

import { ChevronDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

/** Uma seção de texto do exercício (instruções/observações), quando há conteúdo. */
function SecaoTexto({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto || texto.trim() === '') return null;
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-foreground">{titulo}</h4>
      <p className="whitespace-pre-line text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}

/** Uma seção de lista do exercício (dicas/erros comuns), quando há itens. */
function SecaoLista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-foreground">{titulo}</h4>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
        {itens.map((item, i) => (
          <li key={`${titulo}-${i}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Mídia e informações de um exercício durante a execução. As URLs de
 * vídeo/thumbnail chegam JÁ ASSINADAS do RSC (bucket privado, nunca URL
 * pública) — este componente só exibe, reusando o `ExerciseVideoPlayer`
 * compartilhado.
 *
 * A prescrição (séries × reps, carga alvo, descanso) NÃO é renderizada aqui:
 * ela vive como linha de badges em `sessao-execucao.tsx` (fonte única da
 * verdade). Grupos musculares/equipamento ficam como badges visíveis; as
 * instruções/dicas/erros/observações ficam colapsadas por padrão.
 */
export function ExercicioInfo({ info }: { info: ExercicioInfo }) {
  const temDetalhes =
    (info.observacoes?.trim() ?? '') !== '' ||
    (info.instrucoes?.trim() ?? '') !== '' ||
    info.dicas.length > 0 ||
    info.errosComuns.length > 0;

  return (
    <div className="space-y-4">
      <ExerciseVideoPlayer
        videoUrl={info.videoUrl}
        thumbnailUrl={info.thumbnailUrl}
        nome={info.nome}
      />

      {info.gruposMusculares.length > 0 || info.equipamento.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {info.gruposMusculares.map((g) => (
            <Badge key={`grupo-${g}`} variant="secondary">
              {g}
            </Badge>
          ))}
          {info.equipamento.map((e) => (
            <Badge key={`equip-${e}`} variant="outline">
              {e}
            </Badge>
          ))}
        </div>
      ) : null}

      {temDetalhes ? (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="group min-h-11 w-full justify-between"
            >
              Ver instruções e dicas
              <ChevronDown
                className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <SecaoTexto titulo="Observações do professor" texto={info.observacoes} />
            <SecaoTexto titulo="Instruções" texto={info.instrucoes} />
            <SecaoLista titulo="Dicas" itens={info.dicas} />
            <SecaoLista titulo="Erros comuns" itens={info.errosComuns} />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}
