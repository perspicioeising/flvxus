/**
 * Resolução pura dos valores de UMA série na execução (sem UI, sem Supabase).
 *
 * Regra única do projeto — "série vence; item é fallback": quando existe uma
 * série explícita para o `setNumber`, cada campo preenchido nela (não-NULL)
 * prevalece; campos NULL da série herdam do item pai (os defaults da
 * prescrição). Sem série explícita (ficha legada ou `setNumber` fora da lista),
 * tudo vem dos defaults do item, com `kind` em `'work'` e `note` em `null`.
 *
 * Este helper é propositalmente desacoplado da UI: NÃO importa `ItemExecucao`.
 * As páginas/componentes de execução passam os dados já achatados.
 */

import type { SetKind } from '@/types/database.types';

/** Uma série detalhada do item, como carregada do banco (por `setNumber`). */
export interface SerieValores {
  setNumber: number;
  kind: SetKind;
  note: string | null;
  targetReps: string | null;
  restSeconds: number | null;
  targetLoad: number | null;
}

/** Defaults herdados do item pai quando a série não define o campo. */
export interface ItemDefaults {
  reps: string | null;
  restSeconds: number | null;
  cargaAlvo: number | null;
}

/** Valores finais exibidos/usados por uma série após a resolução. */
export interface ValoresResolvidos {
  kind: SetKind;
  note: string | null;
  reps: string | null;
  restSeconds: number | null;
  cargaAlvo: number | null;
}

/**
 * Resolve os valores de uma série: a série explícita (encontrada por
 * `setNumber`) vence campo a campo; campos NULL herdam dos `defaults` do item.
 * Sem série explícita, cai inteiramente nos defaults, com `kind: 'work'` e
 * `note: null` (fallback das fichas legadas).
 */
export function valoresDaSerie(
  series: SerieValores[] | undefined,
  setNumber: number,
  defaults: ItemDefaults
): ValoresResolvidos {
  const serie = series?.find((s) => s.setNumber === setNumber);
  if (!serie) {
    return {
      kind: 'work',
      note: null,
      reps: defaults.reps,
      restSeconds: defaults.restSeconds,
      cargaAlvo: defaults.cargaAlvo,
    };
  }
  return {
    kind: serie.kind,
    note: serie.note,
    reps: serie.targetReps ?? defaults.reps,
    restSeconds: serie.restSeconds ?? defaults.restSeconds,
    cargaAlvo: serie.targetLoad ?? defaults.cargaAlvo,
  };
}
