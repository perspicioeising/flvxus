import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { StatusBadge } from '@/components/patterns';

/** Dados de uma divisão da ficha ativa para o card da lista de treinos. */
export interface DivisaoResumoCardProps {
  /** Letra/rótulo da divisão (ex.: 'A'); `null` oculta o chip. */
  letra: string | null;
  /** Nome do treino derivado dos grupos; vazio aplica placeholder. */
  nome: string;
  /** Grupos musculares da divisão; vazio aplica placeholder. */
  grupos: string[];
  /** Quando `true`, exibe o selo "Próximo" (primeira divisão). */
  proximo: boolean;
  /** Destino do link (detalhe da ficha). */
  href: string;
}

/**
 * Card de uma divisão da ficha ativa na lista de treinos do aluno: chip grande
 * com a letra à esquerda (omitido quando `letra` é null), nome do treino e
 * grupos musculares ao centro, selo "Próximo" na primeira divisão e seta à
 * direita. Todo o card é um link para o detalhe. Mobile-first: alvos ≥ 44px.
 */
export function DivisaoResumoCard({
  letra,
  nome,
  grupos,
  proximo,
  href,
}: DivisaoResumoCardProps) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {letra !== null ? (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-3xl font-black text-primary-soft-foreground">
          {letra}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-bold text-foreground">
            {nome || '[Nome do treino]'}
          </p>
          {proximo ? <StatusBadge tone="brand">Próximo</StatusBadge> : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {grupos.length > 0 ? grupos.join(' · ') : '[Grupos musculares]'}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
