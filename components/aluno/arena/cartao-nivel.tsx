import { Sparkles } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import type { NivelArena } from '@/lib/arena/niveis';

export interface CartaoNivelProps {
  nivel: NivelArena;
}

/** Formata um número de XP com separador de milhar pt-BR. */
function formatarXp(xp: number): string {
  return new Intl.NumberFormat('pt-BR').format(xp);
}

/**
 * Cartão de nível da Arena: nível atual em destaque, XP acumulado e barra de
 * progresso até o próximo nível. No nível máximo (Lenda) mostra o estado
 * concluído, sem barra "faltando". Puramente apresentacional (RSC-safe).
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

  return (
    <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-app-glow">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Nível {nivel.nivel}
      </p>
      <p className="mt-2 text-4xl font-black leading-none md:text-5xl">
        {nivel.rotulo}
      </p>
      <p className="mt-2 text-sm opacity-90">
        {formatarXp(nivel.xp)} XP acumulados
      </p>

      <div className="mt-4">
        <Progress
          value={percentual}
          className="h-3 bg-primary-foreground/20"
          indicatorClassName="bg-primary-foreground"
          aria-label={`Progresso de nível: ${percentual}%`}
        />
        <p className="mt-2 text-sm opacity-90">
          {ehMaximo
            ? 'Você chegou ao nível máximo. Lenda!'
            : `Faltam ${formatarXp(nivel.xpParaProximo)} XP para ${nivel.rotuloProximo}.`}
        </p>
      </div>
    </div>
  );
}
