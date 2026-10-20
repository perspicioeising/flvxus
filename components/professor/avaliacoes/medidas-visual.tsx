'use client';

import * as React from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Visualização amigável das MEDIDAS (dobras cutâneas e circunferências) na tela
 * de detalhe da avaliação física.
 *
 * Client Component (recharts exige `'use client'`). Recebe os dados JÁ lidos e
 * montados no server (não busca nem recalcula nada) e os exibe de forma visual:
 *  (a) Circunferências (cm): barras horizontais CSS, com pares simétricos
 *      (esq./dir.) agrupados lado a lado via recharts para destacar assimetrias;
 *  (b) Dobras cutâneas (mm): barras horizontais CSS ordenadas por valor.
 *
 * Mobile-first: empilha no celular. Espelha as convenções do `ComposicaoGrafico`
 * (tokens do tema `hsl(var(--...))`, `ResponsiveContainer`, resumo `sr-only`,
 * `isAnimationActive={false}`). Degrade elegante: seções vazias não renderizam;
 * se tudo estiver vazio, retorna `null`. Nada é inventado.
 */

interface Medida {
  rotulo: string;
  valor: number;
}

export interface MedidasVisualProps {
  /** Dobras cutâneas (mm), já filtradas (sem nulos). */
  dobras: Medida[];
  /** Circunferências (cm), já filtradas (sem nulos). */
  circunferencias: Medida[];
}

/** Cores do tema, espelhando `ComposicaoGrafico`. */
const COR_BARRA = 'hsl(var(--primary))';
const COR_TRILHO = 'hsl(var(--muted))';
const COR_DESTAQUE = 'hsl(var(--warning))';

/** Sufixos que identificam um lado de um par simétrico. */
const SUFIXO_ESQ = ' esq.';
const SUFIXO_DIR = ' dir.';

/** Formata um número com no máximo `casas` casas decimais (pt-BR). */
function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  });
}

interface BarraMedidaProps {
  rotulo: string;
  valor: number;
  /** Maior valor da seção, para escala relativa da largura. */
  max: number;
  unidade: string;
}

/**
 * Linha com rótulo, trilho de fundo e barra preenchida proporcional ao maior
 * valor da seção, com o valor numérico exibido à direita. Acessível: a barra é
 * um `role="img"` com `aria-label` descritivo em pt-BR.
 */
function BarraMedida({ rotulo, valor, max, unidade }: BarraMedidaProps) {
  const largura = max > 0 ? (valor / max) * 100 : 0;
  const descricao = `${rotulo}: ${formatarNumero(valor, 1)} ${unidade}.`;

  return (
    <figure className="space-y-1" role="img" aria-label={descricao}>
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{rotulo}</span>
        <span className="text-sm text-foreground">
          <strong>{formatarNumero(valor, 1)}</strong>
          <span className="text-muted-foreground"> {unidade}</span>
        </span>
      </figcaption>
      <div
        className="h-3 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: COR_TRILHO }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${largura}%`, backgroundColor: COR_BARRA }}
        />
      </div>
    </figure>
  );
}

interface ParSimetrico {
  base: string;
  esquerda: number;
  direita: number;
}

/**
 * Separa as circunferências em pares simétricos (quando ambos os lados existem)
 * e medidas simples (o resto). O pareamento usa o sufixo " esq."/" dir." do
 * rótulo, derivando o nome-base. Mantém a ordem de chegada.
 */
function separarPares(circunferencias: Medida[]): {
  pares: ParSimetrico[];
  simples: Medida[];
} {
  const esquerdas = new Map<string, number>();
  const direitas = new Map<string, number>();
  const simples: Medida[] = [];

  for (const c of circunferencias) {
    if (c.rotulo.endsWith(SUFIXO_ESQ)) {
      esquerdas.set(c.rotulo.slice(0, -SUFIXO_ESQ.length), c.valor);
    } else if (c.rotulo.endsWith(SUFIXO_DIR)) {
      direitas.set(c.rotulo.slice(0, -SUFIXO_DIR.length), c.valor);
    } else {
      simples.push(c);
    }
  }

  const pares: ParSimetrico[] = [];
  const baseUsada = new Set<string>();

  for (const c of circunferencias) {
    let base: string | null = null;
    if (c.rotulo.endsWith(SUFIXO_ESQ)) base = c.rotulo.slice(0, -SUFIXO_ESQ.length);
    else if (c.rotulo.endsWith(SUFIXO_DIR)) base = c.rotulo.slice(0, -SUFIXO_DIR.length);
    if (base == null || baseUsada.has(base)) continue;

    const esquerda = esquerdas.get(base);
    const direita = direitas.get(base);
    if (esquerda != null && direita != null) {
      pares.push({ base, esquerda, direita });
      baseUsada.add(base);
    } else {
      // Lado sem par vira medida simples (preserva o dado sem inventar o outro).
      simples.push(c);
    }
  }

  return { pares, simples: simples.sort((a, b) => b.valor - a.valor) };
}

