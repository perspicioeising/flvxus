import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DIVISAO_SEM } from '@/lib/divisao';
import { type ItemDia } from '@/components/aluno/treinos/dia-lista';

/** Monta o texto "séries × reps" quando os dados existem. */
function seriesReps(sets: number | null, reps: string | null): string | null {
  if (sets && reps) return `${sets}×${reps}`;
  if (sets) return `${sets} ${sets === 1 ? 'série' : 'séries'}`;
  if (reps) return reps;
  return null;
}

/**
 * Lista NUMERADA dos exercícios de uma DIVISÃO (A/B/C/…), com a letra em chip
 * de destaque, prescrição em verde à direita e o botão pílula "Iniciar treino".
 * Para divisões nomeadas o link aponta aquela divisão (`?divisao=A`); no balde
 * "Divisão única" (`division = null`) o link usa o sentinela (`?divisao=__sem__`).
 * Reaproveita o tipo `ItemDia` (shape idêntico). Mobile-first: alvo ≥ 44px.
 */
export function DivisaoLista({
  rotulo,
  division,
  planId,
  itens,
}: {
  rotulo: string;
  division: string | null;
  planId: string;
  itens: ItemDia[];
}) {
  // Todo CTA carrega um eixo explícito: divisão nomeada → ?divisao=A; balde
  // "Divisão única" (division=null) → sentinela __sem__ (nunca "sem query"),
  // para a execução renderizar o balde em vez de redirecionar (sem loop).
  const href = `/aluno/execucao/${planId}?divisao=${encodeURIComponent(
    division ?? DIVISAO_SEM
  )}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        {division !== null ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-black text-primary-foreground">
            {division}
          </span>
        ) : null}
        <p className="text-lg font-bold text-foreground">{rotulo}</p>
      </div>

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
          Iniciar treino {division !== null ? division : ''}
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
