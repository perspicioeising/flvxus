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

/** Uma linha de "rótulo: valor" da prescrição, quando o valor existe. */
function LinhaPrescricao({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null;
  return (
    <div className="flex gap-1">
      <dt className="text-muted-foreground">{rotulo}:</dt>
      <dd className="text-foreground">{valor}</dd>
    </div>
  );
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
 * Mídia e informações completas de um exercício durante a execução. As URLs de
 * vídeo/thumbnail chegam JÁ ASSINADAS do RSC (bucket privado, nunca URL
 * pública) — este componente só exibe, reusando o padrão de
 * `components/professor/exercicios/exercise-media.tsx` (<video controls poster>).
 * Mostra séries, reps, carga alvo, descanso, observações, instruções, dicas e
 * erros comuns.
 */
export function ExercicioInfo({ info }: { info: ExercicioInfo }) {
  const descanso =
    info.descansoSegundos !== null ? `${info.descansoSegundos}s` : null;
  const carga = info.cargaAlvo !== null ? `${info.cargaAlvo} kg` : null;

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

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <LinhaPrescricao rotulo="Séries" valor={String(info.sets)} />
        <LinhaPrescricao rotulo="Repetições" valor={info.reps} />
        <LinhaPrescricao rotulo="Carga alvo" valor={carga} />
        <LinhaPrescricao rotulo="Descanso" valor={descanso} />
      </dl>

      <SecaoTexto titulo="Observações do professor" texto={info.observacoes} />
      <SecaoTexto titulo="Instruções" texto={info.instrucoes} />
      <SecaoLista titulo="Dicas" itens={info.dicas} />
      <SecaoLista titulo="Erros comuns" itens={info.errosComuns} />
    </div>
  );
}
