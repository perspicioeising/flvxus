/**
 * De-para PURO entre os valores de `exercises.muscle_groups` (pt-BR, lista
 * LIVRE porém com 8 sugestões canônicas — ver `schemas/exercicio.ts` e
 * `components/exercices/components/constants/exercise.ts`) e as REGIÕES do SVG
 * do mapa muscular (`components/muscle-map`). Sem UI, sem React: totalmente
 * unit-testável (`tests/unit/muscle-map-regions.test.ts`).
 *
 * Investigação da granularidade (seeds + telas): os valores reais usados hoje
 * são AMPLOS — `Peito`, `Costas`, `Pernas`, `Ombros`, `Braços`, `Core`,
 * `Corpo Inteiro`, `Cardio` (confirmados em `supabase/*seed*.sql` e nos rótulos
 * das telas). Por isso o boneco acende regiões amplas; não há necessidade de
 * precisão anatômica fina. Valores fora do conjunto são normalizados (acentos/
 * caixa) e, se ainda assim não mapearem, são IGNORADOS com segurança (não
 * quebram o render) — um fallback conservador documentado abaixo.
 */

/**
 * Regiões anatômicas acendíveis do boneco. Nomeadas por grupo visual amplo,
 * cobrindo frente e costas. `Cardio` e valores desconhecidos NÃO acendem região
 * (ver de-para): o boneco segue coerente, apenas sem destaque extra.
 */
export type MuscleRegion =
  | 'chest' // peito (frente)
  | 'shoulders' // ombros/deltoides (frente + costas)
  | 'arms' // braços: bíceps/tríceps/antebraço (frente + costas)
  | 'core' // abdômen/core (frente)
  | 'quads' // coxa anterior (frente)
  | 'upperBack' // dorsais/costas superiores (costas)
  | 'glutes' // glúteos (costas)
  | 'hamstrings'; // posterior de coxa + panturrilha (costas)

/** Todas as regiões, em ordem estável (útil para "Corpo Inteiro" e testes). */
export const ALL_REGIONS: readonly MuscleRegion[] = [
  'chest',
  'shoulders',
  'arms',
  'core',
  'quads',
  'upperBack',
  'glutes',
  'hamstrings',
] as const;

/**
 * Normaliza um rótulo de grupo muscular para a chave do de-para: remove acentos
 * (NFD + strip de diacríticos), baixa a caixa e colapsa espaços nas bordas.
 * Ex.: `'  Braços '` → `'bracos'`, `'CORPO INTEIRO'` → `'corpo inteiro'`.
 */
export function normalizeGroup(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * De-para valor-normalizado → regiões acendidas. Cada grupo amplo acende as
 * regiões coerentes em frente e costas:
 * - `peito` → peito;
 * - `costas` → dorsais;
 * - `pernas` → quadríceps (frente) + posterior/panturrilha (costas);
 * - `ombros` → deltoides;
 * - `bracos` → braços;
 * - `core` → abdômen;
 * - `corpo inteiro` → todas as regiões;
 * - `cardio` → nenhuma região (não é grupo muscular localizado; documentado).
 *
 * `gluteos` é aceito como extra (aparece em dicas/rótulos de alguns exercícios).
 */
const DE_PARA: Record<string, readonly MuscleRegion[]> = {
  peito: ['chest'],
  costas: ['upperBack'],
  pernas: ['quads', 'hamstrings', 'glutes'],
  ombros: ['shoulders'],
  bracos: ['arms'],
  core: ['core'],
  'corpo inteiro': ALL_REGIONS,
  cardio: [],
  // Extras tolerados (não são sugestões canônicas, mas aparecem em dados reais).
  gluteos: ['glutes'],
  abdomen: ['core'],
  abdominal: ['core'],
};

/**
 * Converte uma lista de grupos musculares (crus, como vêm de
 * `exercises.muscle_groups`) no CONJUNTO de regiões a acender. Normaliza cada
 * valor, resolve pelo de-para e ignora com segurança o que não mapear (fallback
 * conservador: não quebra, apenas não acende). Resultado deduplicado, em ordem
 * estável (`ALL_REGIONS`).
 */
export function regionsForGroups(grupos: readonly string[]): Set<MuscleRegion> {
  const ativadas = new Set<MuscleRegion>();
  for (const grupo of grupos) {
    if (typeof grupo !== 'string') continue;
    const regioes = DE_PARA[normalizeGroup(grupo)];
    if (!regioes) continue; // fallback seguro: valor desconhecido → ignora
    for (const r of regioes) ativadas.add(r);
  }
  return ativadas;
}

/**
 * Rótulo acessível (pt-BR) dos grupos trabalhados, para `aria-label`. Deduplica
 * preservando a ordem recebida e devolve, ex.: "peito, ombros, tríceps". Quando
 * vazio, devolve `null` (o chamador decide o texto neutro).
 */
export function accessibleGroupsLabel(grupos: readonly string[]): string | null {
  const vistos = new Set<string>();
  const limpos: string[] = [];
  for (const grupo of grupos) {
    if (typeof grupo !== 'string') continue;
    const t = grupo.trim();
    if (t.length === 0) continue;
    const chave = normalizeGroup(t);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    limpos.push(t);
  }
  if (limpos.length === 0) return null;
  return limpos.join(', ');
}
