'use client';

import * as React from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

import { Button } from '@/components/ui/button';

/** Formata segundos restantes como `m:ss`. */
function formatar(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Timer de descanso entre séries. Conta de forma regressiva a partir de
 * `segundos` (o `rest_seconds` prescrito do exercício), com iniciar/pausar,
 * reiniciar e pular. Alvos ≥ 44px; sem depender de hover. `haptics` é
 * best-effort via `navigator.vibrate` ao concluir, quando disponível.
 */
export function TimerDescanso({ segundos }: { segundos: number }) {
  const [restante, setRestante] = React.useState(segundos);
  const [rodando, setRodando] = React.useState(false);

  // Reinicia o alvo quando a prescrição muda (ex.: outro exercício).
  React.useEffect(() => {
    setRestante(segundos);
    setRodando(false);
  }, [segundos]);

  React.useEffect(() => {
    if (!rodando) return;

    const intervalo = window.setInterval(() => {
      setRestante((atual) => {
        if (atual <= 1) {
          window.clearInterval(intervalo);
          setRodando(false);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(200);
          }
          return 0;
        }
        return atual - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalo);
  }, [rodando]);

  const concluido = restante === 0;

  return (
    <div className="flex items-center gap-3">
      <span
        className="min-w-16 text-center text-xl font-semibold tabular-nums text-foreground"
        aria-live="polite"
      >
        {formatar(restante)}
      </span>

      {concluido ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => {
            setRestante(segundos);
            setRodando(true);
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reiniciar descanso
        </Button>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 min-w-11"
            aria-label={rodando ? 'Pausar descanso' : 'Iniciar descanso'}
            onClick={() => setRodando((v) => !v)}
          >
            {rodando ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {rodando ? 'Pausar' : 'Descanso'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            onClick={() => {
              setRodando(false);
              setRestante(0);
            }}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
            Pular
          </Button>
        </>
      )}
    </div>
  );
}
