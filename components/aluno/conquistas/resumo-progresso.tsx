import { StatCard } from '@/components/patterns';

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
 * Faixa de 3 métricas grandes em verde (pontos, sequência, conquistas).
 * Puramente apresentacional (RSC-safe). Mobile-first.
 */
export function ResumoProgresso({
  pontos,
  streak,
  obtidas,
  total,
}: ResumoProgressoProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Pontos"
        value={pontos}
        tone="emphasis"
        radius="2xl"
      />
      <StatCard
        label="Sequência"
        value={streak === 1 ? '1 dia' : `${streak} dias`}
        tone="emphasis"
        radius="2xl"
      />
      <StatCard
        label="Conquistas"
        value={`${obtidas}/${total}`}
        tone="emphasis"
        radius="2xl"
      />
    </div>
  );
}
