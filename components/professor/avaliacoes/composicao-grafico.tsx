'use client';

import * as React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  classificarGordura,
  classificarImc,
  DOMINIO_GORDURA,
  DOMINIO_IMC,
  faixasGordura,
  faixasImc,
  type FaixaClassificacao,
} from '@/lib/assessment';

/**
 * Visualização amigável da composição corporal na tela de detalhe da avaliação.
 *
 * Client Component (recharts exige `'use client'`). Recebe os números JÁ
 * calculados e persistidos (não recalcula nada) e renderiza, para cada dado
 * disponível:
 *  (a) barra de faixa do %gordura (classificação ACE por gênero);
 *  (b) donut massa gorda × massa magra (kg e %);
 *  (c) barra de faixa do IMC (classificação OMS).
 *
 * Mobile-first: empilha no celular e vira grid de 2 colunas em telas ≥sm.
 * Cada bloco só aparece se houver o dado necessário; nada é inventado.
 */

export interface ComposicaoGraficoProps {
  /** IMC já persistido (kg/m²). Null se não calculado. */
  bmi: number | null;
  /** % de gordura corporal já persistido (0–100). Null se não calculado. */
  bodyFatPct: number | null;
  /** Massa gorda (kg) já persistida. Null se não calculada. */
  fatMassKg: number | null;
  /** Massa magra (kg) já persistida. Null se não calculada. */
  leanMassKg: number | null;
  /** Peso (kg) — usado só para rótulo informativo. Null se ausente. */
  weightKg: number | null;
  /** Gênero — define as faixas de %gordura. Null omite a classificação por gênero. */
  gender: 'male' | 'female' | null;
}

/** Formata um número com no máximo `casas` casas decimais (pt-BR). */
function formatarNumero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  });
}

/** Posição (0–100%) do marcador dentro do domínio visual, com clamp nas bordas. */
function posicaoMarcador(valor: number, min: number, max: number): number {
  const pct = ((valor - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, pct));
}

/** Largura relativa (0–100%) de cada segmento dentro do domínio visual. */
function larguraSegmento(faixa: FaixaClassificacao, min: number, max: number): number {
  const inicio = Math.max(faixa.min, min);
  const fim = Math.min(faixa.max, max);
  return ((fim - inicio) / (max - min)) * 100;
}

interface BarraFaixaProps {
  titulo: string;
  valor: number;
  unidade: string;
  faixas: FaixaClassificacao[];
  faixaAtual: FaixaClassificacao;
  dominio: { readonly min: number; readonly max: number };
}

/**
 * Barra horizontal segmentada por faixas de referência, com marcador na posição
 * do valor. Reutilizada por %gordura e IMC. Acessível: a barra inteira é um
 * `role="img"` com `aria-label` descritivo em pt-BR.
 */
