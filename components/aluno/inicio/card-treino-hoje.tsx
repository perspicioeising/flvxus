import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  /** Rótulo pt-BR do dia da semana atual. */
  diaLabel: string;
  /** Exercícios prescritos para hoje. */
  exercicios: ExercicioHoje[];
}

/**
 * Card "Treino de hoje" na tela de início do aluno. Mostra a ficha liberada e
 * os exercícios do dia da semana atual, com atalho para a tela de treinos.
 * Puramente apresentacional (RSC-safe): navegação via `Link`.
 */
export function CardTreinoHoje({
  fichaNome,
  diaLabel,
  exercicios,
}: CardTreinoHojeProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-xl">Treino de hoje</CardTitle>
        </div>
        <CardDescription>
          {diaLabel} • {fichaNome}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercicios.length > 0 ? (
          <ul className="space-y-2">
            {exercicios.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">
                  {ex.nome}
                </span>
                {ex.sets || ex.reps ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {[ex.sets ? `${ex.sets}x` : null, ex.reps]
                      .filter(Boolean)
                      .join(' ')}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sua ficha liberada não tem exercícios marcados para hoje. Veja o
            treino completo e escolha o que fazer.
          </p>
        )}
        <Button asChild className="min-h-11 w-full">
          <Link href="/aluno/treinos">Ver treino completo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
