import Link from 'next/link';
import { Activity, Dumbbell, Play } from 'lucide-react';

import { formatarData } from '@/lib/datas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/** Dados mínimos de uma ficha liberada para o card da lista. */
export interface FichaResumo {
  id: string;
  name: string;
  releasedAt: string | null;
  totalExercicios: number;
  /** Se há item prescrito para o dia da semana atual. */
  temTreinoHoje: boolean;
  /** Dia da semana atual (0..6), para montar o link "Treinar hoje". */
  weekdayAtual: number;
}

/**
 * Card de uma ficha liberada na lista de treinos do aluno. Mostra nome, data de
 * liberação e contagem de exercícios, com link para o detalhe e, quando há
 * exercício no dia atual, o CTA "Treinar hoje". Mobile-first: alvos ≥ 44px.
 */
export function FichaCard({ ficha }: { ficha: FichaResumo }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">{ficha.name}</CardTitle>
        <CardDescription>Liberada em {formatarData(ficha.releasedAt)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dumbbell className="h-4 w-4 shrink-0" aria-hidden="true" />
          {ficha.totalExercicios === 1
            ? '1 exercício'
            : `${ficha.totalExercicios} exercícios`}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="min-h-11 flex-1">
            <Link href={`/aluno/treinos/${ficha.id}`}>
              <Activity className="h-4 w-4" aria-hidden="true" />
              Ver ficha
            </Link>
          </Button>
          {ficha.temTreinoHoje ? (
            <Button asChild className="min-h-11 flex-1">
              <Link href={`/aluno/execucao/${ficha.id}?dia=${ficha.weekdayAtual}`}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Treinar hoje
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
