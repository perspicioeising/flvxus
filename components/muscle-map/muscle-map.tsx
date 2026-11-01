'use client';

import dynamic from 'next/dynamic';

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
 * O boneco anatômico (frente + costas, musculatura detalhada) é renderizado
 * pela biblioteca `@mjcdev/react-body-highlighter` (MIT) — um port para React
 * dos SVGs anatômicos do `react-native-body-highlighter` de HichamELBSI (MIT).
 * Licença MIT é PERMISSIVA e compatível com o licenciamento proprietário do
 * Flvxus. A atribuição exigida pela MIT está registrada em `NOTICE`.
 *
 * A lib detecta tema claro/escuro só via `prefers-color-scheme` em tempo de
 * carga e usa `window.matchMedia` (sem SSR). Por isso o componente é
 * `'use client'` e a lib entra por `dynamic(..., { ssr: false })`. As cores
 * ATIVAS (emerald do tema) e o CONTORNO vêm por prop como `hsl(var(--token))`,
 * resolvidos pelo CSS do Flvxus — então acompanham tema claro/escuro sem
 * depender da detecção interna da lib. Os músculos inativos ficam no cinza
 * neutro padrão da lib, legível em ambos os temas.
 * ----------------------------------------------------------------------------
 */

/**
 * `Body` só roda no cliente (usa `window.matchMedia`). `ssr: false` evita
 * mismatch de hidratação no App Router e mantém o boneco fora do bundle do
 * servidor.
 */
const Body = dynamic(() => import('@mjcdev/react-body-highlighter'), {
  ssr: false,
});

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
   * próximo treino): os músculos ativos usam `primary-foreground` (contraste
   * forte sobre o emerald). Default `false` (sobre o fundo da página, ativos
   * usam `primary`/emerald).
   */
  onPrimary?: boolean;
}

/**
 * Escala da lib por tamanho. O boneco base é ~200×400 por vista (`scale: 1`);
 * ajustamos para caber no mini-mapa do card mobile (`sm`, só frente) e no
 * resumo/ficha (`md`, frente + costas lado a lado).
 */
const ESCALA: Record<MuscleMapSize, number> = {
  sm: 0.28,
  md: 0.42,
};

/**
 * Converte o conjunto de regiões ativas no formato `data` que a lib espera:
 * cada músculo com `intensity: 1`. A cor vem do array `colors` (ver abaixo),
 * não da intensidade — todos os ativos usam a mesma cor do tema.
 */
function toBodyData(ativas: Set<MuscleRegion>) {
  return [...ativas].map((slug) => ({ slug, intensity: 1 }) as const);
}

/**
 * MAPA MUSCULAR (body map) apresentacional, ANATÔMICO: renderiza o boneco da
 * lib `@mjcdev/react-body-highlighter` com os músculos trabalhados em
 * VERDE/emerald do tema e o restante em cinza neutro. No `md` mostra FRENTE e
 * COSTAS lado a lado (resumo pós-treino e montagem de ficha); no `sm` mostra só
 * a FRENTE, que fica legível no mini-mapa do card mobile. Sem fetch: recebe a
 * lista de grupos por prop.
 *
 * Acessibilidade: `role="img"` + `aria-label` descrevendo os grupos
 * trabalhados (ex.: "Músculos trabalhados: Peito, Ombros, Braços"). O SVG da
 * lib fica `aria-hidden` (decorativo); a informação não depende só de cor
 * porque o rótulo textual carrega os grupos.
 *
 * Tema claro/escuro: a cor ativa e o contorno vêm como `hsl(var(--token))`,
 * resolvidos pelo CSS do app, então acompanham o tema automaticamente.
 */
export function MuscleMap({
  grupos,
  size = 'md',
  className,
  rotuloVazio = 'Nenhum músculo destacado',
  onPrimary = false,
}: MuscleMapProps) {
  const ativas = regionsForGroups(grupos);
  const data = toBodyData(ativas);

  const descricao = accessibleGroupsLabel(grupos);
  const aria = descricao ? `Músculos trabalhados: ${descricao}` : rotuloVazio;

  // Cor ativa: emerald do tema (`primary`) ou `primary-foreground` quando o
  // boneco está sobre o fundo primário. A lib tem um off-by-one ao ler
  // `colors[intensity]` em alguns paths, então repetimos a mesma cor nos dois
  // índices para garantir o verde em qualquer caso.
  const corAtiva = onPrimary
    ? 'hsl(var(--primary-foreground))'
    : 'hsl(var(--primary))';
  const colors = [corAtiva, corAtiva];

  // Contorno neutro do boneco (silhueta). Sobre o fundo primário usamos uma
  // versão esmaecida do `primary-foreground`; sobre a página, o cinza neutro.
  const border = onPrimary
    ? 'hsl(var(--primary-foreground) / 0.35)'
    : 'hsl(var(--muted-foreground) / 0.35)';

  const scale = ESCALA[size];

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="img"
      aria-label={aria}
      data-testid="muscle-map"
      data-active-regions={[...ativas].join(' ')}
    >
      {/* Frente: sempre presente (único no `sm`). */}
      <div aria-hidden="true" className="inline-flex">
        <Body
          data={data}
          side="front"
          gender="male"
          scale={scale}
          colors={colors}
          border={border}
        />
      </div>
      {/* Costas: só no `md` (resumo/ficha), ao lado da frente. */}
      {size === 'md' ? (
        <div aria-hidden="true" className="inline-flex">
          <Body
            data={data}
            side="back"
            gender="male"
            scale={scale}
            colors={colors}
            border={border}
          />
        </div>
      ) : null}
    </div>
  );
}
