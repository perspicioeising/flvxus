import { cn } from '@/lib/utils';
import {
  accessibleGroupsLabel,
  regionsForGroups,
  type MuscleRegion,
} from '@/lib/muscle-map/regions';

/*
 * ----------------------------------------------------------------------------
 * PROVENIÊNCIA / LICENÇA
 * ----------------------------------------------------------------------------
 * Padrão visual INSPIRADO no body-map anatômico do projeto open-source openGym
 * (https://github.com/DuarteSantos8/openGym) — figura com vista de FRENTE e
 * COSTAS lado a lado e musculatura detalhada.
 *
 * O openGym é licenciado sob AGPL-3.0 (copyleft de rede). Reutilizar os PATHS
 * SVG deles imporia o copyleft AGPL a todo o Flvxus, o que é incompatível com o
 * licenciamento deste projeto. Por isso NÃO copiamos nenhum asset/`path` do
 * openGym: os caminhos abaixo foram DESENHADOS DO ZERO para o Flvxus, apenas
 * seguindo o mesmo PADRÃO visual (frente + costas, regiões musculares amplas em
 * verde). Nenhum trecho de código/arte do openGym foi reproduzido.
 * ----------------------------------------------------------------------------
 */

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

/**
 * Largura×altura por tamanho. A proporção segue o viewBox 240×200 (figura mais
 * alta/realista que o esquemático anterior). O `sm` mantém proporção para ficar
 * legível no mini-mapa do card mobile.
 */
const DIMENSOES: Record<MuscleMapSize, { largura: number; altura: number }> = {
  sm: { largura: 120, altura: 100 },
  md: { largura: 216, altura: 180 },
};

/**
 * Classe de preenchimento das regiões musculares. Sobre o fundo da página
 * (`onPrimary` falso), ativas usam a primária (emerald do tema) e neutras um
 * cinza neutro; sobre o fundo primário (`onPrimary`), ativas usam
 * `primary-foreground` cheio e neutras uma versão esmaecida dele — mantendo o
 * contraste ativo×neutro em tema claro e escuro.
 */
function fillRegiao(ativa: boolean, onPrimary: boolean): string {
  if (onPrimary) {
    return ativa ? 'fill-primary-foreground' : 'fill-primary-foreground/20';
  }
  return ativa ? 'fill-primary' : 'fill-muted-foreground/20';
}

