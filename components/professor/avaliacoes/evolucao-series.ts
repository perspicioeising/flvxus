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

/** Formata dd/mm HH:mm — usado para desambiguar avaliações do mesmo dia. */
function rotuloDataHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const hora = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dia}/${mes} ${hora}:${min}`;
}

/**
 * Converte avaliações (em qualquer ordem) numa série ordenada do mais antigo ao
 * mais recente, pronta para os gráficos. Valores ausentes permanecem `null`
 * (recharts ignora/interrompe a linha, sem quebrar).
 *
 * Rótulo do eixo X: dd/mm por padrão; quando há mais de uma avaliação no MESMO
 * dia, esses rótulos repetidos ganham a hora (dd/mm HH:mm) para que seja
 * possível distinguir a ordem — antes todas apareciam como "20/10" e a evolução
 * parecia aleatória.
 */
export function montarSerieEvolucao(avaliacoes: AvaliacaoSerie[]): PontoEvolucao[] {
  const ordenadas = [...avaliacoes]
    .filter((a) => !Number.isNaN(new Date(a.assessed_at).getTime()))
    .sort((a, b) => new Date(a.assessed_at).getTime() - new Date(b.assessed_at).getTime());

  // Conta quantas vezes cada rótulo dd/mm aparece para detectar colisões.
  const contagemPorDia = new Map<string, number>();
  for (const a of ordenadas) {
    const r = rotuloData(a.assessed_at);
    contagemPorDia.set(r, (contagemPorDia.get(r) ?? 0) + 1);
  }

  return ordenadas.map((a) => {
    const base = rotuloData(a.assessed_at);
    const rotulo = (contagemPorDia.get(base) ?? 0) > 1 ? rotuloDataHora(a.assessed_at) : base;
    return {
      data: a.assessed_at,
      rotulo,
      peso: a.weight_kg,
      gordura: a.body_fat_pct,
      massaMagra: a.lean_mass_kg,
      cintura: a.waist_cm,
      quadril: a.hip_cm,
      abdomen: a.abdomen_cm,
    };
  });
}

/** Indica se há ao menos dois pontos com valor para uma dada métrica. */
export function temEvolucao(
  serie: PontoEvolucao[],
  metrica: keyof Omit<PontoEvolucao, 'data' | 'rotulo'>
): boolean {
  return serie.filter((p) => p[metrica] != null).length >= 2;
}