interface ComparativoParProps {
  par: ParSimetrico;
}

/**
 * Gráfico de barras horizontais (recharts) comparando o lado esquerdo e direito
 * de um par simétrico, destacando o maior lado para evidenciar assimetrias.
 */
function ComparativoPar({ par }: ComparativoParProps) {
  const diff = Math.abs(par.esquerda - par.direita);
  const dados = [
    { lado: 'Esq.', valor: par.esquerda, maior: par.esquerda >= par.direita },
    { lado: 'Dir.', valor: par.direita, maior: par.direita >= par.esquerda },
  ];
  const resumo =
    diff > 0
      ? `${par.base}: esquerda ${formatarNumero(par.esquerda, 1)} cm, direita ${formatarNumero(
          par.direita,
          1
        )} cm (diferença de ${formatarNumero(diff, 1)} cm).`
      : `${par.base}: esquerda e direita iguais, ${formatarNumero(par.esquerda, 1)} cm.`;

  return (
    <figure className="space-y-1">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{par.base}</span>
        <span className="text-xs text-muted-foreground">
          {diff > 0 ? `Δ ${formatarNumero(diff, 1)} cm` : 'simétrico'}
        </span>
      </figcaption>
      <div className="h-20 w-full" role="img" aria-label={resumo}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            layout="vertical"
            margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="lado"
              width={36}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              formatter={(valor: number | string) => [`${formatarNumero(Number(valor), 1)} cm`, par.base]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                fontSize: 12,
              }}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {dados.map((d) => (
                <Cell key={d.lado} fill={d.maior ? COR_DESTAQUE : COR_BARRA} />
              ))}
              <LabelList
                dataKey="valor"
                position="right"
                formatter={(valor: React.ReactNode) => `${formatarNumero(Number(valor), 1)}`}
                style={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">{resumo}</p>
    </figure>
  );
}

export function MedidasVisual({
  dobras,
  circunferencias,
}: MedidasVisualProps): React.JSX.Element | null {
  // Degrade: nada a exibir.
  if (dobras.length === 0 && circunferencias.length === 0) {
    return null;
  }

  const { pares, simples } = separarPares(circunferencias);
  const maxSimples = simples.reduce((m, c) => Math.max(m, c.valor), 0);
  const dobrasOrdenadas = [...dobras].sort((a, b) => b.valor - a.valor);
  const maxDobras = dobrasOrdenadas.reduce((m, d) => Math.max(m, d.valor), 0);

  // Resumo textual completo para leitores de tela (o gráfico sozinho não basta).
  const resumoCircunferencias =
    circunferencias.length > 0
      ? `Circunferências em centímetros: ${circunferencias
          .map((c) => `${c.rotulo} ${formatarNumero(c.valor, 1)}`)
          .join(', ')}.`
      : '';
  const resumoDobras =
    dobras.length > 0
      ? `Dobras cutâneas em milímetros: ${dobras
          .map((d) => `${d.rotulo} ${formatarNumero(d.valor, 1)}`)
          .join(', ')}.`
      : '';

  return (
    <div className="space-y-6">
      <p className="sr-only">{`${resumoCircunferencias} ${resumoDobras}`.trim()}</p>

      {circunferencias.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Circunferências (cm)</h3>

          {pares.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {pares.map((par) => (
                <ComparativoPar key={par.base} par={par} />
              ))}
            </div>
          ) : null}

          {simples.length > 0 ? (
            <div className="space-y-3">
              {simples.map((c) => (
                <BarraMedida
                  key={c.rotulo}
                  rotulo={c.rotulo}
                  valor={c.valor}
                  max={maxSimples}
                  unidade="cm"
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {dobras.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Dobras cutâneas (mm)</h3>
          <div className="space-y-3">
            {dobrasOrdenadas.map((d) => (
              <BarraMedida
                key={d.rotulo}
                rotulo={d.rotulo}
                valor={d.valor}
                max={maxDobras}
                unidade="mm"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
