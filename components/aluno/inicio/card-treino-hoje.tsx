import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MuscleMap } from '@/components/muscle-map';

/** Um exercício do treino de hoje (resumo para exibição). */
export interface ExercicioHoje {
  id: string;
  nome: string;
  sets: number | null;
  reps: string | null;
}

export interface CardTreinoHojeProps {
  /** Nome da ficha liberada. */
  fichaNome: string;
  /** ID da ficha (para o deep-link de execução). */
  planId: string;
  /** Letra da divisão (ex.: "A") ou null no legado por dia. */
  divisionLabel: string | null;
  /** Grupos musculares do treino escolhido. */
  grupos: string[];
  /** Exercícios prescritos para o treino escolhido. */
  exercicios: ExercicioHoje[];
  /** Destino do CTA, já montado pela page (deep-link ?divisao/?dia). */
  href: string;
}

/**
 * Cartão verde de "próximo treino" na tela de início do aluno. Letra da divisão
 * gigante, grupos musculares em destaque e botão pílula escuro para iniciar.
 * Puramente apresentacional (RSC-safe): navegação via `Link`.
 */
export function CardTreinoHoje({
  fichaNome,
  divisionLabel,
  grupos,
  exercicios,
  href,
}: CardTreinoHojeProps) {
  const gruposLabel =
    grupos.length > 0 ? grupos.join(' E ').toUpperCase() : fichaNome;

  return (
    <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-app-glow">
      <p className="text-xs font-bold uppercase tracking-widest opacity-80">
        Próximo treino
      </p>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {divisionLabel ? (
            <p className="text-6xl font-black leading-none md:text-7xl">
              {divisionLabel}
            </p>
          ) : null}
          <p className="mt-2 text-lg font-bold leading-tight">{gruposLabel}</p>
          <p className="mt-1 text-sm opacity-80">
            {fichaNome}
            {exercicios.length > 0
              ? ` · ${exercicios.length} ${exercicios.length === 1 ? 'exercício' : 'exercícios'}`
              : ''}
          </p>
        </div>
        {grupos.length > 0 ? (
          // Mini body-map dos músculos da divisão. Como o cartão tem fundo
          // primário, usa `onPrimary` (ativas em primary-foreground).
          <MuscleMap grupos={grupos} size="sm" onPrimary className="shrink-0" />
        ) : null}
      </div>

      <Button
        asChild
        size="xl"
        className="mt-6 w-full bg-background text-foreground hover:bg-background/90"
      >
        <Link href={href}>
          Iniciar treino
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
