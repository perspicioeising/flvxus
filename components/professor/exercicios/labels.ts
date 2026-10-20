import { GRUPOS_MUSCULARES, EQUIPAMENTOS } from '@/schemas/exercicio';

/**
 * Vocabulário compartilhado do domínio de exercícios (grupos musculares e
 * equipamentos). As listas vêm do schema (reaproveitadas da UX v1) e são
 * apenas sugestões — o campo no banco é `text[]` livre.
 */
export { GRUPOS_MUSCULARES, EQUIPAMENTOS };

/** Opções de filtro de grupo muscular (inclui "todos"). */
export const TODOS_GRUPOS = 'all';
/** Opções de filtro de equipamento (inclui "todos"). */
export const TODOS_EQUIPAMENTOS = 'all';
