import { Sparkles, Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NivelArena } from '@/lib/arena/niveis';

export interface CartaoNivelProps {
  nivel: NivelArena;
}

/** Formata um número de XP com separador de milhar pt-BR. */
function formatarXp(xp: number): string {
  return new Intl.NumberFormat('pt-BR').format(xp);
}

// Geometria do anel de progresso (SVG). Raio e perímetro fixos; o preenchimento
// vem do `stroke-dashoffset` proporcional ao percentual.
const RAIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/**
 * Cartão de nível da Arena (OPÇÃO A — escuro premium, verde como acento): fundo
 * escuro com borda sutil e um ANEL DE PROGRESSO circular (o verde da marca
 * aparece no anel, não como preenchimento do cartão). No centro do anel fica o
 * número do nível; ao lado, o rótulo, o XP acumulado em destaque e o texto
 * "Faltam X XP para [próximo nível]". No nível máximo (Lenda) o anel fica
 * completo e o cartão mostra o estado concluído. Puramente apresentacional
 * (RSC-safe), mobile-first.
 */
export function CartaoNivel({ nivel }: CartaoNivelProps) {
  const ehMaximo = nivel.xpProximoNivel === null;

  // Progresso dentro da faixa do nível atual (0..100).
  const faixa = ehMaximo
    ? 0
    : (nivel.xpProximoNivel as number) - nivel.xpInicioNivel;
  const avanco = nivel.xp - nivel.xpInicioNivel;
  const percentual = ehMaximo
    ? 100
    : faixa > 0
      ? Math.min(100, Math.max(0, Math.round((avanco / faixa) * 100)))
      : 0;

  const offset = CIRCUNFERENCIA * (1 - percentual / 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-app-medium">
      {/* Brilho sutil de acento no canto, sem pintar o bloco inteiro de verde. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex items-center gap-5">
        {/* Anel de progresso com o número do nível no centro. */}
        <div className="relative shrink-0">
          <svg
            width="128"
            height="128"
            viewBox="0 0 128 128"
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="64"
              cy="64"
              r={RAIO}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <circle
              cx="64"
              cy="64"
              r={RAIO}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[0.625rem] font-bold uppercase tracking-widest text-muted-foreground">
              Nível
            </span>
            <span className="text-4xl font-black leading-none text-foreground tabular-nums">
              {nivel.nivel}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            {ehMaximo ? (
              <Trophy className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {nivel.rotulo}
          </p>
          <p className="mt-1 text-3xl font-black leading-none text-foreground md:text-4xl">
            {formatarXp(nivel.xp)}
            <span className="ml-1.5 text-base font-bold text-muted-foreground">
              XP
            </span>
          </p>
          <p
            className={cn(
              'mt-2 text-sm',
              ehMaximo ? 'font-semibold text-primary' : 'text-muted-foreground'
            )}
          >
            {ehMaximo
              ? 'Você chegou ao nível máximo. Lenda!'
              : `Faltam ${formatarXp(nivel.xpParaProximo)} XP para ${nivel.rotuloProximo}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
