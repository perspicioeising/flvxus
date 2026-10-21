import type { ReactNode } from 'react';
import { AlertTriangle, LineChart, TrendingUp } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState, ErrorState } from '@/components/patterns';
import { EvolucaoGraficos } from '@/components/professor/avaliacoes/evolucao-graficos';
import { montarSerieEvolucao } from '@/components/professor/avaliacoes/evolucao-series';
import {
  montarSerieCarga,
  resumoFrequencia,
  temSerieCarga,
  type LogCarga,
  type SessaoCarga,
} from '@/lib/treino/evolucao-carga';
import { montarAlertasEvolucao } from '@/lib/treino/alertas-evolucao';
import { EvolucaoCargaCliente } from './evolucao-carga-cliente';
import {
  EvolucaoVolumeCliente,
  type PontoVolume,
} from './evolucao-volume-cliente';

/**
 * Seção "Evolução" da ficha do aluno (lado professor). Server Component que lê,
 * sob RLS via `createClient()`, as sessões + séries de execução do aluno e monta
 * a progressão de CARGA (peso dos aparelhos), o VOLUME por sessão, a FREQUÊNCIA
 * e os ALERTAS de dificuldade de evolução. Reaproveita os gráficos de composição
 * corporal (`EvolucaoGraficos`) a partir das avaliações físicas.
 *
 * A parte interativa (seletor de exercício do gráfico de carga) fica em Client
 * Components que recebem apenas props serializáveis montadas aqui.
 */

/** Shape do JOIN aninhado workout_plan_items → exercises (PostgREST). */
interface LogRow {
  session_id: string;
  plan_item_id: string | null;
  set_number: number;
  reps_done: number | null;
  load_done: number | null;
  completed: boolean;
  workout_plan_items: { exercises: { name: string } | null } | null;
}

