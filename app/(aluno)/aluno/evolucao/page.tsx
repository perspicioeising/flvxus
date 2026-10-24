import { BarChart3, LineChart } from 'lucide-react';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { resumoAderencia } from '@/lib/treino/aderencia';
import { montarSerieEvolucao } from '@/components/professor/avaliacoes/evolucao-series';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState, ErrorState, PageHeader, StatCard } from '@/components/patterns';
import { GraficosAluno } from '@/components/aluno/evolucao/graficos-aluno';
import { SecaoEvolucao } from '@/components/professor/alunos/secao-evolucao';

/** Janela padrão (dias) do resumo de aderência. */
const JANELA_ADERENCIA_DIAS = 30;

/**
 * Evolução do próprio aluno — somente leitura. Leitura via RSC sob RLS (o aluno
 * só vê as próprias linhas). Reusa `montarSerieEvolucao` e o `EvolucaoLineChart`
 * da Fase 4 para peso, %gordura e cintura, e resume a aderência de treino a
 * partir das sessões concluídas (`workout_sessions.finished_at`).
 */
export default async function AlunoEvolucaoPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const supabase = await createClient();

  const [avaliacoesRes, sessoesRes] = await Promise.all([
    supabase
      .from('physical_assessments')
      .select('assessed_at, weight_kg, body_fat_pct, lean_mass_kg, waist_cm, hip_cm, abdomen_cm')
      .eq('student_id', sessionUser.userId)
      .order('assessed_at', { ascending: true }),
    supabase
      .from('workout_sessions')
      .select('finished_at')
      .eq('student_id', sessionUser.userId)
      .not('finished_at', 'is', null),
  ]);

  if (avaliacoesRes.error || sessoesRes.error) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <PageHeader emphasis="caps" title="Evolução" />
        <ErrorState
          title="Não foi possível carregar sua evolução"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const serie = montarSerieEvolucao(avaliacoesRes.data ?? []);
  const aderencia = resumoAderencia(sessoesRes.data ?? [], JANELA_ADERENCIA_DIAS);
  const totalAvaliacoes = avaliacoesRes.data?.length ?? 0;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        emphasis="caps"
        title="Evolução"
        subtitle="Seus treinos concluídos e a evolução das avaliações ao longo do tempo."
      />

      {/* Faixa de 3 métricas verdes */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label={`Treinos (${JANELA_ADERENCIA_DIAS}d)`}
          value={aderencia.concluidasPeriodo}
          tone="emphasis"
          radius="2xl"
        />
        <StatCard
          label="Total de treinos"
          value={aderencia.concluidasTotal}
          tone="emphasis"
          radius="2xl"
        />
        <StatCard
          label="Avaliações"
          value={totalAvaliacoes}
          tone="emphasis"
          radius="2xl"
        />
      </div>

      {/* Evolução de execução (carga, volume, frequência e alertas) — mesma
          visão que o professor já tem na ficha do aluno. */}
      <SecaoEvolucao studentId={sessionUser.userId} />

      {/* Gráficos de avaliação */}
      <Card className="rounded-2xl">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <LineChart className="h-5 w-5 text-primary" aria-hidden="true" />
            Evolução das avaliações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {serie.length < 2 ? (
            <EmptyState
              icon={BarChart3}
              title="Evolução indisponível"
              description="Você precisa de ao menos duas avaliações registradas para visualizar os gráficos."
            />
          ) : (
            <GraficosAluno serie={serie} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
