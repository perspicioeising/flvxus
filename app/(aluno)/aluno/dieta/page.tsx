import { Info, Utensils } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { totaisDieta, totaisRefeicao } from '@/lib/dieta/totais';
import { GOAL_LABEL } from '@/components/aluno/labels';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState, ErrorState } from '@/components/patterns';
import {
  RefeicaoCard,
  type RefeicaoResumo,
} from '@/components/aluno/dieta/refeicao-card';
import type { GoalType } from '@/types/database.types';

/**
 * Dieta liberada do aluno — somente leitura. Leitura via RSC sob RLS (que já
 * garante "só released do próprio aluno"); ainda assim filtramos
 * `status='released'` e pegamos a mais recente (`released_at`/`created_at`
 * desc). Nenhuma mutação, nenhum `service_role`.
 *
 * Exibe metas (kcal e macros), restrições e as refeições com horário e
 * alimentos. O aviso do ADR 0001 (a dieta não substitui nutricionista/médico)
 * é sempre visível.
 */
export default async function AlunoDietaPage() {
  const supabase = await createClient();

  const { data: dieta, error } = await supabase
    .from('diets')
    .select(
      `id, status, goal, target_kcal, protein_g, carbs_g, fat_g, restrictions, notes,
       released_at, created_at,
       diet_meals(
         id, name, time, order_index,
         diet_meal_foods(id, food_name, quantity, unit, kcal, protein_g, carbs_g, fat_g)
       )`
    )
    .eq('status', 'released')
    .order('released_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar sua dieta"
          description="Ocorreu um erro ao buscar sua dieta liberada. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  if (!dieta) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <PageHeader />
        <AvisoMedico />
        <EmptyState
          icon={Utensils}
          title="Nenhuma dieta liberada ainda"
          description="Quando seu professor liberar uma dieta, ela aparece aqui com refeições e metas."
        />
      </section>
    );
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

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader />
      <AvisoMedico />

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
          description="Sua dieta liberada ainda não tem refeições cadastradas."
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
    </section>
  );
}

/** Cabeçalho da tela de dieta (reusado nos caminhos de erro/vazio). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Dieta</h1>
      <p className="text-sm text-muted-foreground">
        Sua dieta liberada pelo professor, com refeições e metas diárias.
      </p>
    </header>
  );
}

/** Aviso do ADR 0001: a dieta não substitui nutricionista/médico. */
function AvisoMedico() {
  return (
    <Alert>
      <Info className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Este conteúdo não substitui acompanhamento profissional</AlertTitle>
      <AlertDescription>
        As orientações desta dieta não substituem a avaliação de um nutricionista ou médico.
        Em caso de restrições, alergias ou condições de saúde, procure um profissional habilitado.
      </AlertDescription>
    </Alert>
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
