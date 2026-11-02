import { CheckCircle2, Circle, Lock, Target } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Missao } from '@/lib/arena/missoes';

export interface ListaMissoesProps {
  missoes: Missao[];
}

/** Rótulo pt-BR do período da missão. */
function rotuloPeriodo(periodo: Missao['periodo']): string {
  return periodo === 'diaria' ? 'Diária' : 'Semanal';
}

/**
 * Lista de missões do dia/semana com os três estados: concluída (verde),
 * pendente (neutra) e bloqueada ("em breve", sem fonte na G1). Puramente
 * apresentacional (RSC-safe), mobile-first.
 */
export function ListaMissoes({ missoes }: ListaMissoesProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Target className="h-4 w-4" aria-hidden="true" />
        Missões
      </p>
      <ul className="mt-3 space-y-2">
        {missoes.map((m) => {
          const Icon =
            m.estado === 'concluida'
              ? CheckCircle2
              : m.estado === 'bloqueada'
                ? Lock
                : Circle;
          return (
            <li
              key={m.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3',
                m.estado === 'concluida'
                  ? 'border-primary/40 bg-primary-soft'
                  : m.estado === 'bloqueada'
                    ? 'border-border bg-muted/40 opacity-70'
                    : 'border-border bg-card'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  m.estado === 'concluida'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {m.titulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rotuloPeriodo(m.periodo)}
                  {m.estado === 'bloqueada' ? ' · em breve' : ''}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-bold tabular-nums',
                  m.estado === 'concluida'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                +{m.xp} XP
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
