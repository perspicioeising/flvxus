'use client';

import * as React from 'react';
import { Flag } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface DialogAvaliacaoTreinoProps {
  /** Nº de séries concluídas (para a descrição do diálogo). */
  seriesFeitas: number;
  /** Total de séries registradas (para a descrição do diálogo). */
  seriesTotal: number;
  /** `true` quando todas as séries foram concluídas. */
  tudoFeito: boolean;
  /** Intensidade percebida (RPE 1..10) ou `null` (não informada). */
  intensidade: number | null;
  /** Setter da intensidade (toggle: tocar no valor ativo desmarca). */
  onIntensidadeChange: (valor: number | null) => void;
  /** Observações livres do treino (opcional). */
  nota: string;
  /** Setter das observações. */
  onNotaChange: (valor: string) => void;
  /** Dispara a finalização (chama o mesmo `finalizarSessao` de antes). */
  onConfirmar: () => void;
  /** `true` enquanto a finalização está em andamento. */
  finalizando: boolean;
  /** Desabilita o gatilho (ex.: transição de série pendente). */
  disabledTrigger?: boolean;
}

/**
 * Avaliação do treino pelo aluno, no padrão visual do app (shadcn `Dialog`).
 * Coleta RPE (1..10, opcional) e observações (opcional) e chama o MESMO
 * `finalizarSessao` — a persistência (`perceived_intensity`/`notes`) não muda.
 * Ambos os campos são opcionais: finalizar sem RPE/nota é permitido.
 *
 * Acessibilidade: a escala RPE é um `role="group"` com `aria-labelledby`; cada
 * botão usa `aria-pressed`; alvos ≥ 44px. O foco preso/retorno e o `aria-modal`
 * vêm do Radix `Dialog`.
 */
export function DialogAvaliacaoTreino({
  seriesFeitas,
  seriesTotal,
  tudoFeito,
  intensidade,
  onIntensidadeChange,
  nota,
  onNotaChange,
  onConfirmar,
  finalizando,
  disabledTrigger = false,
}: DialogAvaliacaoTreinoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="xl"
          className="w-full"
          disabled={disabledTrigger || finalizando}
        >
          <Flag className="h-5 w-5" aria-hidden="true" />
          Finalizar treino
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-6 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            Como foi o treino?
          </DialogTitle>
          <DialogDescription>
            {tudoFeito
              ? 'Você concluiu todas as séries. Conte como se sentiu e finalize.'
              : `Você marcou ${seriesFeitas} de ${seriesTotal} séries. Conte como se sentiu e finalize.`}
          </DialogDescription>
        </DialogHeader>

        {/* Intensidade percebida (RPE 1..10), opcional: não bloqueia finalizar.
            Tocar no valor ativo desmarca (toggle). */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              id="rpe-label"
              className="text-sm font-semibold text-foreground"
            >
              Intensidade do treino
            </span>
            <span className="text-xs text-muted-foreground">
              {intensidade === null ? 'Opcional' : `Nível ${intensidade}`}
            </span>
          </div>
          <div
            role="group"
            aria-labelledby="rpe-label"
            className="grid grid-cols-5 gap-2"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((valor) => {
              const ativo = intensidade === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={ativo}
                  aria-label={`Intensidade ${valor}`}
                  onClick={() =>
                    onIntensidadeChange(intensidade === valor ? null : valor)
                  }
                  className={cn(
                    'min-h-11 min-w-11 rounded-xl border text-sm font-bold tabular-nums transition-colors',
                    ativo
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {valor}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 · Muito leve</span>
            <span>10 · Máximo</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nota-sessao" className="text-sm font-semibold">
            Observações (opcional)
          </Label>
          <Textarea
            id="nota-sessao"
            value={nota}
            onChange={(e) => onNotaChange(e.target.value)}
            rows={3}
            placeholder="Como foi o treino? Alguma dor, recorde ou ajuste?"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            size="lg"
            className="min-h-11 flex-1"
            disabled={finalizando}
            onClick={onConfirmar}
          >
            {finalizando ? 'Finalizando…' : 'Finalizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
