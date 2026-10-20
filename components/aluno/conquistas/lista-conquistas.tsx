import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Lock,
  Star,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import { formatarData } from '@/lib/datas';
import type { ConquistaResolvida } from '@/lib/gamificacao/conquistas';

/** Mapeia o nome do ícone (achievements.icon) para um ícone lucide. */
const ICONES: Record<string, LucideIcon> = {
  Trophy,
  CalendarCheck,
  Flame,
  Star,
  Award,
};

/** Resolve o ícone pelo nome; cai em `Award` quando desconhecido/ausente. */
function iconeDe(nome: string | null): LucideIcon {
  if (nome && ICONES[nome]) {
    return ICONES[nome];
  }
  return Award;
}

export interface ListaConquistasProps {
  conquistas: ConquistaResolvida[];
}

/**
 * Lista de conquistas do aluno, destacando as obtidas e mostrando as ainda
 * disponíveis como bloqueadas. Puramente apresentacional (RSC-safe), mobile-first.
 */
export function ListaConquistas({ conquistas }: ListaConquistasProps) {
  return (
    <ul className="space-y-3">
      {conquistas.map((c) => {
        const Icon = iconeDe(c.icon);
        return (
          <li
            key={c.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              c.obtida
                ? 'border-primary/40 bg-primary/5'
                : 'border-border opacity-80'
            }`}
          >
            <span
              className={`mt-0.5 shrink-0 rounded-full p-2 ${
                c.obtida
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {c.obtida ? (
                <Icon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Lock className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {c.name}
                </span>
                {c.points > 0 ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    +{c.points} pts
                  </span>
                ) : null}
              </div>
              {c.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.description}
                </p>
              ) : null}
              {c.obtida ? (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Conquistada em {formatarData(c.earnedAt)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ainda não conquistada.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