function BarraFaixa({
  titulo,
  valor,
  unidade,
  faixas,
  faixaAtual,
  dominio,
}: BarraFaixaProps) {
  const posicao = posicaoMarcador(valor, dominio.min, dominio.max);
  const descricao = `${titulo} ${formatarNumero(valor, 1)}${unidade}: ${faixaAtual.rotulo}.`;

  return (
    <figure className="space-y-3">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{titulo}</span>
        <span className="text-sm text-muted-foreground">
          <strong className="text-foreground">{formatarNumero(valor, 1)}</strong>
          {unidade} · {faixaAtual.rotulo}
        </span>
      </figcaption>

      <div
        className="relative"
        role="img"
        aria-label={descricao}
      >
        {/* Segmentos coloridos das faixas */}
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {faixas.map((faixa) => {
            const largura = larguraSegmento(faixa, dominio.min, dominio.max);
            if (largura <= 0) return null;
            return (
              <div
                key={faixa.rotulo + faixa.min}
                style={{ width: `${largura}%`, backgroundColor: faixa.cor }}
                aria-hidden="true"
              />
            );
          })}
        </div>

        {/* Marcador na posição do valor */}
        <div
          className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-foreground"
          style={{ left: `${posicao}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="sr-only">{descricao}</p>
    </figure>
  );
}

interface DonutComposicaoProps {
  fatMassKg: number;
  leanMassKg: number;
  bodyFatPct: number | null;
}

/** Cores do donut (tokens do tema). */
const COR_MASSA_GORDA = 'hsl(var(--warning))';
const COR_MASSA_MAGRA = 'hsl(var(--primary))';

/**
 * Donut (PieChart com innerRadius) de massa gorda × massa magra, com legenda em
 * kg e %. O centro mostra o %gordura quando disponível. Acessível via resumo
 * textual oculto.
 */
function DonutComposicao({ fatMassKg, leanMassKg, bodyFatPct }: DonutComposicaoProps) {
  const total = fatMassKg + leanMassKg;
  const pctGorda = total > 0 ? (fatMassKg / total) * 100 : 0;
  const pctMagra = total > 0 ? (leanMassKg / total) * 100 : 0;

  const dados = [
    { nome: 'Massa gorda', valor: fatMassKg, cor: COR_MASSA_GORDA, pct: pctGorda },
    { nome: 'Massa magra', valor: leanMassKg, cor: COR_MASSA_MAGRA, pct: pctMagra },
  ];

  const resumo = `Composição corporal: massa gorda ${formatarNumero(
    fatMassKg,
    1
  )} kg (${formatarNumero(pctGorda, 1)}%) e massa magra ${formatarNumero(
    leanMassKg,
    1
  )} kg (${formatarNumero(pctMagra, 1)}%).`;

  return (
    <figure className="space-y-3">
      <figcaption className="text-sm font-medium text-foreground">
        Massa gorda × massa magra
      </figcaption>

      <div className="relative h-56 w-full" role="img" aria-label={resumo}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {dados.map((d) => (
                <Cell key={d.nome} fill={d.cor} />
              ))}
            </Pie>
            <Tooltip
              formatter={(valor: number | string, nome: number | string) => {
                const item = dados.find((d) => d.nome === nome);
                const pct = item ? ` (${formatarNumero(item.pct, 1)}%)` : '';
                return [`${formatarNumero(Number(valor), 1)} kg${pct}`, nome];
              }}
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
          </PieChart>
        </ResponsiveContainer>

        {bodyFatPct != null ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-foreground">
              {formatarNumero(bodyFatPct, 1)}%
            </span>
            <span className="text-xs text-muted-foreground">gordura</span>
          </div>
        ) : null}
      </div>

      {/* Legenda textual com kg e % */}
      <ul className="space-y-1 text-sm">
        {dados.map((d) => (
          <li key={d.nome} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.cor }}
                aria-hidden="true"
              />
              {d.nome}
            </span>
            <span className="text-foreground">
              {formatarNumero(d.valor, 1)} kg
              <span className="text-muted-foreground"> · {formatarNumero(d.pct, 1)}%</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="sr-only">{resumo}</p>
    </figure>
  );
}

export function ComposicaoGrafico({
  bmi,
  bodyFatPct,
  fatMassKg,
  leanMassKg,
  weightKg,
  gender,
}: ComposicaoGraficoProps): React.JSX.Element | null {
  const temGordura = bodyFatPct != null && gender != null;
  const temMassas = fatMassKg != null && leanMassKg != null;
  const temImc = bmi != null;
  // Aviso quando há %gordura mas falta o gênero para classificar por faixa.
  const avisoGenero = bodyFatPct != null && gender == null;

  // Nada a mostrar: a page decide exibir aviso.
  if (!temGordura && !temMassas && !temImc && !avisoGenero) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Composição corporal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {temGordura ? (
            <BarraFaixa
              titulo="% de gordura"
              valor={bodyFatPct as number}
              unidade="%"
              faixas={faixasGordura(gender as 'male' | 'female')}
              faixaAtual={classificarGordura(bodyFatPct as number, gender as 'male' | 'female')}
              dominio={DOMINIO_GORDURA}
            />
          ) : avisoGenero ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">% de gordura</p>
              <p className="text-sm text-muted-foreground">
                {formatarNumero(bodyFatPct as number, 1)}% — informe o gênero do aluno para
                classificar por faixa.
              </p>
            </div>
          ) : null}

          {temImc ? (
            <BarraFaixa
              titulo="IMC"
              valor={bmi as number}
              unidade=""
              faixas={faixasImc()}
              faixaAtual={classificarImc(bmi as number)}
              dominio={DOMINIO_IMC}
            />
          ) : null}

          <div className="sm:col-span-2">
            {temMassas ? (
              <DonutComposicao
                fatMassKg={fatMassKg as number}
                leanMassKg={leanMassKg as number}
                bodyFatPct={bodyFatPct}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem dados de massa gorda e massa magra para esta avaliação.
              </p>
            )}
          </div>
        </div>

        {weightKg != null ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Peso de referência: {formatarNumero(weightKg, 1)} kg.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
