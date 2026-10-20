'use client';

import * as React from 'react';
import { LineChart } from 'lucide-react';

import { EvolucaoLineChart } from '@/components/charts/evolucao-line-chart';
import { EmptyState } from '@/components/patterns';
import {
  temEvolucao,
  type PontoEvolucao,
} from '@/components/professor/avaliacoes/evolucao-series';

/**
 * Painel de gráficos de evolução do próprio aluno (peso, %gordura e cintura),
 * consumidor do recharts via `EvolucaoLineChart`. Recebe a série PURA montada
 * no servidor com `montarSerieEvolucao` e só plota as métricas com ao menos dois
 * pontos. Mesma lógica da Fase 4, enxuta para o aluno.
 */

type MetricaChave = keyof Omit<PontoEvolucao, 'data' | 'rotulo'>;

interface MetricaConfig {
  chave: MetricaChave;
  titulo: string;
  unidade: string;
  cor: string;
}

const METRICAS: MetricaConfig[] = [
  { chave: 'peso', titulo: 'Peso', unidade: 'kg', cor: 'hsl(var(--primary))' },
  { chave: 'gordura', titulo: '% de gordura', unidade: '%', cor: 'hsl(var(--destructive))' },
  { chave: 'cintura', titulo: 'Cintura', unidade: 'cm', cor: 'hsl(var(--primary))' },
];

/** Resumo textual (primeiro → último) para leitores de tela. */
function resumoMetrica(serie: PontoEvolucao[], chave: MetricaChave, unidade: string): string {
  const pontos = serie.filter((p) => p[chave] != null);
  if (pontos.length === 0) return 'Sem dados.';
  const primeiro = pontos[0][chave] as number;
  const ultimo = pontos[pontos.length - 1][chave] as number;
  return `Variou de ${primeiro} ${unidade} em ${pontos[0].rotulo} para ${ultimo} ${unidade} em ${pontos[pontos.length - 1].rotulo}.`;
}

export function GraficosAluno({ serie }: { serie: PontoEvolucao[] }) {
  const metricasComDados = METRICAS.filter((m) => temEvolucao(serie, m.chave));

  if (metricasComDados.length === 0) {
    return (
      <EmptyState
        icon={LineChart}
        title="Sem evolução para exibir ainda"
        description="Registre ao menos duas avaliações com as mesmas medidas para ver a evolução."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {metricasComDados.map((m) => (
        <EvolucaoLineChart
          key={m.chave}
          titulo={m.titulo}
          unidade={m.unidade}
          cor={m.cor}
          dados={serie.map((p) => ({ rotulo: p.rotulo, valor: p[m.chave] }))}
          resumo={resumoMetrica(serie, m.chave, m.unidade)}
        />
      ))}
    </div>
  );
}
