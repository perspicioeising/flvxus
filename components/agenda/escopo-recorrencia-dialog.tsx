'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { EscopoAgenda } from '@/schemas/agenda';

export interface EscopoRecorrenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editar ou cancelar (muda só os textos). */
  acao: 'editar' | 'cancelar';
  onConfirmar: (escopo: EscopoAgenda) => void;
}

const OPCOES: { valor: EscopoAgenda; rotulo: string }[] = [
  { valor: 'ocorrencia', rotulo: 'Somente este evento' },
  { valor: 'seguintes', rotulo: 'Este e os seguintes' },
  { valor: 'todos', rotulo: 'Todos os eventos' },
];

/**
 * Pergunta o escopo de uma alteração em compromisso recorrente (padrão Google
 * Agenda). Ocorrências passadas nunca mudam, em nenhum escopo. Design: §6.3.
 */
export function EscopoRecorrenciaDialog({
  open,
  onOpenChange,
  acao,
  onConfirmar,
}: EscopoRecorrenciaDialogProps) {
  const [escopo, setEscopo] = React.useState<EscopoAgenda>('ocorrencia');
  const verbo = acao === 'editar' ? 'Editar' : 'Cancelar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{verbo} compromisso recorrente</DialogTitle>
          <DialogDescription>
            Escolha o que {acao === 'editar' ? 'alterar' : 'cancelar'}. Eventos que já passaram não
            mudam.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={escopo}
          onValueChange={(v) => setEscopo(v as EscopoAgenda)}
          aria-label="Escopo da alteração"
          className="gap-1"
        >
          {OPCOES.map((o) => (
            <div key={o.valor} className="flex min-h-11 items-center gap-3">
              <RadioGroupItem value={o.valor} id={`escopo-${o.valor}`} />
              <Label htmlFor={`escopo-${o.valor}`} className="flex-1 cursor-pointer py-2">
                {o.rotulo}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" className="min-h-11" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button type="button" className="min-h-11" onClick={() => onConfirmar(escopo)}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
