import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gift, Target, Timer } from 'lucide-react';

import { montarPlacarDesafio } from '@/lib/professor/desafios-dados';
import { diasRestantes } from '@/lib/arena/social';
import { PageHeader } from '@/components/patterns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlacarTurma } from '@/components/professor/desafios/placar-turma';

/**
 * Acompanhamento de um DESAFIO da turma (RSC): placar de XP do período entre os
 * alunos, meta/recompensa, countdown de dias restantes e resultado consolidado
 * quando encerrado. Lê via `montarPlacarDesafio` sob RLS (só o criador/membros
 * enxergam; a função devolve `null` fora disso → 404). A apuração é lazy e
 * oportunística no load.
 *
 * O gate de rota (barrar o autônomo) vive em `layout.tsx` deste subtree.
 */
export default async function DesafioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const placar = await montarPlacarDesafio(id);

  if (!placar) {
    notFound();
  }

  const encerrado = placar.challenge_status === 'finished';
  const dias = diasRestantes(placar.ends_on, new Date());

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title={placar.title ?? 'Desafio da turma'}
        subtitle={
          encerrado
            ? 'Desafio encerrado. Veja o resultado final da turma.'
            : 'Acompanhe o XP do período entre os alunos.'
        }
        eyebrow={
          <Link href="/professor/desafios" className="font-medium underline">
            Voltar aos desafios
          </Link>
        }
        actions={
          <Badge variant={encerrado ? 'secondary' : 'default'}>
            {encerrado ? 'Encerrado' : 'Em andamento'}
          </Badge>
        }
      />

      {placar.goal_text || placar.reward_text ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {placar.goal_text ? (
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Meta: </span>
                  {placar.goal_text}
                </span>
              </p>
            ) : null}
            {placar.reward_text ? (
              <p className="flex items-start gap-2 text-sm text-foreground">
                <Gift className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Recompensa: </span>
                  {placar.reward_text}
                </span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!encerrado ? (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground tabular-nums">
          <Timer className="h-4 w-4" aria-hidden="true" />
          {dias > 0
            ? `${dias} ${dias === 1 ? 'dia' : 'dias'} restantes`
            : 'Encerrando'}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {encerrado ? 'Resultado' : 'Placar'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlacarTurma placar={placar} />
        </CardContent>
      </Card>
    </section>
  );
}
