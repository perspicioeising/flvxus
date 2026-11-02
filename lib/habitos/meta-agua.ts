/**
 * Meta de hidratação — funções PURAS (sem I/O), testáveis em
 * `tests/unit/habitos-meta-agua.test.ts`.
 *
 * `META_AGUA_DEFAULT_ML` espelha o literal SQL usado em
 * `gamification_sync_water_goal` (migration 20261027090100): quando o aluno não
 * tem linha em `water_goals`, a concessão de XP usa 2000 ml como alvo. Mantê-los
 * iguais é parte do contrato — se um mudar, o outro deve mudar junto.
 */

/** Alvo padrão de hidratação (ml) quando não há meta definida nem peso. */
export const META_AGUA_DEFAULT_ML = 2000;

/** Limites de meta aceitos pelo banco (`water_goals.target_ml` CHECK 250..20000). */
const META_MIN_ML = 250;
const META_MAX_ML = 20000;

/** Ml por kg de peso na heurística de meta sugerida (35 ml/kg). */
const ML_POR_KG = 35;

/** Prende `valor` ao intervalo `[min, max]`. */
function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

/**
 * Meta de água sugerida (ml) a partir do peso. Com peso, usa a heurística
 * 35 ml/kg arredondada, presa aos limites do banco (250..20000). Sem peso
 * (`null`/`0`/`NaN`), devolve `defaultMl` (por padrão `META_AGUA_DEFAULT_ML`).
 */
export function metaSugeridaMl(
  pesoKg: number | null,
  defaultMl = META_AGUA_DEFAULT_ML
): number {
  if (!pesoKg || Number.isNaN(pesoKg) || pesoKg <= 0) {
    return defaultMl;
  }
  return clamp(Math.round(pesoKg * ML_POR_KG), META_MIN_ML, META_MAX_ML);
}