export async function SecaoEvolucao({ studentId }: { studentId: string }) {
  const supabase = await createClient();

  // 1) Sessões do aluno (eixo do tempo) + avaliações (composição) em paralelo.
  const [sessoesRes, avaliacoesRes] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id, started_at, finished_at')
      .eq('student_id', studentId)
      .order('started_at', { ascending: true }),
    supabase
      .from('physical_assessments')
      .select(
        'assessed_at, weight_kg, body_fat_pct, lean_mass_kg, waist_cm, hip_cm, abdomen_cm'
      )
      .eq('student_id', studentId)
      .order('assessed_at', { ascending: true }),
  ]);

  // Erro ao ler a execução derruba só a seção (não a ficha).
  if (sessoesRes.error) {
    return (
      <CardEvolucao>
        <ErrorState description="Não foi possível carregar a evolução de execução deste aluno." />
      </CardEvolucao>
    );
  }

  const sessoes: SessaoCarga[] = sessoesRes.data ?? [];
  const serieComposicao = montarSerieEvolucao(avaliacoesRes.data ?? []);

  // Sem execução registrada: EmptyState (a composição aparece se houver).
  if (sessoes.length === 0) {
    return (
      <CardEvolucao>
        <EmptyState
          icon={LineChart}
          title="Sem histórico de execução ainda"
          description="Quando o aluno registrar treinos executados, a progressão de carga, volume e frequência aparecerão aqui."
        />
        {serieComposicao.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Composição corporal</h3>
            <EvolucaoGraficos serie={serieComposicao} />
          </div>
        ) : null}
      </CardEvolucao>
    );
  }

  // 2) Logs de série das sessões do aluno, com o nome do exercício via JOIN.
  // Filtramos por `session_id in (...)` (duas queries) em vez de um filtro
  // aninhado do PostgREST, que não é usado em nenhum outro lugar do repo. A RLS
  // já restringe as linhas ao tenant do professor, então é seguro.
  const idsSessoes = sessoes.map((s) => s.id);
  const logsRes = await supabase
    .from('workout_set_logs')
    .select(
      'session_id, plan_item_id, set_number, reps_done, load_done, completed, workout_plan_items ( exercises ( name ) )'
    )
    .in('session_id', idsSessoes);

  if (logsRes.error) {
    return (
      <CardEvolucao>
        <ErrorState description="Não foi possível carregar as séries de execução deste aluno." />
      </CardEvolucao>
    );
  }

  const logsRaw = (logsRes.data ?? []) as unknown as LogRow[];
  const logs: LogCarga[] = logsRaw.map((l) => ({
    session_id: l.session_id,
    plan_item_id: l.plan_item_id,
    exercicioNome: l.workout_plan_items?.exercises?.name ?? null,
    set_number: l.set_number,
    reps_done: l.reps_done,
    load_done: l.load_done,
    completed: l.completed,
  }));

  const series = montarSerieCarga(logs, sessoes);
  const seriesComCarga = series.filter(temSerieCarga);
  const freq = resumoFrequencia(sessoes);
  const alertas = montarAlertasEvolucao(series, freq);

  // Volume por sessão: Σ volume de todas as séries na mesma sessão, ordenado por
  // data (usa o rótulo/data já desambiguados em montarSerieCarga).
  const volumePorSessao = new Map<string, { rotulo: string; data: string; volume: number }>();
  for (const serie of series) {
    for (const p of serie.pontos) {
      const atual = volumePorSessao.get(p.data) ?? {
        rotulo: p.rotulo,
        data: p.data,
        volume: 0,
      };
      atual.volume += p.volume;
      volumePorSessao.set(p.data, atual);
    }
  }
  const pontosVolume: PontoVolume[] = [...volumePorSessao.values()]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((v) => ({ rotulo: v.rotulo, volume: Math.round(v.volume) }));

  const temCarga = seriesComCarga.length > 0;
  const temVolume = pontosVolume.length >= 2;

  return (
    <CardEvolucao>
      <div className="space-y-6">
        {/* Progressão de carga */}
        {temCarga ? (
          <EvolucaoCargaCliente series={seriesComCarga} />
        ) : (
          <EmptyState
            icon={LineChart}
            title="Sem progressão de carga ainda"
            description="É preciso ao menos duas sessões com carga registrada no mesmo exercício."
          />
        )}

        {/* Volume por sessão */}
        {temVolume ? (
          <div className="border-t border-border pt-6">
            <EvolucaoVolumeCliente pontos={pontosVolume} />
          </div>
        ) : null}

        {/* Frequência */}
        <div className="border-t border-border pt-6 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Frequência de treino</h3>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Resumo rotulo={`Concluídos (${freq.dias} dias)`} valor={String(freq.concluidasPeriodo)} />
            <Resumo rotulo="Concluídos (total)" valor={String(freq.concluidasTotal)} />
            <Resumo rotulo="Semanas com treino" valor={String(freq.semanasComTreino)} />
          </dl>
          {freq.porSemana.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {freq.porSemana.map((s) => (
                <li
                  key={s.semana}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  Semana de {s.semana}: {s.total} treino(s)
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Alertas de dificuldade de evolução */}
        {alertas.length > 0 ? (
          <div className="border-t border-border pt-6 space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
              Dificuldades de evolução
            </h3>
            <ul className="space-y-1">
              {alertas.map((a) => (
                <li
                  key={a}
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Composição corporal (reaproveita gráficos de avaliação) */}
        {serieComposicao.length > 0 ? (
          <div className="border-t border-border pt-6 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Composição corporal</h3>
            <EvolucaoGraficos serie={serieComposicao} />
          </div>
        ) : null}
      </div>
    </CardEvolucao>
  );
}

/** Casca do Card "Evolução" (reduz repetição nos early returns). */
function CardEvolucao({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Evolução
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Par rótulo/valor numérico do resumo de frequência. */
function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-lg font-semibold text-foreground">{valor}</dd>
    </div>
  );
}
