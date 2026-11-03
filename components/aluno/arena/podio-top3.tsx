import { Crown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  badgeMetal,
  metalDaPosicao,
  ringMetal,
  textoMetal,
  type MetalPodio,
} from '@/lib/arena/podio';

/** Uma linha normalizada do pódio (shape comum aos rankings da Arena). */
export interface PodioEntrada {
  /** Posição no ranking (espera-se 1, 2 ou 3 aqui). */
  posicao: number;
  /** `user_id`, para marcar a linha do próprio usuário. */
  user_id: string;
  /** Nome exibido (já resolvido pela função SQL). */
  nome: string;
  /** XP do período/temporada. */
  xp: number;
  /** URL do avatar (foto), ou `null`/`undefined` para cair no fallback. */
  avatarUrl?: string | null;
}

export interface PodioTop3Props {
  /** Top 3 do ranking (até 3 entradas). Ordem de posição é resolvida aqui. */
  entradas: PodioEntrada[];
  /** `user_id` do próprio aluno, para destacar quem é você no pódio. */
  meuUserId: string;
}

/** Formata um XP com separador de milhar pt-BR. */
function formatarXp(xp: number): string {
  return new Intl.NumberFormat('pt-BR').format(xp);
}

/** Inicial do nome exibido, para o fallback do avatar. */
function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || 'A';
}

/** Tamanhos (ø do avatar e do badge) por metal: #1 maior que #2/#3. */
function dimensoes(metal: MetalPodio): {
  avatar: string;
  badge: string;
  elevar: string;
} {
  if (metal === 'ouro') {
    // #1: avatar ~ø60px, elevado acima dos outros dois.
    return { avatar: 'h-[60px] w-[60px]', badge: 'h-6 w-6 text-sm', elevar: '-mt-4' };
  }
  // #2/#3: avatar ~ø48px, na linha de base.
  return { avatar: 'h-12 w-12', badge: 'h-5 w-5 text-xs', elevar: '' };
}

/**
 * Coluna de um competidor no pódio (avatar com anel metálico, coroa no #1,
 * badge da posição, nome e XP na cor do metal). O #1 (ouro) é maior e elevado.
 */
function ColunaPodio({
  entrada,
  metal,
  ehEu,
}: {
  entrada: PodioEntrada;
  metal: MetalPodio;
  ehEu: boolean;
}) {
  const { avatar, badge, elevar } = dimensoes(metal);
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col items-center', elevar)}>
      <div className="relative shrink-0">
        {metal === 'ouro' ? (
          <Crown
            className="absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2 text-amber-400"
            aria-label="Primeiro lugar"
          />
        ) : null}
        <Avatar className={cn(avatar, ringMetal(metal))}>
          <AvatarImage src={entrada.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="text-sm font-bold">
            {inicial(entrada.nome)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute -right-1 -top-1 flex items-center justify-center rounded-full font-bold tabular-nums ring-2 ring-card',
            badge,
            badgeMetal(metal)
          )}
        >
          {entrada.posicao}
        </span>
      </div>
      <p className="mt-2 w-full truncate text-center text-sm font-semibold text-foreground">
        {entrada.nome}
        {ehEu ? (
          <span className="ml-1 text-xs font-medium text-primary">você</span>
        ) : null}
      </p>
      <p className={cn('text-sm font-bold tabular-nums', textoMetal(metal))}>
        {formatarXp(entrada.xp)} XP
      </p>
    </div>
  );
}

/**
 * Pódio (top 3) dos rankings da Arena, fiel ao mock SVG aprovado: um CARD
 * ÚNICO escuro com os três primeiros em layout horizontal 2-1-3 — #2 à
 * esquerda (prata), #1 ao centro (ouro) maior e elevado com coroa, #3 à direita
 * (bronze). Cada avatar usa a foto (`avatarUrl`) com inicial no fallback, anel
 * na cor do metal e badge circular da posição; o XP vem na cor do metal.
 *
 * Compartilhado entre os leaderboards (global/amigos e tenant) para garantir
 * layout idêntico. Puramente apresentacional (RSC-safe): não ordena nem calcula
 * nada — recebe as entradas já ordenadas pela função SQL e só mapeia posição
 * para estilo via `lib/arena/podio`. Da 4ª posição em diante, cada leaderboard
 * renderiza sua lista neutra.
 */
export function PodioTop3({ entradas, meuUserId }: PodioTop3Props) {
  // Indexa por posição para montar a ordem visual 2-1-3 sem depender da ordem
  // do array (que já vem ordenado por posição, mas montamos explícito).
  const porPosicao = new Map<number, PodioEntrada>();
  for (const e of entradas) {
    porPosicao.set(e.posicao, e);
  }
  const primeiro = porPosicao.get(1);
  const segundo = porPosicao.get(2);
  const terceiro = porPosicao.get(3);

  // Sem o #1 não há pódio coerente — deixa o leaderboard cair na lista neutra.
  if (!primeiro) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-card/60 px-3 pb-3 pt-6">
      <div className="flex items-end justify-center gap-2">
        {segundo ? (
          <ColunaPodio
            entrada={segundo}
            metal="prata"
            ehEu={segundo.user_id === meuUserId}
          />
        ) : (
          <div className="min-w-0 flex-1" aria-hidden="true" />
        )}

        <ColunaPodio
          entrada={primeiro}
          metal="ouro"
          ehEu={primeiro.user_id === meuUserId}
        />

        {terceiro ? (
          <ColunaPodio
            entrada={terceiro}
            metal="bronze"
            ehEu={terceiro.user_id === meuUserId}
          />
        ) : (
          <div className="min-w-0 flex-1" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

/** Reexporta o helper de metal para quem precisa saber se uma posição é pódio. */
export { metalDaPosicao };
