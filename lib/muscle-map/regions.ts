/**
 * De-para PURO entre os valores de `exercises.muscle_groups` (pt-BR, lista
 * LIVRE porém com 8 sugestões canônicas — ver `schemas/exercicio.ts` e
 * `components/exercices/components/constants/exercise.ts`) e os IDENTIFICADORES
 * de músculo (`slug`) da biblioteca `@mjcdev/react-body-highlighter` (MIT),
 * usada pelo `components/muscle-map`. Sem UI, sem React: totalmente
 * unit-testável (`tests/unit/muscle-map-regions.test.ts`).
 *
 * Investigação da granularidade (seeds + telas): os valores reais usados hoje
 * são AMPLOS — `Peito`, `Costas`, `Pernas`, `Ombros`, `Braços`, `Core`,
 * `Corpo Inteiro`, `Cardio` (confirmados em `supabase/*seed*.sql` e nos rótulos
 * das telas). Como os grupos do Flvxus são amplos e os `slug` da lib são
 * granulares (bíceps, tríceps, quadríceps, etc.), cada grupo amplo é mapeado
 * para o CONJUNTO de músculos correspondentes (ex.: `Braços` → bíceps +
 * tríceps + antebraço). Valores fora do conjunto são normalizados (acentos/
 * caixa) e, se ainda assim não mapearem, são IGNORADOS com segurança (não
 * quebram o render) — um fallback conservador documentado abaixo.
 */

/**
 * Identificadores de músculo aceitos pela lib (`Slug` de
 * `@mjcdev/react-body-highlighter`). Reexportamos como `MuscleRegion` para o
 * de-para falar a mesma língua da lib sem acoplar imports do pacote aqui (este
 * módulo é puro). A lista espelha os `slug` suportados em frente e costas.
 */
export type MuscleRegion =
  | 'trapezius'
  | 'triceps'
  | 'forearm'
  | 'adductors'
  | 'calves'
  | 'deltoids'
  | 'chest'
  | 'biceps'
  | 'abs'
  | 'quadriceps'
  | 'obliques'
  | 'upper-back'
  | 'lower-back'
  | 'hamstring'
  | 'gluteal';

/**
 * Todas as regiões, em ordem estável (útil para "Corpo Inteiro" e testes).
 */
export const ALL_REGIONS: readonly MuscleRegion[] = [
  'trapezius',
  'triceps',
  'forearm',
  'adductors',
  'calves',
  'deltoids',
  'chest',
  'biceps',
  'abs',
  'quadriceps',
  'obliques',
  'upper-back',
  'lower-back',
  'hamstring',
  'gluteal',
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
 * De-para valor-normalizado → músculos (`slug`) acendidos. Cada grupo amplo
 * acende o conjunto de músculos coerente em frente e costas:
 * - `peito` → peitoral;
 * - `costas` → dorsais (superior + lombar) + trapézio;
 * - `pernas` → quadríceps + posterior + glúteos + panturrilha + adutores;
 * - `ombros` → deltoides;
 * - `bracos` → bíceps + tríceps + antebraço;
 * - `core` → abdominais + oblíquos;
 * - `corpo inteiro` → todos os músculos;
 * - `cardio` → nenhum músculo (não é grupo localizado; documentado).
 *
 * `gluteos`, `abdomen` e `panturrilha` são aceitos como extras (aparecem em
 * dicas/rótulos de alguns exercícios).
 */
const DE_PARA: Record<string, readonly MuscleRegion[]> = {
  peito: ['chest'],
  costas: ['upper-back', 'lower-back', 'trapezius'],
  pernas: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors'],
  ombros: ['deltoids'],
  bracos: ['biceps', 'triceps', 'forearm'],
  core: ['abs', 'obliques'],
  'corpo inteiro': ALL_REGIONS,
  cardio: [],
  // Extras tolerados (não são sugestões canônicas, mas aparecem em dados reais).
  gluteos: ['gluteal'],
  abdomen: ['abs', 'obliques'],
  abdominal: ['abs', 'obliques'],
  panturrilha: ['calves'],
};

/**
 * Converte uma lista de grupos musculares (crus, como vêm de
 * `exercises.muscle_groups`) no CONJUNTO de músculos a acender. Normaliza cada
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
 * preservando a ordem recebida e devolve, ex.: "Peito, Ombros, Braços". Quando
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
