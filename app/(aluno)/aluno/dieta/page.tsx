import { Info, Utensils } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { totaisDieta, totaisRefeicao } from '@/lib/dieta/totais';
import { GOAL_LABEL } from '@/components/aluno/labels';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion } from '@/components/ui/accordion';
import { EmptyState, ErrorState, PageHeader } from '@/components/patterns';
import {
  RefeicaoLinha,
  type RefeicaoResumo,
} from '@/components/aluno/dieta/refeicao-card';
import type { GoalType } from '@/types/database.types';

/** Formata um número com no máximo 1 casa decimal. */
function arred(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

/** Barra de progresso de um macro (consumo frente à meta). */
function BarraMacro({
  rotulo,
  atual,
  meta,
}: {
  rotulo: string;
  atual: number;
  meta: number | null;
}) {
  const pct =
    meta && meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{rotulo}</span>
        <span className="tabular-nums text-muted-foreground">
          {arred(atual)}
          {meta != null ? ` / ${meta} g` : ' g'}
        </span>
      </div>
      <Progress value={pct} aria-label={`Progresso de ${rotulo}`} />
    </div>
  );
}

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
        <PageHeader emphasis="caps" title="Dieta" />
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
        <PageHeader emphasis="caps" title="Dieta" />
        <AvisoMedico />
        <EmptyState
          icon={Utensils}
          title="Nenhuma dieta liberada ainda"
          description="Quando seu professor liberar uma dieta, ela aparece aqui com refeições e metas."
          className="rounded-3xl"
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
      <PageHeader
        emphasis="caps"
        title="Dieta"
        subtitle="Sua dieta liberada pelo professor, com refeições e metas diárias."
      />
      <AvisoMedico />

      {/* Card META DIÁRIA: kcal gigante + macros com barras */}
      <div className="rounded-3xl bg-card p-6 shadow-app-medium">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Meta diária
          </p>
          {dieta.goal ? (
            <Badge variant="secondary">{GOAL_LABEL[dieta.goal as GoalType]}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-5xl font-black tabular-nums text-primary">
          {dieta.target_kcal != null ? dieta.target_kcal : '—'}
          <span className="ml-1 text-lg font-bold text-muted-foreground">
            kcal
          </span>
        </p>

        <div className="mt-6 space-y-4">
          <BarraMacro rotulo="Proteínas" atual={totalDieta.protein_g} meta={dieta.protein_g} />
          <BarraMacro rotulo="Carboidratos" atual={totalDieta.carbs_g} meta={dieta.carbs_g} />
          <BarraMacro rotulo="Gorduras" atual={totalDieta.fat_g} meta={dieta.fat_g} />
        </div>

        {restricoes.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-bold text-foreground">Restrições</h3>
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
          <div className="mt-6">
            <h3 className="mb-1 text-sm font-bold text-foreground">Observações</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {dieta.notes}
            </p>
          </div>
        ) : null}
      </div>

      {/* Refeições expansíveis por horário */}
      {refeicoes.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="Dieta sem refeições"
          description="Sua dieta liberada ainda não tem refeições cadastradas."
          className="rounded-3xl"
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Refeições
            </h2>
            <span className="text-sm text-muted-foreground">
              Total: {arred(totalDieta.kcal)} kcal
            </span>
          </div>
          <Accordion type="multiple" className="space-y-3">
            {refeicoes.map((refeicao) => (
              <RefeicaoLinha key={refeicao.id} refeicao={refeicao} />
            ))}
          </Accordion>
        </div>
      )}
    </section>
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
