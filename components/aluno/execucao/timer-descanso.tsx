'use client';

import * as React from 'react';
import { Minus, Plus, SkipForward } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AnelProgresso } from './anel-progresso';

/** Formata segundos restantes como `m:ss`. */
function formatar(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Timer de descanso entre séries, agora com anel SVG verde. Conta de forma
 * regressiva a partir de `segundos` (o `rest_seconds` prescrito), com
 * auto-início opcional, ajustes −15s/+15s e pular. Alvos ≥ 44px; sem depender
 * de hover. `haptics` é best-effort via `navigator.vibrate` ao concluir.
 * `prefers-reduced-motion` é tratado pelo próprio `AnelProgresso`.
 */
export function TimerDescanso({
  segundos,
  autoIniciar = false,
}: {
  segundos: number;
  autoIniciar?: boolean;
}) {
  const [restante, setRestante] = React.useState(segundos);
  const [rodando, setRodando] = React.useState(autoIniciar);

  // Teto do anel: nunca menor que o prescrito nem que o restante atual (quando
  // o aluno adiciona tempo além do prescrito), para a fração nunca passar de 1.
  const teto = Math.max(segundos, restante);

  // Reinicia o alvo quando a prescrição muda (ex.: outro exercício). Com
  // `autoIniciar`, já começa rodando; senão, fica parado aguardando o toque.
  React.useEffect(() => {
    setRestante(segundos);
    setRodando(autoIniciar);
  }, [segundos, autoIniciar]);

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

  function ajustar(delta: number) {
    setRestante((atual) => Math.max(0, atual + delta));
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-border p-6">
      <AnelProgresso segundos={teto} restante={restante} size={180}>
        <span
          className="text-4xl font-black tabular-nums text-foreground"
          aria-live="polite"
        >
          {formatar(restante)}
        </span>
        <span className="text-xs text-muted-foreground">
          de {formatar(teto)}
        </span>
      </AnelProgresso>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-full"
          onClick={() => ajustar(-15)}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
          15s
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-full"
          onClick={() => ajustar(15)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          15s
        </Button>
      </div>

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
        Pular descanso
      </Button>
    </div>
  );
}
