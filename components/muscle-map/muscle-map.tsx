import { cn } from '@/lib/utils';
import {
  accessibleGroupsLabel,
  regionsForGroups,
  type MuscleRegion,
} from '@/lib/muscle-map/regions';

/** Tamanhos do boneco: `sm` para cards compactos, `md` para resumos. */
export type MuscleMapSize = 'sm' | 'md';

export interface MuscleMapProps {
  /**
   * Grupos musculares trabalhados (cru, como em `exercises.muscle_groups`).
   * O de-para (`lib/muscle-map/regions`) normaliza acentos/caixa e ignora com
   * segurança valores não mapeados. Vazio = boneco todo neutro.
   */
  grupos: readonly string[];
  /** Tamanho visual. Default `md`. */
  size?: MuscleMapSize;
  /** Classe extra no wrapper. */
  className?: string;
  /**
   * Texto neutro usado no `aria-label` quando não há grupos (ex.: 'descanso').
   * Default: "Nenhum músculo destacado".
   */
  rotuloVazio?: string;
  /**
   * Quando `true`, pinta sobre um fundo da cor PRIMÁRIA (ex.: o cartão de
   * próximo treino): regiões ativas usam `primary-foreground` (contraste forte)
   * e as neutras uma versão esmaecida dele. Default `false` (sobre o fundo da
   * página, usa `primary`/`muted`).
   */
  onPrimary?: boolean;
}

/** Largura×altura por tamanho (mantém a proporção do viewBox 220×140). */
const DIMENSOES: Record<MuscleMapSize, { largura: number; altura: number }> = {
  sm: { largura: 132, altura: 84 },
  md: { largura: 220, altura: 140 },
};

/**
 * Classe de preenchimento das regiões. Sobre o fundo da página (`onPrimary`
 * falso), ativas usam a primária e neutras o muted. Sobre o fundo primário
 * (`onPrimary`), ativas usam `primary-foreground` cheio e neutras uma versão
 * esmaecida dele — mantendo o contraste ativo×neutro em ambos os temas.
 */
function fillRegiao(ativa: boolean, onPrimary: boolean): string {
  if (onPrimary) {
    return ativa
      ? 'fill-primary-foreground'
      : 'fill-primary-foreground/25';
  }
  return ativa ? 'fill-primary' : 'fill-muted-foreground/25';
}

/**
 * MAPA MUSCULAR (body map) apresentacional. Desenha um boneco em SVG com vista
 * de FRENTE e COSTAS; as regiões musculares "acendem" (cor primária/emerald do
 * tema) conforme `grupos`, e as demais ficam em tom neutro. Sem fetch: recebe a
 * lista por prop. Tema claro/escuro vem dos tokens (`fill-primary`/`fill-muted`).
 *
 * Acessibilidade: `role="img"` + `aria-label` descrevendo os grupos
 * trabalhados (ex.: "Músculos trabalhados: peito, ombros, braços"); o destaque
 * nunca depende só de cor — as regiões ativas também recebem contorno mais
 * forte (`stroke` da primária) além do preenchimento.
 *
 * As regiões são amplas de propósito: os dados reais de `muscle_groups` são
 * amplos (Peito/Costas/Pernas/Ombros/Braços/Core), então regiões grandes já
 * entregam o valor sem exigir precisão anatômica fina.
 */