/**
 * MAPA MUSCULAR (body map) apresentacional, no padrão ANATÔMICO: uma figura
 * humana com vista de FRENTE e COSTAS lado a lado e musculatura detalhada
 * (peitoral, abdômen, deltoides, bíceps/antebraço, quadríceps e panturrilha na
 * frente; trapézio, dorsais, lombar, glúteos, posterior de coxa e panturrilha
 * nas costas). As regiões trabalhadas "acendem" na cor primária/emerald do tema
 * e o restante fica em cinza neutro. Sem fetch: recebe a lista por prop. Tema
 * claro/escuro vem dos tokens (`fill-primary`/`fill-muted-foreground`).
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
        'transition-colors',
        fillRegiao(ativa, onPrimary),
        // Contorno mais forte nas ativas: destaque que não depende só de cor.
        ativa
          ? onPrimary
            ? 'stroke-primary-foreground'
            : 'stroke-primary'
          : 'stroke-transparent'
      ),
      strokeWidth: ativa ? 1.5 : 0,
      strokeLinejoin: 'round' as const,
    };
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
        viewBox="0 0 240 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* ===================== VISTA DE FRENTE ===================== */}
        <g transform="translate(6 8)">
          <SilhuetaFrente />

          {/* Deltoides (ombros) — os dois lados. */}
          <path
            d="M27 46 q-10 0 -13 10 q-1 7 1 12 q7 -2 11 -8 q1 -8 0 -14 Z"
            {...regiao('shoulders')}
          />
          <path
            d="M73 46 q10 0 13 10 q1 7 -1 12 q-7 -2 -11 -8 q-1 -8 0 -14 Z"
            {...regiao('shoulders')}
          />

          {/* Peitoral (duas metades). */}
          <path
            d="M50 47 l-20 2 q-5 5 -4 13 q1 7 7 10 q9 3 17 -1 l0 -24 Z"
            {...regiao('chest')}
          />
          <path
            d="M50 47 l20 2 q5 5 4 13 q-1 7 -7 10 q-9 3 -17 -1 l0 -24 Z"
            {...regiao('chest')}
          />

          {/* Braços frontais (bíceps + antebraço), os dois lados. */}
          <path
            d="M20 68 q-6 12 -7 27 q0 9 3 16 q5 -1 7 -4 q1 -9 3 -18 q2 -11 4 -20 q-4 -4 -10 -1 Z"
            {...regiao('arms')}
          />
          <path
            d="M80 68 q6 12 7 27 q0 9 -3 16 q-5 -1 -7 -4 q-1 -9 -3 -18 q-2 -11 -4 -20 q4 -4 10 -1 Z"
            {...regiao('arms')}
          />

          {/* Core / abdômen (reto abdominal + oblíquos). */}
          <path
            d="M38 73 q12 5 24 0 q1 16 -2 30 q-2 6 -10 6 q-8 0 -10 -6 q-3 -14 -2 -30 Z"
            {...regiao('core')}
          />

          {/* Quadríceps (coxa anterior) + panturrilha frontal, duas pernas. */}
          <path
            d="M37 112 q6 3 12 1 q2 20 0 36 q-1 10 -3 20 q-5 2 -8 -1 q-3 -12 -3 -24 q-1 -17 0 -32 Z"
            {...regiao('quads')}
          />
          <path
            d="M63 112 q-6 3 -12 1 q-2 20 0 36 q1 10 3 20 q5 2 8 -1 q3 -12 3 -24 q1 -17 0 -32 Z"
            {...regiao('quads')}
          />
        </g>

        {/* ===================== VISTA DE COSTAS ===================== */}
        <g transform="translate(126 8)">
          <SilhuetaCostas />

          {/* Deltoides posteriores (ombros). */}
          <path
            d="M27 46 q-10 0 -13 10 q-1 7 1 12 q7 -2 11 -8 q1 -8 0 -14 Z"
            {...regiao('shoulders')}
          />
          <path
            d="M73 46 q10 0 13 10 q1 7 -1 12 q-7 -2 -11 -8 q-1 -8 0 -14 Z"
            {...regiao('shoulders')}
          />

          {/* Trapézio + dorsais (costas superiores). */}
          <path
            d="M50 44 l-18 3 q-6 6 -6 16 q0 10 6 18 q8 5 18 4 l0 -41 Z"
            {...regiao('upperBack')}
          />
          <path
            d="M50 44 l18 3 q6 6 6 16 q0 10 -6 18 q-8 5 -18 4 l0 -41 Z"
            {...regiao('upperBack')}
          />

          {/* Braços posteriores (tríceps + antebraço). */}
          <path
            d="M20 68 q-6 12 -7 27 q0 9 3 16 q5 -1 7 -4 q1 -9 3 -18 q2 -11 4 -20 q-4 -4 -10 -1 Z"
            {...regiao('arms')}
          />
          <path
            d="M80 68 q6 12 7 27 q0 9 -3 16 q-5 -1 -7 -4 q-1 -9 -3 -18 q-2 -11 -4 -20 q4 -4 10 -1 Z"
            {...regiao('arms')}
          />

          {/* Glúteos. */}
          <path
            d="M38 88 q12 6 24 0 q2 8 0 16 q-3 7 -12 7 q-9 0 -12 -7 q-2 -8 0 -16 Z"
            {...regiao('glutes')}
          />

          {/* Posterior de coxa + panturrilha (duas pernas). */}
          <path
            d="M37 113 q6 3 12 1 q2 20 0 35 q-1 11 -3 21 q-5 2 -8 -1 q-3 -12 -3 -24 q-1 -17 0 -32 Z"
            {...regiao('hamstrings')}
          />
          <path
            d="M63 113 q-6 3 -12 1 q-2 20 0 35 q1 11 3 21 q5 2 8 -1 q3 -12 3 -24 q1 -17 0 -32 Z"
            {...regiao('hamstrings')}
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Silhueta neutra da vista de FRENTE (cabeça + contorno do corpo). Desenhada do
 * zero para o Flvxus; dá a "moldura" anatômica sob as regiões musculares.
 */
function SilhuetaFrente() {
  return (
    <g className="fill-muted-foreground/10">
      <circle cx="50" cy="22" r="13" />
      <path
        d="M44 34 q6 3 12 0 q3 1 4 6
           q14 3 20 18 q3 10 1 20 q-3 2 -6 1
           q-4 15 -6 30 q7 1 10 6 q3 22 1 44 q-1 11 -4 21 q-6 2 -10 -1 q-3 -18 -4 -37
           q-2 12 -4 24 q-1 11 -4 20 q-6 2 -10 -1 q-3 -22 -1 -44 q1 -14 4 -27
           q-3 1 -6 -1 q-2 -10 1 -20 q6 -15 20 -18 q1 -5 4 -6 Z"
      />
    </g>
  );
}

/**
 * Silhueta neutra da vista de COSTAS (espelha a de frente para manter a
 * proporção/simetria). Desenhada do zero para o Flvxus.
 */
function SilhuetaCostas() {
  return (
    <g className="fill-muted-foreground/10">
      <circle cx="50" cy="22" r="13" />
      <path
        d="M44 34 q6 3 12 0 q3 1 4 6
           q14 3 20 18 q3 10 1 20 q-3 2 -6 1
           q-4 15 -6 30 q7 1 10 6 q3 22 1 44 q-1 11 -4 21 q-6 2 -10 -1 q-3 -18 -4 -37
           q-2 12 -4 24 q-1 11 -4 20 q-6 2 -10 -1 q-3 -22 -1 -44 q1 -14 4 -27
           q-3 1 -6 -1 q-2 -10 1 -20 q6 -15 20 -18 q1 -5 4 -6 Z"
      />
    </g>
  );
}
