import { Flame, Star, Trophy } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface ResumoProgressoProps {
  /** Pontos acumulados (`profiles.total_points`). */
  pontos: number;
  /** Sequência atual de dias de treino. */
  streak: number;
  /** Conquistas obtidas. */
  obtidas: number;
  /** Total de conquistas disponíveis no tenant. */
  total: number;
}

/**
 * Resumo de progresso do aluno (pontos, sequência e conquistas obtidas vs
 * disponíveis). Puramente apresentacional (RSC-safe). Mobile-first.
 */
export function ResumoProgresso({
  pontos,
  streak,
  obtidas,
  total,
}: ResumoProgressoProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">Seu progresso</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <dl className="grid grid-cols-3 gap-4">
          <Metrica
            icon={Star}
            rotulo="Pontos"
            valor={String(pontos)}
          />
          <Metrica
            icon={Flame}
            rotulo="Sequência"
            valor={streak === 1 ? '1 dia' : `${streak} dias`}
          />
          <Metrica
            icon={Trophy}
            rotulo="Conquistas"
            valor={`${obtidas}/${total}`}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function Metrica({
  icon: Icon,
  rotulo,
  valor,
}: {
  icon: typeof Star;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="text-xl font-bold text-foreground">{valor}</dd>
    </div>
  );
}
