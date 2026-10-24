import { Dumbbell } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import {
  FichaSecao,
  type FichaSecaoDados,
} from '@/components/aluno/treinos/ficha-secao';

/**
 * Lista de treinos do aluno: mostra TODAS as fichas liberadas (o aluno Bruno
 * tem duas), cada uma como uma SEÇÃO com seu nome e suas divisões em cards
 * (letra + nome derivado dos grupos + grupos musculares). O selo "Próximo"
 * aparece só na primeira divisão da ficha mais recente. Desempate determinístico
 * (released_at desc, id desc) garante ordem estável e que nenhuma ficha suma.
 * Com 1 ficha, o layout é equivalente ao anterior (uma seção).
 *
 * Leitura via RSC sob RLS (que já garante "só released do próprio aluno");
 * ainda assim filtramos `status='released'` explicitamente. O gate de papel é
 * do layout da área.
 */
export default async function AlunoTreinosPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workout_plans')
    .select(
      'id, name, released_at, workout_plan_items(id, division, order_index, sets, reps, exercises(name, muscle_groups))'
    )
    .eq('status', 'released')
    .order('released_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false });

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

  const fichas = (data ?? []) as FichaSecaoDados[];

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
        <div className="space-y-8">
          {fichas.map((ficha, index) => (
            // Selo "Próximo" só na 1ª divisão da ficha mais recente (index 0).
            <FichaSecao key={ficha.id} ficha={ficha} marcarProximo={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
