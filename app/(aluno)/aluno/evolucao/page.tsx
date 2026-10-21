import { BarChart3, CheckCircle2, LineChart } from 'lucide-react';
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
import { EmptyState, ErrorState } from '@/components/patterns';
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
        <PageHeader />
        <ErrorState
          title="Não foi possível carregar sua evolução"
          description="Ocorreu um erro ao buscar seus dados. Atualize a página para tentar novamente."
        />
      </section>
    );
  }

  const serie = montarSerieEvolucao(avaliacoesRes.data ?? []);
  const aderencia = resumoAderencia(sessoesRes.data ?? [], JANELA_ADERENCIA_DIAS);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader />

      {/* Aderência de treino */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Aderência de treino
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <dl className="grid grid-cols-2 gap-4">
            <Resumo
              rotulo={`Concluídos (${JANELA_ADERENCIA_DIAS} dias)`}
              valor={String(aderencia.concluidasPeriodo)}
            />
            <Resumo rotulo="Concluídos (total)" valor={String(aderencia.concluidasTotal)} />
          </dl>
        </CardContent>
      </Card>

      {/* Evolução de execução (carga, volume, frequência e alertas) — mesma
          visão que o professor já tem na ficha do aluno. */}
      <SecaoEvolucao studentId={sessionUser.userId} />

      {/* Gráficos de avaliação */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <LineChart className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
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

/** Cabeçalho da tela de evolução (reusado no caminho de erro). */
function PageHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Evolução</h1>
      <p className="text-sm text-muted-foreground">
        Acompanhe seus treinos concluídos e a evolução das suas avaliações ao longo do tempo.
      </p>
    </header>
  );
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-2xl font-bold text-foreground">{valor}</dd>
    </div>
  );
}
