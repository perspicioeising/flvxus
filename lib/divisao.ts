/**
 * Utilitários puros de DIVISÃO (sem UI, sem dependências de runtime do Next).
 *
 * A divisão é o rótulo curto da coluna `workout_plan_items.division` (ex.: 'A',
 * 'B', 'C' ou o nome do modelo de origem). É o conceito que substitui o dia da
 * semana fixo: o aluno escolhe qual divisão treinar quando vai à academia.
 * Itens sem divisão definida (`division = null`, fichas legadas por weekday)
 * caem num balde próprio, "Divisão única".
 *
 * Espelha `lib/semana.ts` (agruparPorDia), mas agrupa por rótulo de texto.
 */

/** Rótulo do balde dos itens sem divisão definida (`division = null`). */
export const SEM_DIVISAO_LABEL = 'Divisão única';

/** Um grupo de itens pertencentes a uma mesma divisão. */
export interface GrupoDivisao<T> {
  /** Rótulo da divisão (ex.: 'A') ou `null` para o balde "Divisão única". */
  division: string | null;
  /** Rótulo exibível: o próprio valor da divisão ou "Divisão única". */
  rotulo: string;
  /** Itens do grupo, na ordem original de entrada. */
  itens: T[];
}

/**
 * Agrupa `itens` por divisão usando `getDivision(item)`. Os rótulos não-nulos
 * são ordenados por `localeCompare` ('pt-BR'); o balde "Divisão única"
 * (`division = null`) vem sempre por último. Grupos vazios não são incluídos.
 * Para itens com divisão não-nula o rótulo é o próprio valor; a ordem original
 * dos itens dentro de cada grupo é preservada.
 */
export function agruparPorDivisao<T>(
  itens: T[],
  getDivision: (item: T) => string | null
): GrupoDivisao<T>[] {
  const porDivisao = new Map<string, T[]>();
  const semDivisao: T[] = [];

  for (const item of itens) {
    const division = getDivision(item);
    if (division === null || division === undefined) {
      semDivisao.push(item);
      continue;
    }
    const bucket = porDivisao.get(division);
    if (bucket) {
      bucket.push(item);
    } else {
      porDivisao.set(division, [item]);
    }
  }

  const grupos: GrupoDivisao<T>[] = [];
  const rotulos = Array.from(porDivisao.keys()).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
  for (const division of rotulos) {
    const bucket = porDivisao.get(division);
    if (bucket && bucket.length > 0) {
      grupos.push({ division, rotulo: division, itens: bucket });
    }
  }
  if (semDivisao.length > 0) {
    grupos.push({ division: null, rotulo: SEM_DIVISAO_LABEL, itens: semDivisao });
  }

  return grupos;
}
