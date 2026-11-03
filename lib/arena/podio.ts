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

/**
 * Classes do ANEL ao redor do avatar na cor do metal (ring + offset do card).
 * Cores escolhidas para alto contraste sobre `bg-card` escuro (~#111): ouro
 * âmbar vivo, prata bem clara (slate-200) e bronze laranja-terroso saturado
 * (amber-600) — distintos entre si. Um leve glow (`shadow`) reforça a prata e o
 * bronze, que tendiam a sumir no escuro.
 */
export function ringMetal(metal: MetalPodio): string {
  switch (metal) {
    case 'ouro':
      return 'ring-2 ring-amber-400 ring-offset-2 ring-offset-card shadow-[0_0_0_1px_rgba(251,191,36,0.35)]';
    case 'prata':
      return 'ring-2 ring-slate-200 ring-offset-2 ring-offset-card shadow-[0_0_8px_1px_rgba(226,232,240,0.35)]';
    case 'bronze':
      return 'ring-2 ring-amber-600 ring-offset-2 ring-offset-card shadow-[0_0_8px_1px_rgba(217,119,6,0.4)]';
  }
}

/** Classes do BADGE da posição (fundo + texto escuro legível) na cor do metal. */
export function badgeMetal(metal: MetalPodio): string {
  switch (metal) {
    case 'ouro':
      return 'bg-amber-400 text-amber-950';
    case 'prata':
      return 'bg-slate-200 text-slate-900';
    case 'bronze':
      return 'bg-amber-600 text-amber-950';
  }
}

/** Classe de TEXTO (XP dos primeiros) na cor do metal, legível no escuro. */
export function textoMetal(metal: MetalPodio): string {
  switch (metal) {
    case 'ouro':
      return 'text-amber-400';
    case 'prata':
      return 'text-slate-200';
    case 'bronze':
      return 'text-amber-500';
  }
}
