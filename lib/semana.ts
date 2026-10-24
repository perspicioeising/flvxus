/**
 * Utilitários puros de semana (sem UI, sem dependências de runtime do Next).
 *
 * O dia da semana segue a convenção de `Date.getDay()` e da coluna
 * `workout_plan_items.weekday`: 0 = domingo … 6 = sábado. Itens sem dia
 * definido (`weekday = null`) caem num balde próprio.
 */

/** Rótulos pt-BR por dia da semana, indexados por `getDay()` (0=Domingo..6=Sábado). */
export const WEEKDAY_LABEL: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

/** Rótulo do balde dos itens sem dia da semana definido. */
export const SEM_DIA_LABEL = 'Sem dia definido';

/**
 * Valor sentinela na URL (`?dia=none`) que representa o balde sem eixo (itens
 * com `weekday = null`). Espelha `DIVISAO_SEM`: distingue "quero o balde sem
 * dia" de "não informei dia nenhum", eliminando o loop detalhe→execução.
 */
export const DIA_SEM = 'none';

/**
 * Resultado de 3 estados do parse do searchParam `?dia=`:
 * - `dia`     → um weekday válido (0..6);
 * - `sem`     → o balde sem eixo (`weekday = null`), via sentinela `none`;
 * - `ausente` → nenhum `?dia=` na URL, vazio ou valor inválido.
 */
export type DiaPedido =
  | { tipo: 'dia'; valor: number }
  | { tipo: 'sem' }
  | { tipo: 'ausente' };

/**
 * Converte o searchParam `?dia=` num `DiaPedido` de 3 estados. Vazio/ausente →
 * `ausente`; o sentinela `DIA_SEM` → `sem`; inteiro 0..6 → `dia`; qualquer
 * outro (fora da faixa, não-inteiro) → `ausente` (degrada para "todos").
 */
export function parseDia(valor: string | string[] | undefined): DiaPedido {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  if (bruto === undefined) return { tipo: 'ausente' };
  const limpo = bruto.trim();
  if (limpo === '') return { tipo: 'ausente' };
  if (limpo === DIA_SEM) return { tipo: 'sem' };
  const n = Number(limpo);
  return Number.isInteger(n) && n >= 0 && n <= 6
    ? { tipo: 'dia', valor: n }
    : { tipo: 'ausente' };
}

/** Dia da semana atual (0=Domingo..6=Sábado), a partir de `new Date()`. */
export function weekdayAtual(referencia: Date = new Date()): number {
  return referencia.getDay();
}

/** Um grupo de itens pertencentes a um mesmo dia da semana. */
export interface GrupoDia<T> {
  /** Dia da semana (0..6) ou `null` para o balde "Sem dia definido". */
  weekday: number | null;
  /** Rótulo pt-BR do dia (ou "Sem dia definido"). */
  rotulo: string;
  /** Itens do grupo, na ordem original de entrada. */
  itens: T[];
}

/**
 * Agrupa `itens` por dia da semana usando `getWeekday(item)`. Retorna a lista
 * de grupos ordenada de domingo a sábado; o balde "Sem dia definido"
 * (weekday `null`) vem por último. Grupos vazios não são incluídos.
 */
export function agruparPorDia<T>(
  itens: T[],
  getWeekday: (item: T) => number | null
): GrupoDia<T>[] {
  const porDia = new Map<number, T[]>();
  const semDia: T[] = [];

  for (const item of itens) {
    const weekday = getWeekday(item);
    if (weekday === null || weekday === undefined) {
      semDia.push(item);
      continue;
    }
    const bucket = porDia.get(weekday);
    if (bucket) {
      bucket.push(item);
    } else {
      porDia.set(weekday, [item]);
    }
  }

  const grupos: GrupoDia<T>[] = [];
  for (let weekday = 0; weekday <= 6; weekday += 1) {
    const bucket = porDia.get(weekday);
    if (bucket && bucket.length > 0) {
      grupos.push({ weekday, rotulo: WEEKDAY_LABEL[weekday], itens: bucket });
    }
  }
  if (semDia.length > 0) {
    grupos.push({ weekday: null, rotulo: SEM_DIA_LABEL, itens: semDia });
  }

  return grupos;
}
