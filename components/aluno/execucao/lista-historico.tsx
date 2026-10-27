import Link from 'next/link';
import { ChevronRight, Clock, Dumbbell, History, ListChecks } from 'lucide-react';

import { formatarData } from '@/lib/datas';
import { formatarDuracao, formatarVolumeKg } from '@/lib/treino/resumo';
import type { ItemHistorico } from '@/lib/treino/resumo-dados';
import { EmptyState } from '@/components/patterns';

/**
 * Lista apresentacional (RSC-safe) do histórico de sessões concluídas,
 * compartilhada por aluno e professor. Cada cartão mostra a data (`fimISO`),
 * ficha · divisão, duração (`formatarDuracao` sobre os instantes crus), volume
 * e — só quando presentes — RPE/nota. O destino de "Ver detalhes" vem de um
 * `hrefDetalhes` builder, que difere entre aluno e professor (a mesma tela de
 * resumo em grupos de rota distintos). Alvos de toque ≥ 44px, pt-BR.
 */
export function ListaHistorico({
  itens,
  hrefDetalhes,
}: {
  itens: ItemHistorico[];
  hrefDetalhes: (item: ItemHistorico) => string;
}) {
  if (itens.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sem treinos concluídos ainda"
        description="Quando um treino for finalizado, ele aparece aqui com duração, volume e detalhes."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {itens.map((item) => {
        const divisao = item.division?.trim();
        const temRpe = item.perceivedIntensity != null;
        const temExtra = temRpe || item.temNota;

        return (
          <li key={item.sessionId}>
            <Link
              href={hrefDetalhes(item)}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-bold text-foreground">
                    {formatarData(item.fimISO)}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {item.fichaNome}
                    {divisao ? ` · ${divisao}` : ''}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatarDuracao(item.inicioISO, item.fimISO)}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Dumbbell className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatarVolumeKg(item.volumeKg)}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.seriesConcluidas}{' '}
                    {item.seriesConcluidas === 1 ? 'série' : 'séries'}
                  </span>
                </div>

                {temExtra ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {temRpe ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                        RPE {item.perceivedIntensity}
                      </span>
                    ) : null}
                    {item.temNota ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                        Com anotação
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <ChevronRight
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
