/**
 * Níveis permanentes da Arena derivados do XP acumulado. Função PURA (sem I/O)
 * — testável em `tests/unit/arena-niveis.test.ts`.
 *
 * Espelha fielmente a função SQL `gamification_level_for_xp(int)`: mesma tabela
 * de limiares `0/500/1500/3000/6000/12000` (níveis 0..5). O nível é permanente
 * (nunca regride): depende só do `total_xp` acumulado (soma de todos os eventos).
 */

import type { ArenaLevel } from '@/types/database.types';

/** Limiares de XP (início) de cada nível, índice = número do nível (0..5). */
const LIMIARES: readonly number[] = [0, 500, 1500, 3000, 6000, 12000];

/** Rótulos de cada nível, índice = número do nível (0..5). */
const ROTULOS: readonly string[] = [
  'Iniciante',
  'Aprendiz',
  'Dedicado',
  'Atleta',
  'Elite',
  'Lenda',
];

/** Progresso de nível resolvido a partir do XP acumulado (RF3.3). */
export interface NivelArena {
  /** Número do nível atual (0..5). */
  nivel: ArenaLevel;
  /** Rótulo do nível atual (ex.: "Dedicado"). */
  rotulo: string;
  /** XP acumulado recebido (clamp em 0 para entradas negativas). */
  xp: number;
  /** XP (início) do nível atual. */
  xpInicioNivel: number;
  /**
   * XP (início) do próximo nível, ou `null` quando já está no nível máximo.
   */
  xpProximoNivel: number | null;
  /**
   * XP que ainda falta para alcançar o próximo nível, ou `0` quando já está no
   * nível máximo.
   */
  xpParaProximo: number;
  /** Rótulo do próximo nível, ou `null` quando já está no nível máximo. */
  rotuloProximo: string | null;
}

/**
 * Resolve o nível atual e o progresso para o próximo a partir do XP acumulado.
 * XP negativo é tratado como 0. Usa a MESMA tabela de limiares do SQL.
 */
export function nivelPorXp(xp: number): NivelArena {
  const xpSeguro = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;

  let nivel = 0;
  for (let i = LIMIARES.length - 1; i >= 0; i -= 1) {
    if (xpSeguro >= LIMIARES[i]) {
      nivel = i;
      break;
    }
  }

  const nivelMaximo = LIMIARES.length - 1;
  const ehMaximo = nivel >= nivelMaximo;
  const xpProximoNivel = ehMaximo ? null : LIMIARES[nivel + 1];

  return {
    nivel: nivel as ArenaLevel,
    rotulo: ROTULOS[nivel],
    xp: xpSeguro,
    xpInicioNivel: LIMIARES[nivel],
    xpProximoNivel,
    xpParaProximo: xpProximoNivel === null ? 0 : xpProximoNivel - xpSeguro,
    rotuloProximo: ehMaximo ? null : ROTULOS[nivel + 1],
  };
}
