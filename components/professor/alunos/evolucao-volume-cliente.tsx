'use client';

import { EvolucaoLineChart } from '@/components/charts/evolucao-line-chart';

/**
 * Volume total por sessão (Σ reps × carga, somado sobre todos os exercícios da
 * sessão) ao longo do tempo. Recebe os pontos já achatados no servidor. Só é
 * renderizado quando há ≥2 pontos (o servidor decide).
 */

export interface PontoVolume {
  rotulo: string;
  volume: number;
}

/** Resumo textual (primeiro → último) para acessibilidade. */
function resumoVolume(pontos: PontoVolume[]): string {
  if (pontos.length === 0) return 'Sem dados de volume.';
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  return `Volume variou de ${primeiro.volume} em ${primeiro.rotulo} para ${ultimo.volume} em ${ultimo.rotulo}.`;
}

export function EvolucaoVolumeCliente({ pontos }: { pontos: PontoVolume[] }) {
  if (pontos.length < 2) return null;

  return (
    <EvolucaoLineChart
      titulo="Volume por sessão"
      unidade="kg·rep"
      dados={pontos.map((p) => ({ rotulo: p.rotulo, valor: p.volume }))}
      resumo={resumoVolume(pontos)}
    />
  );
}
