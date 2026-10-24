/**
 * Lógica PURA do resumo pós-treino (sem UI, sem Supabase). Formatação de
 * duração/volume e cálculo de deltas entre a sessão atual e a anterior
 * comparável. Totalmente unit-testável (tests/unit/treino-resumo.test.ts).
 */

/** Métricas agregadas de uma sessão para comparação. */
export interface MetricasSessao {
  /** Duração em segundos (floor de `finished_at - started_at`). */
  duracaoSegundos: number;
  /** Volume total (Σ reps×carga das séries concluídas), em kg. */
  volumeKg: number;
  /** Total de séries concluídas. */
  seriesConcluidas: number;
}

/** Deltas da sessão atual em relação à anterior comparável (atual − anterior). */
export interface ComparacaoSessoes {
  /** Delta de duração em segundos (pode ser negativo). */
  duracaoSegundos: number;
  /** Delta de volume em kg (pode ser negativo). */
  volumeKg: number;
  /** Delta de séries concluídas (pode ser negativo). */
  seriesConcluidas: number;
  /**
   * Variação percentual de volume (atual vs. anterior), arredondada ao inteiro.
   * `null` quando a base anterior é 0 (divisão indefinida) — nesse caso a UI
   * mostra só o delta absoluto.
   */
  volumePercentual: number | null;
}

/**
 * Formata uma duração a partir de dois instantes ISO. Regra única:
 * - diferença em segundos por `floor`;
 * - `< 1h` → `mm:ss` com zero-pad (ex.: `07:05`);
 * - `>= 1h` → `"{h}h {mm}min"` com minutos zero-pad a 2 dígitos (ex.: `1h 05min`);
 * - entrada inválida ou duração negativa → `"—"`.
 */
export function formatarDuracao(
  inicioISO: string | null | undefined,
  fimISO: string | null | undefined
): string {
  if (!inicioISO || !fimISO) return '—';
  const inicio = Date.parse(inicioISO);
  const fim = Date.parse(fimISO);
  if (Number.isNaN(inicio) || Number.isNaN(fim)) return '—';

  const totalSegundos = Math.floor((fim - inicio) / 1000);
  if (totalSegundos < 0) return '—';

  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  if (horas >= 1) {
    return `${horas}h ${String(minutos).padStart(2, '0')}min`;
  }
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

/**
 * Formata um volume em kg com separador pt-BR e no máximo 1 casa decimal.
 * Regra ÚNICA de arredondamento: `Intl.NumberFormat('pt-BR', {
 * maximumFractionDigits: 1 })` — sem `Math.round` prévio (o Intl já arredonda
 * meio-para-cima no desempate decimal). Ex.: `30 → "30 kg"`,
 * `1250.5 → "1.250,5 kg"`, `27.45 → "27,5 kg"`.
 */
export function formatarVolumeKg(valor: number): string {
  const n = Number.isFinite(valor) ? valor : 0;
  const formatado = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(n);
  return `${formatado} kg`;
}

/** Uma sessão anterior candidata à comparação, já com séries concluídas contadas. */
export interface CandidataComparacao {
  id: string;
  seriesConcluidas: number;
}

/**
 * Resultado da seleção da última sessão comparável (MEDIUM #6):
 * - `primeira`       → não há NENHUMA sessão anterior deste treino/divisão;
 * - `sem-comparavel` → há anteriores, mas nenhuma com ≥ 1 série concluída;
 * - `comparavel`     → encontrou a base; `id` é a sessão escolhida.
 */
export type SelecaoComparacao =
  | { tipo: 'primeira' }
  | { tipo: 'sem-comparavel' }
  | { tipo: 'comparavel'; id: string };

/**
 * Escolhe a última sessão comparável a partir das candidatas JÁ ordenadas por
 * `finished_at desc` (mais recente primeiro). Comparável = ≥ 1 série concluída.
 * A primeira (mais recente) que qualificar é a base. Se a lista está vazia, não
 * há sessão anterior → `primeira`. Se há candidatas mas nenhuma qualifica →
 * `sem-comparavel` (evita o falso "primeira sessão"). Decidir a mensagem só com
 * a contagem de séries torna a regra testável sem I/O.
 */
export function selecionarSessaoComparavel(
  candidatas: CandidataComparacao[]
): SelecaoComparacao {
  if (candidatas.length === 0) return { tipo: 'primeira' };
  const comparavel = candidatas.find((c) => c.seriesConcluidas >= 1);
  if (comparavel) return { tipo: 'comparavel', id: comparavel.id };
  return { tipo: 'sem-comparavel' };
}

/**
 * Calcula os deltas (atual − anterior) de duração, volume e séries concluídas.
 * O percentual de volume só é definido quando a base anterior é > 0; caso
 * contrário é `null` (a UI exibe só o absoluto).
 */
export function compararSessoes(
  atual: MetricasSessao,
  anterior: MetricasSessao
): ComparacaoSessoes {
  const volumePercentual =
    anterior.volumeKg > 0
      ? Math.round(
          ((atual.volumeKg - anterior.volumeKg) / anterior.volumeKg) * 100
        )
      : null;

  return {
    duracaoSegundos: atual.duracaoSegundos - anterior.duracaoSegundos,
    volumeKg: atual.volumeKg - anterior.volumeKg,
    seriesConcluidas: atual.seriesConcluidas - anterior.seriesConcluidas,
    volumePercentual,
  };
}
