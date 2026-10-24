import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DIA_SEM } from '@/lib/semana';

/** Item de exercício prescrito, já normalizado para exibição. */
export interface ItemDia {
  id: string;
  nome: string;
  gruposMusculares: string[];
  sets: number | null;
  reps: string | null;
  cargaAlvo: number | null;
  descansoSegundos: number | null;
  observacoes: string | null;
}

/** Monta o texto "séries × reps" quando os dados existem. */
function seriesReps(sets: number | null, reps: string | null): string | null {
  if (sets && reps) return `${sets}×${reps}`;
  if (sets) return `${sets} ${sets === 1 ? 'série' : 'séries'}`;
  if (reps) return reps;
  return null;
}

/**
 * Lista NUMERADA (01, 02…) dos exercícios de um dia da semana, com o cabeçalho
 * do dia, a prescrição em verde à direita e o botão pílula "Iniciar treino".
 * Para dias com weekday definido o link filtra por aquele dia (`?dia=N`); no
 * balde "Sem dia definido" (`weekday = null`) o link usa o sentinela
 * (`?dia=none`). Mobile-first: alvo ≥ 44px no botão.
 */
export function DiaLista({
  rotulo,
  weekday,
  planId,
  itens,
}: {
  rotulo: string;
  weekday: number | null;
  planId: string;
  itens: ItemDia[];
}) {
  // Todo CTA carrega um eixo explícito: dia definido → ?dia=N; balde "Sem dia
  // definido" (weekday=null) → sentinela `none` (nunca "sem query"), para a
  // execução renderizar o balde em vez de redirecionar (sem loop).
  const href =
    weekday !== null
      ? `/aluno/execucao/${planId}?dia=${weekday}`
      : `/aluno/execucao/${planId}?dia=${DIA_SEM}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-lg font-bold text-foreground">{rotulo}</p>

      <ol className="mt-3 divide-y divide-border">
        {itens.map((item, index) => {
          const sr = seriesReps(item.sets, item.reps);
          return (
            <li key={item.id} className="flex items-start gap-3 py-3">
              <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{item.nome}</p>
                {item.gruposMusculares.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {item.gruposMusculares.join(', ')}
                  </p>
                ) : null}
                {item.observacoes ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.observacoes}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right text-sm font-semibold text-primary">
                {sr ? <p>{sr}</p> : null}
                {item.descansoSegundos !== null ? (
                  <p className="text-xs opacity-80">
                    descanso {item.descansoSegundos}s
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <Button asChild size="xl" className="mt-4 w-full">
        <Link href={href}>
          Iniciar treino
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
