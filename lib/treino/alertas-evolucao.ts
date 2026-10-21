/**
 * Monta os sinais de "dificuldade de evolução" (textos pt-BR) a partir das
 * séries de carga e do resumo de frequência. Puro e testável em
 * `tests/unit/alertas-evolucao.test.ts`.
 */

import {
  detectarEstagnacao,
  type ResumoFrequencia,
  type SerieCarga,
} from './evolucao-carga';

/** Nº de sessões recentes consideradas para a taxa de conclusão de séries. */
const SESSOES_RECENTES = 5;
/** Abaixo desta taxa média de conclusão, emite alerta. */
const LIMIAR_CONCLUSAO = 0.6;

/**
 * Deriva a taxa média (0..1) de séries concluídas nas últimas `SESSOES_RECENTES`
 * sessões, agregando todos os exercícios por sessão (via `data`). Retorna null
 * quando não há séries registradas.
 */
function taxaConclusaoRecente(series: SerieCarga[]): number | null {
  // Agrega por sessão (data ISO): soma feitas/totais de todos os exercícios.
  const porSessao = new Map<string, { feitas: number; totais: number }>();
  for (const serie of series) {
    for (const p of serie.pontos) {
      const atual = porSessao.get(p.data) ?? { feitas: 0, totais: 0 };
      atual.feitas += p.seriesFeitas;
      atual.totais += p.seriesTotais;
      porSessao.set(p.data, atual);
    }
  }

  const sessoes = [...porSessao.entries()]
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-SESSOES_RECENTES)
    .map(([, v]) => v);

  const totais = sessoes.reduce((acc, s) => acc + s.totais, 0);
  if (totais === 0) return null;
  const feitas = sessoes.reduce((acc, s) => acc + s.feitas, 0);
  return feitas / totais;
}

/**
 * Lista curta de alertas de dificuldade de evolução:
 * - estagnação de carga por exercício (platô nas últimas 3 sessões);
 * - baixa frequência (≤ 1 treino concluído na janela);
 * - muitas séries não concluídas recentemente (taxa < 0,6).
 */
export function montarAlertasEvolucao(
  series: SerieCarga[],
  freq: ResumoFrequencia
): string[] {
  const alertas: string[] = [];

  for (const serie of series) {
    if (detectarEstagnacao(serie)) {
      alertas.push(`${serie.exercicio}: carga estagnada nas últimas 3 sessões.`);
    }
  }

  if (freq.concluidasPeriodo <= 1) {
    const treinoLabel = freq.concluidasPeriodo === 1 ? 'treino concluído' : 'treinos concluídos';
    alertas.push(
      `Apenas ${freq.concluidasPeriodo} ${treinoLabel} nos últimos ${freq.dias} dias.`
    );
  }

  const taxa = taxaConclusaoRecente(series);
  if (taxa != null && taxa < LIMIAR_CONCLUSAO) {
    alertas.push('Muitas séries não concluídas nas sessões recentes.');
  }

  return alertas;
}
