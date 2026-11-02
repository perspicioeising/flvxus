import Link from 'next/link';
import { Trophy } from 'lucide-react';

import { montarPainelDesafios } from '@/lib/professor/desafios-dados';
import { EmptyState, PageHeader } from '@/components/patterns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlacarTurma } from '@/components/professor/desafios/placar-turma';

/**
 * Painel de DESAFIOS do personal (RSC): lista os desafios da turma (kind='coach')
 * criados pelo professor, com o placar de XP do período entre os alunos. Lê via
 * `montarPainelDesafios` sob RLS, com degradação por bloco — a tela nunca quebra
 * por um placar ausente. A apuração é lazy e oportunística no load (sem cron).
 *
 * O gate de rota (barrar o aluno autônomo) vive em `layout.tsx` deste subtree.
 */
export default async function ProfessorDesafiosPage() {
  const { desafios } = await montarPainelDesafios();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Desafios"
        subtitle="Crie desafios de XP para a sua turma e acompanhe quem está na frente."
        actions={
          <Button asChild className="min-h-11">
            <Link href="/professor/desafios/novo">
              <Trophy className="mr-1 h-4 w-4" aria-hidden="true" />
              Criar desafio
            </Link>
          </Button>
        }
      />

      {desafios.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum desafio ainda"
          description="Crie o primeiro desafio da turma: escolha a duração, os alunos e a recompensa."
        />
      ) : (
        <ul className="space-y-3">
          {desafios.map((d) => {
            const encerrado = d.challenge_status === 'finished';
            return (
              <li key={d.challenge_id}>
                <Card>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {d.title ?? 'Desafio da turma'}
                        </p>
                        {d.goal_text ? (
                          <p className="truncate text-xs text-muted-foreground">
                            Meta: {d.goal_text}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant={encerrado ? 'secondary' : 'default'} className="shrink-0">
                        {encerrado ? 'Encerrado' : 'Em andamento'}
                      </Badge>
                    </div>

                    <PlacarTurma placar={d} compacto />

                    <Link
                      href={`/professor/desafios/${d.challenge_id}`}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-foreground underline"
                    >
                      Ver detalhes
                    </Link>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
