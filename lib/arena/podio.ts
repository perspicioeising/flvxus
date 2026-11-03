/**
 * Helpers PUROS de estilo do pódio (top 3) dos rankings da Arena. Só mapeiam a
 * posição (1/2/3) para classes utilitárias de OURO/PRATA/BRONZE — não tocam em
 * ordenação, dados ou lógica de ranking (isso vive nas funções SQL). Posições
 * fora do pódio retornam `null`, e o componente mantém o estilo neutro atual.
 */

export type MetalPodio = 'ouro' | 'prata' | 'bronze';

/** Resolve o metal do pódio para uma posição (1/2/3); `null` fora do top 3. */
export function metalDaPosicao(posicao: number): MetalPodio | null {
  if (posicao === 1) {
    return 'ouro';
  }
  if (posicao === 2) {
    return 'prata';
  }
  if (posicao === 3) {
    return 'bronze';
  }
  return null;
}

/** Classes do ANEL ao redor do avatar na cor do metal (ring + offset do card). */
export function ringMetal(metal: MetalPodio): string {
  switch (metal) {
    case 'ouro':
      return 'ring-2 ring-amber-400 ring-offset-2 ring-offset-card';
    case 'prata':
      return 'ring-2 ring-slate-300 ring-offset-2 ring-offset-card';
    case 'bronze':
      return 'ring-2 ring-orange-400 ring-offset-2 ring-offset-card';
  }
}

/** Classes do BADGE da posição (fundo + texto escuro legível) na cor do metal. */
export function badgeMetal(metal: MetalPodio): string {
  switch (metal) {
    case 'ouro':
      return 'bg-amber-400 text-amber-950';
    case 'prata':
      return 'bg-slate-300 text-slate-900';
    case 'bronze':
      return 'bg-orange-400 text-orange-950';
  }
}

/** Classe de TEXTO (XP dos primeiros) na cor do metal. */
export function textoMetal(metal: MetalPodio): string {
  switch (metal) {
    case 'ouro':
      return 'text-amber-400';
    case 'prata':
      return 'text-slate-300';
    case 'bronze':
      return 'text-orange-400';
  }
}
