import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Dumbbell, Play } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { weekdayAtual } from '@/lib/semana';
import { EmptyState, ErrorState } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Seleção da ficha a treinar. Lista as fichas liberadas (RLS garante posse e
 * `released`); se houver só uma, redireciona direto para a execução dela no dia
 * atual. EmptyState quando nenhuma ficha foi liberada.
 */
export default async function AlunoExecucaoPage() {
  const supabase = await createClient();
  const weekday = weekdayAtual();

  const { data: planos, error } = await supabase
    .from('workout_plans')
    .select('id, name')
    .eq('status', 'released')
    .order('released_at', { ascending: false, nullsFirst: false });

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar suas fichas"
          description="Ocorreu um erro ao buscar seus treinos. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const fichas = planos ?? [];

  if (fichas.length === 1) {
    redirect(`/aluno/execucao/${fichas[0].id}?dia=${weekday}`);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader />

      {fichas.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, você poderá iniciar o treino por aqui."
        />
      ) : (
        <div className="space-y-4">
          {fichas.map((ficha) => (
            <Card key={ficha.id}>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg">{ficha.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Button asChild className="min-h-11 w-full">
                  <Link href={`/aluno/execucao/${ficha.id}?dia=${weekday}`}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Treinar esta ficha
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

/** Cabeçalho da tela de seleção (reusado no caminho de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Treinar</h1>
      <p className="text-sm text-muted-foreground">
        Escolha a ficha para começar o treino de hoje.
      </p>
    </header>
  );
}
