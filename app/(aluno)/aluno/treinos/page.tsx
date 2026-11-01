import { Dumbbell } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import {
  FichaSecao,
  type FichaSecaoDados,
} from '@/components/aluno/treinos/ficha-secao';
import {
  proximoTreinoDaFicha,
  type FichaInicio,
} from '@/lib/treino/inicio';

/**
 * Lista de treinos do aluno: mostra TODAS as fichas liberadas, cada uma como
 * uma SEÇÃO com seus divisões em cards. O selo "PRÓXIMO" reflete a ROTAÇÃO
 * real (mesma lógica da tela de Início): a divisão seguinte à última concluída.
 * Divisões com sessão ABERTA ganham o selo "Em andamento" (prioridade visual).
 *
 * Leitura via RSC sob RLS; o gate de papel é do layout da área.
 */
export default async function AlunoTreinosPage() {
  const supabase = await createClient();

  const [
    fichasRes,
    sessoesConcluidasRes,
    sessoesAbertasRes,
    descansosRes,
  ] = await Promise.all([
    supabase
      .from('workout_plans')
      .select(
        'id, name, released_at, rotation_steps, workout_plan_items(id, weekday, division, order_index, sets, reps, exercises(name, muscle_groups))'
      )
      .eq('status', 'released')
      .order('released_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false }),

    // Sessões CONCLUÍDAS: mais recente primeiro para montar o mapa da rotação.
    supabase
      .from('workout_sessions')
      .select('plan_id, division, finished_at')
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .order('id', { ascending: false }),

    // Sessões ABERTAS: para exibir o selo "Em andamento".
    supabase
      .from('workout_sessions')
      .select('plan_id, division')
      .is('finished_at', null),

    // Descansos CUMPRIDOS (FEAT-003): mais recente primeiro por plano.
    supabase
      .from('workout_plan_rest_completions')
      .select('plan_id, rest_step_index, completed_at')
      .order('completed_at', { ascending: false }),
  ]);

  if (
    fichasRes.error ||
    sessoesConcluidasRes.error ||
    sessoesAbertasRes.error ||
    descansosRes.error
  ) {
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

  const fichas = (fichasRes.data ?? []) as FichaSecaoDados[];

  // Mapa plan_id → última divisão CONCLUÍDA (a primeira linha de cada plan_id
  // nas sessões já ordenadas por finished_at desc, id desc). Guarda também o
  // `finished_at` para o desempate por timestamp da rotação com descanso.
  const ultimaDivisaoPorPlano = new Map<string, string | null>();
  const ultimaSessaoPorPlano = new Map<
    string,
    { label: string | null; finishedAt: string }
  >();
  for (const sessao of sessoesConcluidasRes.data ?? []) {
    if (sessao.plan_id === null) continue;
    if (!ultimaDivisaoPorPlano.has(sessao.plan_id)) {
      ultimaDivisaoPorPlano.set(sessao.plan_id, sessao.division ?? null);
      if (sessao.finished_at) {
        ultimaSessaoPorPlano.set(sessao.plan_id, {
          label: sessao.division ?? null,
          finishedAt: sessao.finished_at,
        });
      }
    }
  }

  // Mapa plan_id → último DESCANSO cumprido (já ordenado por completed_at desc).
  const ultimoDescansoPorPlano = new Map<
    string,
    { restStepIndex: number; completedAt: string }
  >();
  for (const descanso of descansosRes.data ?? []) {
    if (descanso.plan_id === null) continue;
    if (!ultimoDescansoPorPlano.has(descanso.plan_id)) {
      ultimoDescansoPorPlano.set(descanso.plan_id, {
        restStepIndex: descanso.rest_step_index,
        completedAt: descanso.completed_at,
      });
    }
  }

  // Mapa plan_id → Set de divisões ABERTAS (sessão sem finished_at).
  const sessaoAbertaPorPlano = new Map<string, Set<string | null>>();
  for (const sessao of sessoesAbertasRes.data ?? []) {
    if (sessao.plan_id === null) continue;
    const existing = sessaoAbertaPorPlano.get(sessao.plan_id);
    if (existing) {
      existing.add(sessao.division ?? null);
    } else {
      sessaoAbertaPorPlano.set(sessao.plan_id, new Set([sessao.division ?? null]));
    }
  }

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
          {fichas.map((ficha) => {
            // Resolve a próxima divisão na rotação (mesma lógica da tela de Início).
            const ultimaConcluida = ultimaDivisaoPorPlano.has(ficha.id)
              ? ultimaDivisaoPorPlano.get(ficha.id)
              : undefined;
            const proximo = proximoTreinoDaFicha(
              ficha as unknown as FichaInicio,
              undefined,
              ultimaConcluida,
              {
                ultimaDivisao: ultimaSessaoPorPlano.get(ficha.id) ?? null,
                ultimoDescanso: ultimoDescansoPorPlano.get(ficha.id) ?? null,
              }
            );
            // `proximaDivisao` = rótulo da divisão-alvo (ou `undefined` quando
            // ficha legada sem treino hoje → manter comportamento atual index 0).
            const proximaDivisao =
              proximo !== null ? proximo.divisionLabel : undefined;

            const sessoesAbertas = sessaoAbertaPorPlano.get(ficha.id) ?? new Set<string | null>();

            return (
              <FichaSecao
                key={ficha.id}
                ficha={ficha}
                marcarProximo={proximo !== null}
                proximaDivisao={proximaDivisao}
                sessoesAbertas={sessoesAbertas}
                descansoProximo={proximo?.descanso ?? false}
                restStepIndex={proximo?.restStepIndex ?? null}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
