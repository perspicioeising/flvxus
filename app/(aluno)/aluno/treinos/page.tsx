import { Dumbbell } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { weekdayAtual } from '@/lib/semana';
import { formatarData } from '@/lib/datas';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import { FichaCard, type FichaResumo } from '@/components/aluno/treinos/ficha-card';

/**
 * Lista de fichas de treino liberadas para o aluno. Leitura via RSC sob RLS
 * (que já garante a invariante "só released do próprio aluno"); ainda assim
 * filtramos `status='released'` explicitamente. O gate de papel é do layout da
 * área — não repetimos aqui.
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
        <PageHeader
          emphasis="caps"
          title="Treinos"
          subtitle="Suas fichas liberadas pelo professor."
        />
        <ErrorState
          title="Não foi possível carregar seus treinos"
          description="Ocorreu um erro ao buscar suas fichas. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const fichas: FichaResumo[] = (planos ?? []).map((plano, index) => {
    const itens = plano.workout_plan_items ?? [];
    return {
      id: plano.id,
      name: plano.name,
      releasedAt: plano.released_at,
      totalExercicios: itens.length,
      temTreinoHoje: itens.some((item) => item.weekday === weekday),
      weekdayAtual: weekday,
      letra: String.fromCharCode(65 + index),
    };
  });

  const fichaAtiva = fichas[0];

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Treinos"
        subtitle="Suas fichas liberadas pelo professor. Toque para ver os exercícios ou começar o treino."
      />

      {fichas.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, ela aparece aqui para você treinar."
          className="rounded-3xl"
        />
      ) : (
        <>
          {fichaAtiva ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Ficha ativa
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {fichaAtiva.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Liberada em {formatarData(fichaAtiva.releasedAt)} ·{' '}
                {fichaAtiva.totalExercicios === 1
                  ? '1 exercício'
                  : `${fichaAtiva.totalExercicios} exercícios`}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            {fichas.map((ficha) => (
              <FichaCard key={ficha.id} ficha={ficha} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
