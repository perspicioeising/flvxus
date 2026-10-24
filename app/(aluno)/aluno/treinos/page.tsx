import { Dumbbell } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { formatarData } from '@/lib/datas';
import { agruparPorDivisao } from '@/lib/divisao';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import { DivisaoResumoCard } from '@/components/aluno/treinos/divisao-resumo-card';

/** Extrai os grupos musculares de um join `exercises` (array ou objeto). */
function dadosExercicio(exercises: unknown): { grupos: string[] } {
  const e = Array.isArray(exercises) ? exercises[0] : exercises;
  const registro = e as { muscle_groups: string[] | null } | null;
  return { grupos: registro?.muscle_groups ?? [] };
}

/**
 * Lista de treinos do aluno: mostra as DIVISÕES da ficha ativa (liberada mais
 * recente), uma por divisão (letra + nome derivado dos grupos + grupos
 * musculares + selo "Próximo" na primeira). Leitura via RSC sob RLS (que já
 * garante a invariante "só released do próprio aluno"); ainda assim filtramos
 * `status='released'` explicitamente. O gate de papel é do layout da área.
 */
export default async function AlunoTreinosPage() {
  const supabase = await createClient();

  const { data: ficha, error } = await supabase
    .from('workout_plans')
    .select(
      'id, name, released_at, workout_plan_items(id, division, order_index, sets, reps, exercises(name, muscle_groups))'
    )
    .eq('status', 'released')
    .order('released_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

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

  const itens = ficha?.workout_plan_items ?? [];
  const divisoes = agruparPorDivisao(itens, (item) => item.division ?? null);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Treinos"
        subtitle="Suas fichas liberadas pelo professor. Toque para ver os exercícios ou começar o treino."
      />

      {!ficha ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino liberado ainda"
          description="Quando seu professor liberar uma ficha, ela aparece aqui para você treinar."
          className="rounded-3xl"
        />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Ficha ativa
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {ficha.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Liberada em {formatarData(ficha.released_at)} ·{' '}
              {itens.length === 1
                ? '1 exercício'
                : `${itens.length} exercícios`}
            </p>
          </div>

          <div className="space-y-3">
            {divisoes.map((grupo, index) => {
              const grupos = Array.from(
                new Set(
                  grupo.itens.flatMap(
                    (item) => dadosExercicio(item.exercises).grupos
                  )
                )
              );
              return (
                <DivisaoResumoCard
                  key={grupo.division ?? 'sem-divisao'}
                  letra={grupo.division}
                  nome={grupos.length > 0 ? grupos.join(', ') : ''}
                  grupos={grupos}
                  proximo={index === 0}
                  href={`/aluno/treinos/${ficha.id}`}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
