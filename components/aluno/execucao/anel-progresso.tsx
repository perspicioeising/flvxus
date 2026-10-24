'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface AnelProgressoProps {
  /** Segundos totais (prescrição do descanso). */
  segundos: number;
  /** Segundos restantes. */
  restante: number;
  /** Tamanho do anel em px. */
  size?: number;
  /** Espessura do traço. */
  strokeWidth?: number;
  className?: string;
  /** Conteúdo central (tempo + legenda). */
  children?: React.ReactNode;
}

/**
 * Anel SVG do timer de descanso. Trilho (stroke-border) + progresso
 * (stroke-primary) animando strokeDashoffset conforme restante/segundos.
 * `prefers-reduced-motion` suprime a transição. Puro (sem estado).
 */
export function AnelProgresso({
  segundos,
  restante,
  size = 200,
  strokeWidth = 12,
  className,
  children,
}: AnelProgressoProps) {
  const raio = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * raio;
  const fracao = segundos > 0 ? Math.min(1, Math.max(0, restante / segundos)) : 0;
  const offset = circ * (1 - fracao);

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
