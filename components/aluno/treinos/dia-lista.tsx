import Link from 'next/link';
import { Play } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  if (sets && reps) return `${sets} × ${reps}`;
  if (sets) return `${sets} ${sets === 1 ? 'série' : 'séries'}`;
  if (reps) return reps;
  return null;
}

/**
 * Lista de exercícios de um dia da semana, com o cabeçalho do dia e o botão
 * "Iniciar sessão" que leva à execução. Para dias com weekday definido o link
 * já filtra por aquele dia (`?dia=`); para o balde "Sem dia definido"
 * (`weekday = null`) o link vai para a ficha sem `?dia`, e o seletor de dia na
 * execução abre no balde sem dia. Mobile-first: alvo ≥ 44px no botão.
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-4">
        <CardTitle className="text-base">{rotulo}</CardTitle>
        <Button asChild size="sm" className="min-h-11">
          <Link
            href={
              weekday !== null
                ? `/aluno/execucao/${planId}?dia=${weekday}`
                : `/aluno/execucao/${planId}`
            }
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Iniciar sessão
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <ul className="space-y-3">
          {itens.map((item) => {
            const sr = seriesReps(item.sets, item.reps);
            return (
              <li
                key={item.id}
                className="rounded-lg border border-border p-3 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{item.nome}</p>
                  {sr ? (
                    <Badge variant="secondary" className="shrink-0">
                      {sr}
                    </Badge>
                  ) : null}
                </div>

                {item.gruposMusculares.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {item.gruposMusculares.join(', ')}
                  </p>
                ) : null}

                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {item.cargaAlvo !== null ? (
                    <div className="flex gap-1">
                      <dt>Carga alvo:</dt>
                      <dd className="text-foreground">{item.cargaAlvo} kg</dd>
                    </div>
                  ) : null}
                  {item.descansoSegundos !== null ? (
                    <div className="flex gap-1">
                      <dt>Descanso:</dt>
                      <dd className="text-foreground">{item.descansoSegundos}s</dd>
                    </div>
                  ) : null}
                </dl>

                {item.observacoes ? (
                  <p className="text-sm text-muted-foreground">{item.observacoes}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
