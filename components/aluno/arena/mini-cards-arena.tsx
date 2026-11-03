import { Flame, Medal } from 'lucide-react';

export interface MiniCardsArenaProps {
  /** Sequência atual de dias consecutivos com aderência. */
  streakAtual: number;
  /** Maior sequência já alcançada. */
  streakRecorde: number;
  /** Conquistas já obtidas pelo aluno. */
  conquistasObtidas: number;
  /** Total de conquistas disponíveis no tenant. */
  conquistasTotal: number;
}

/** Formata uma contagem de dias em pt-BR ("1 dia" / "N dias"). */
function formatarDias(n: number): string {
  return n === 1 ? '1 dia' : `${n} dias`;
}

/**
 * Dupla de mini-cards compacta logo abaixo do cartão de nível: SEQUÊNCIA
 * (streak) e CONQUISTAS lado a lado (grid de 2 colunas), escuros, cada um com
 * seu ícone (chama / medalha), o número grande e um rótulo pequeno. Reaproveita
 * os dados já montados em `montarDadosArena` (perfil.streak* e conquistas
 * obtidas/total) — não recalcula nada. Puramente apresentacional (RSC-safe),
 * mobile-first.
 */
export function MiniCardsArena({
  streakAtual,
  streakRecorde,
  conquistasObtidas,
  conquistasTotal,
}: MiniCardsArenaProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Sequência (streak) */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Sequência
        </p>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-4xl font-black leading-none tabular-nums text-foreground">
            {streakAtual}
          </span>
          <span className="text-sm text-muted-foreground">
            {streakAtual === 1 ? 'dia' : 'dias'}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Recorde: {formatarDias(streakRecorde)}
        </p>
      </div>

      {/* Conquistas */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Medal className="h-4 w-4" aria-hidden="true" />
          Conquistas
        </p>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-4xl font-black leading-none tabular-nums text-foreground">
            {conquistasObtidas}
          </span>
          <span className="text-sm text-muted-foreground">
            / {conquistasTotal}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {conquistasTotal === 0
            ? 'Nenhuma disponível ainda'
            : conquistasObtidas === conquistasTotal
              ? 'Todas conquistadas!'
              : 'Conquistadas até aqui'}
        </p>
      </div>
    </div>
  );
}
