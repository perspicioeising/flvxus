/**
 * Transformação PURA de uma lista de avaliações num conjunto de séries para os
 * gráficos de evolução (recharts). Sem React/UI — testável em
 * `tests/unit/evolucao-series.test.ts`.
 */

/** Linha mínima de avaliação necessária para as séries de evolução. */
export interface AvaliacaoSerie {
  assessed_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  lean_mass_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  abdomen_cm: number | null;
}

/** Ponto de uma série temporal consumido pelo gráfico. */
export interface PontoEvolucao {
  /** Data ISO original (para ordenação/tooltip). */
  data: string;
  /** Rótulo curto dd/mm para o eixo X. */
  rotulo: string;
  peso: number | null;
  gordura: number | null;
  massaMagra: number | null;
  cintura: number | null;
  quadril: number | null;
  abdomen: number | null;
}

/** Formata uma data ISO em dd/mm (eixo X). Datas inválidas viram '—'. */
function rotuloData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

/**
 * Converte avaliações (em qualquer ordem) numa série ordenada do mais antigo ao
 * mais recente, pronta para os gráficos. Valores ausentes permanecem `null`
 * (recharts ignora/interrompe a linha, sem quebrar).
 */
export function montarSerieEvolucao(avaliacoes: AvaliacaoSerie[]): PontoEvolucao[] {
  return [...avaliacoes]
    .filter((a) => !Number.isNaN(new Date(a.assessed_at).getTime()))
    .sort((a, b) => new Date(a.assessed_at).getTime() - new Date(b.assessed_at).getTime())
    .map((a) => ({
      data: a.assessed_at,
      rotulo: rotuloData(a.assessed_at),
      peso: a.weight_kg,
      gordura: a.body_fat_pct,
      massaMagra: a.lean_mass_kg,
      cintura: a.waist_cm,
      quadril: a.hip_cm,
      abdomen: a.abdomen_cm,
    }));
}

/** Indica se há ao menos dois pontos com valor para uma dada métrica. */
export function temEvolucao(
  serie: PontoEvolucao[],
  metrica: keyof Omit<PontoEvolucao, 'data' | 'rotulo'>
): boolean {
  return serie.filter((p) => p[metrica] != null).length >= 2;
}