export function MuscleMap({
  grupos,
  size = 'md',
  className,
  rotuloVazio = 'Nenhum músculo destacado',
  onPrimary = false,
}: MuscleMapProps) {
  const ativas = regionsForGroups(grupos);
  const ehAtiva = (r: MuscleRegion) => ativas.has(r);

  /** Props comuns de cada região: preenchimento + contorno (não só cor). */
  const regiao = (r: MuscleRegion) => {
    const ativa = ehAtiva(r);
    return {
      'data-region': r,
      'data-active': ativa ? 'true' : 'false',
      className: cn(
        fillRegiao(ativa, onPrimary),
        // Contorno mais forte nas ativas: destaque que não depende só de cor.
        ativa
          ? onPrimary
            ? 'stroke-primary-foreground'
            : 'stroke-primary'
          : 'stroke-transparent'
      ),
      strokeWidth: ativa ? 1.25 : 0,
    } as const;
  };

  const descricao = accessibleGroupsLabel(grupos);
  const aria = descricao ? `Músculos trabalhados: ${descricao}` : rotuloVazio;

  const { largura, altura } = DIMENSOES[size];

  return (
    <div
      className={cn('inline-flex', className)}
      role="img"
      aria-label={aria}
      data-testid="muscle-map"
      data-active-regions={[...ativas].join(' ')}
    >
      <svg
        width={largura}
        height={altura}
        viewBox="0 0 220 140"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* ===================== VISTA DE FRENTE ===================== */}
        <g transform="translate(0 0)">
          {/* Silhueta base (cabeça + tronco + membros) em neutro. */}
          <SilhuetaFrente />

          {/* Ombros. */}
          <path
            d="M34 42 q-6 2 -8 10 q7 1 12 -2 q-1 -5 -4 -8 Z M66 42 q6 2 8 10 q-7 1 -12 -2 q1 -5 4 -8 Z"
            {...regiao('shoulders')}
          />
          {/* Peito. */}
          <path
            d="M38 45 q12 -5 24 0 q1 10 -3 16 q-9 4 -18 0 q-4 -6 -3 -16 Z"
            {...regiao('chest')}
          />
          {/* Braços (frente: bíceps/antebraço, os dois lados). */}
          <path
            d="M26 52 q-5 14 -4 30 q5 1 8 -1 q2 -15 4 -27 q-4 -3 -8 -2 Z M74 52 q5 14 4 30 q-5 1 -8 -1 q-2 -15 -4 -27 q4 -3 8 -2 Z"
            {...regiao('arms')}
          />
          {/* Core / abdômen. */}
          <path
            d="M41 62 q9 4 18 0 q0 14 -3 22 q-6 3 -12 0 q-3 -8 -3 -22 Z"
            {...regiao('core')}
          />
          {/* Quadríceps (frente das coxas). */}
          <path
            d="M40 86 q8 3 20 0 q1 18 -2 32 q-5 2 -8 0 l-0 -22 l-0 22 q-3 2 -8 0 q-3 -14 -2 -32 Z"
            {...regiao('quads')}
          />
        </g>

        {/* ===================== VISTA DE COSTAS ===================== */}
        <g transform="translate(120 0)">
          <SilhuetaCostas />

          {/* Ombros (costas). */}
          <path
            d="M34 42 q-6 2 -8 10 q7 1 12 -2 q-1 -5 -4 -8 Z M66 42 q6 2 8 10 q-7 1 -12 -2 q1 -5 4 -8 Z"
            {...regiao('shoulders')}
          />
          {/* Costas superiores / dorsais. */}
          <path
            d="M38 45 q12 -5 24 0 q2 14 -2 24 q-10 4 -20 0 q-4 -10 -2 -24 Z"
            {...regiao('upperBack')}
          />
          {/* Braços (costas: tríceps). */}
          <path
            d="M26 52 q-5 14 -4 30 q5 1 8 -1 q2 -15 4 -27 q-4 -3 -8 -2 Z M74 52 q5 14 4 30 q-5 1 -8 -1 q-2 -15 -4 -27 q4 -3 8 -2 Z"
            {...regiao('arms')}
          />
          {/* Glúteos. */}
          <path
            d="M40 70 q10 5 20 0 q1 9 -2 14 q-8 4 -16 0 q-3 -5 -2 -14 Z"
            {...regiao('glutes')}
          />
          {/* Posterior de coxa + panturrilha. */}
          <path
            d="M40 86 q8 3 20 0 q1 18 -2 32 q-5 2 -8 0 l-0 -22 l-0 22 q-3 2 -8 0 q-3 -14 -2 -32 Z"
            {...regiao('hamstrings')}
          />
        </g>
      </svg>
    </div>
  );
}

/** Silhueta neutra da vista de frente (cabeça + contorno do corpo). */
function SilhuetaFrente() {
  return (
    <g className="fill-muted-foreground/10">
      <circle cx="50" cy="26" r="9" />
      <path d="M38 36 q12 -4 24 0 q10 4 12 20 q-2 26 -6 48 q-2 18 -6 32 q-6 2 -12 0 q-4 -14 -6 -32 q-4 -22 -6 -48 q2 -16 12 -20 Z" />
    </g>
  );
}

/** Silhueta neutra da vista de costas (igual à de frente, por simetria). */
function SilhuetaCostas() {
  return (
    <g className="fill-muted-foreground/10">
      <circle cx="50" cy="26" r="9" />
      <path d="M38 36 q12 -4 24 0 q10 4 12 20 q-2 26 -6 48 q-2 18 -6 32 q-6 2 -12 0 q-4 -14 -6 -32 q-4 -22 -6 -48 q2 -16 12 -20 Z" />
    </g>
  );
}
