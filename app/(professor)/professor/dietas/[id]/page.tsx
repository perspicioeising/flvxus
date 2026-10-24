import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Utensils } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { totaisDieta, totaisRefeicao } from '@/lib/dieta/totais';
import { GOAL_LABEL } from '@/components/aluno/labels';
import { STATUS_LABEL, STATUS_VARIANTE } from '@/components/professor/treinos/labels';
import { DietaStatusControl } from '@/components/professor/dietas/status-control';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/patterns';
import {
  RefeicaoCard,
  type RefeicaoResumo,
} from '@/components/aluno/dieta/refeicao-card';
import type { GoalType, PlanStatus } from '@/types/database.types';

/**
 * Detalhe de uma DIETA para o professor. Mostra o conteúdo completo (metas,
 * restrições, observações, refeições com alimentos/macros e totais), igual ao
 * que o aluno vê, mais o badge de status e o controle de status.
 *
 * Leitura via RSC sob RLS (só o tenant do professor), nunca `service_role` e
 * sem filtrar `tenant_id` à mão. Diferente do aluno, NÃO filtramos
 * `status='released'`: o professor precisa ver a dieta em qualquer status
 * (inclusive `draft`). RLS impede abrir dieta de outro tenant (vazio → 404).
 */
export default async function ProfessorDietaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dieta } = await supabase
    .from('diets')
    .select(
      `id, status, goal, target_kcal, protein_g, carbs_g, fat_g, restrictions, notes,
       released_at, created_at,
       profiles!diets_student_id_fkey(full_name),
       diet_meals(
         id, name, time, order_index,
         diet_meal_foods(id, food_name, quantity, unit, kcal, protein_g, carbs_g, fat_g)
       )`
    )
    .eq('id', id)
    .single();

  if (!dieta) {
    notFound();
  }

  const refeicoes: RefeicaoResumo[] = [...(dieta.diet_meals ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((meal) => ({
      id: meal.id,
      name: meal.name,
      time: meal.time,
      alimentos: meal.diet_meal_foods ?? [],
    }));

  const totalDieta = totaisDieta(refeicoes.map((r) => totaisRefeicao(r.alimentos)));
  const restricoes = dieta.restrictions ?? [];
  const status = dieta.status as PlanStatus;
  const alunoNome =
    (dieta.profiles as unknown as { full_name: string | null } | null)?.full_name ?? 'Aluno';

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href="/professor/dietas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para dietas
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">{alunoNome}</h1>
          <p className="text-sm text-muted-foreground">
            Conteúdo completo da dieta: metas, restrições e refeições.
          </p>
        </div>
        <Badge variant={STATUS_VARIANTE[status]}>{STATUS_LABEL[status]}</Badge>
      </header>

      {/* Metas e objetivo */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Metas diárias</CardTitle>
            {dieta.goal ? (
              <Badge variant="secondary">{GOAL_LABEL[dieta.goal as GoalType]}</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Meta rotulo="Calorias" valor={dieta.target_kcal != null ? `${dieta.target_kcal} kcal` : null} />
            <Meta rotulo="Proteínas" valor={dieta.protein_g != null ? `${dieta.protein_g} g` : null} />
            <Meta rotulo="Carboidratos" valor={dieta.carbs_g != null ? `${dieta.carbs_g} g` : null} />
            <Meta rotulo="Gorduras" valor={dieta.fat_g != null ? `${dieta.fat_g} g` : null} />
          </dl>

          {restricoes.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Restrições</h3>
              <ul className="flex flex-wrap gap-2">
                {restricoes.map((restricao: string) => (
                  <li key={restricao}>
                    <Badge variant="outline">{restricao}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {dieta.notes ? (
            <div>
              <h3 className="mb-1 text-sm font-medium text-foreground">Observações</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{dieta.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Refeições */}
      {refeicoes.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="Dieta sem refeições"
          description="Esta dieta ainda não tem refeições cadastradas."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Refeições</h2>
            <span className="text-sm text-muted-foreground">
              Total: {Number.isInteger(totalDieta.kcal) ? totalDieta.kcal : totalDieta.kcal.toFixed(1)} kcal
            </span>
          </div>
          {refeicoes.map((refeicao) => (
            <RefeicaoCard key={refeicao.id} refeicao={refeicao} />
          ))}
        </div>
      )}

      {/* Controle de liberação */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Status</h2>
        <DietaStatusControl dietId={id} statusAtual={status} />
      </div>
    </section>
  );
}

function Meta({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium text-foreground">{valor ?? '—'}</dd>
    </div>
  );
}
