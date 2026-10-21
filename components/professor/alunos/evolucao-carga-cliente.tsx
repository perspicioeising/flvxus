'use client';

import * as React from 'react';

import { EvolucaoLineChart } from '@/components/charts/evolucao-line-chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SerieCarga } from '@/lib/treino/evolucao-carga';

/**
 * Bloco interativo da progressão de CARGA por exercício. Recebe as séries já
 * montadas e filtradas no servidor (`montarSerieCarga` + `temSerieCarga`), todas
 * com props serializáveis (arrays de números/strings). Mostra um `Select` com os
 * exercícios e um único gráfico por vez (mobile-first). Plota `cargaMax` (kg).
 */

/** Resumo textual (primeiro → último cargaMax) para acessibilidade. */
function resumoCarga(serie: SerieCarga): string {
  const pontos = serie.pontos.filter((p) => p.cargaMax != null);
  if (pontos.length === 0) return 'Sem dados de carga.';
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  return `Carga máxima variou de ${primeiro.cargaMax} kg em ${primeiro.rotulo} para ${ultimo.cargaMax} kg em ${ultimo.rotulo}.`;
}

export function EvolucaoCargaCliente({ series }: { series: SerieCarga[] }) {
  const [selecionado, setSelecionado] = React.useState(
    () => series[0]?.exercicio ?? ''
  );

  if (series.length === 0) return null;

  const serieAtual =
    series.find((s) => s.exercicio === selecionado) ?? series[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          Progressão de carga por exercício
        </span>
        <p className="text-xs text-muted-foreground">
          Peso máximo levantado em cada sessão (carga dos aparelhos).
        </p>
      </div>

      {series.length > 1 ? (
        <Select value={serieAtual.exercicio} onValueChange={setSelecionado}>
          <SelectTrigger className="w-full sm:max-w-xs" aria-label="Escolher exercício">
            <SelectValue placeholder="Escolha um exercício" />
          </SelectTrigger>
          <SelectContent>
            {series.map((s) => (
              <SelectItem key={s.exercicio} value={s.exercicio}>
                {s.exercicio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <EvolucaoLineChart
        titulo={`Carga — ${serieAtual.exercicio}`}
        unidade="kg"
        dados={serieAtual.pontos.map((p) => ({ rotulo: p.rotulo, valor: p.cargaMax }))}
        resumo={resumoCarga(serieAtual)}
      />
    </div>
  );
}
