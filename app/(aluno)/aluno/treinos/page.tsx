import { Dumbbell } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { weekdayAtual } from '@/lib/semana';
import { EmptyState, ErrorState } from '@/components/patterns';
import { FichaCard, type FichaResumo } from '@/components/aluno/treinos/ficha-card';

/**
 * Lista de fichas de treino liberadas para o aluno. Leitura via RSC sob RLS
 * (que já garante a invariante "só released do próprio aluno"); ainda assim
 * filtramos `status='released'` explicitamente. O gate de papel é do layout da
 * área — não repetimos aqui.
 *
 * Para cada ficha mostramos nome, data de liberação, total de exercícios e,
 * quando há item no dia da semana atual, o CTA "Treinar hoje".
 */
export default async function AlunoTreinosPage() {
  const supabase = await createClient();
  const weekday = weekdayAtual();

  const { data: planos, error } = await supabase
    .from('workout_plans')
    .select('id, name, released_at, workout_plan_items(id, weekday)')
    .eq('status', 'released')
    .order('released_at', { ascending: false, nullsFirst: false });

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar seus treinos"
          description="Ocorreu um erro ao buscar suas fichas. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const fichas: FichaResumo[] = (planos ?? []).map((plano) => {
    const itens = plano.workout_plan_items ?? [];
    return {
      id: plano.id,
      name: plano.name,
      releasedAt: plano.released_at,
      totalExercicios: itens.length,
      temTreinoHoje: itens.some((item) => item.weekday === weekday),
      weekdayAtual: weekday,
    };
  });

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader />

      {fichas.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, ela aparece aqui para você treinar."
        />
      ) : (
        <div className="space-y-4">
          {fichas.map((ficha) => (
            <FichaCard key={ficha.id} ficha={ficha} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Cabeçalho da tela de treinos (reusado no caminho de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Treinos</h1>
      <p className="text-sm text-muted-foreground">
        Suas fichas liberadas pelo professor. Toque para ver os exercícios ou começar o treino.
      </p>
    </header>
  );
}
