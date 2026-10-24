'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Wrapper fino do recharts para uma linha de evolução (uma métrica ao longo do
 * tempo). Mobile-first (altura fixa e container responsivo) e acessível: o
 * gráfico é complementado por um resumo textual (`resumo`) lido por leitores de
 * tela, pois SVG de gráfico não é autoexplicativo.
 */
export interface SerieLinha {
  rotulo: string;
  valor: number | null;
}

export interface EvolucaoLineChartProps {
  titulo: string;
  dados: SerieLinha[];
  /** Unidade exibida no tooltip (ex.: 'kg', '%', 'cm'). */
  unidade?: string;
  /** Cor da linha (token CSS var, padrão primary). */
  cor?: string;
  /** Resumo textual para leitores de tela (ex.: "Variou de 82 a 78 kg"). */
  resumo: string;
}

export function EvolucaoLineChart({
  titulo,
  dados,
  unidade = '',
  cor = 'hsl(var(--primary))',
  resumo,
}: EvolucaoLineChartProps) {
  const chaveId = React.useId();

  return (
    <figure className="space-y-2">
      <figcaption className="text-sm font-medium text-foreground">{titulo}</figcaption>
      <div className="h-56 w-full" role="img" aria-label={`${titulo}. ${resumo}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="rotulo"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              tickLine={false}
              width={40}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(valor: number | string) => [`${valor}${unidade ? ` ${unidade}` : ''}`, titulo]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                fontSize: 12,
              }}
              // O recharts pinta item/rótulo com cores próprias (série/escuro),
              // ignorando o contentStyle — daí o texto ilegível no tema escuro.
              // Forçamos os tokens do tema também aqui.
              itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Line
              key={chaveId}
              type="monotone"
              dataKey="valor"
              stroke={cor}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">{resumo}</p>
    </figure>
  );
}
