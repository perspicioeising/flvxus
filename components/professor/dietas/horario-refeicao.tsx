'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { definirHorarioRefeicao } from '@/actions/dietas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface HorarioRefeicaoProps {
  mealId: string;
  /** Nome da refeição (rótulo do campo). */
  nome: string;
  /** Horário salvo (`HH:mm` ou `HH:mm:ss`) ou `null`. */
  horaAtual: string | null;
}

/** `08:30:00` → `08:30`; valor fora do padrão vira vazio. */
function normalizar(hora: string | null): string {
  const m = hora ? /^(\d{1,2}):(\d{2})/.exec(hora) : null;
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

/**
 * Horário de uma refeição (alimenta a Agenda). Sem horário a refeição aparece
 * na faixa "Sem horário" do dia. Salvar/limpar chama `definirHorarioRefeicao`.
 */
export function HorarioRefeicao({ mealId, nome, horaAtual }: HorarioRefeicaoProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const inicial = normalizar(horaAtual);
  const [valor, setValor] = React.useState(inicial);

  function gravar(hora: string | null) {
    iniciar(async () => {
      const r = await definirHorarioRefeicao(mealId, hora);
      if (r.ok) {
        toast({ title: r.message ?? (hora ? 'Horário salvo.' : 'Horário removido.') });
        if (hora === null) setValor('');
        router.refresh();
      } else {
        toast({
          title: r.fieldErrors?.hora ?? r.message ?? 'Não foi possível salvar o horário.',
          variant: 'destructive',
        });
      }
    });
  }

  const id = `horario-${mealId}`;
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor={id} className="truncate">
          {nome}
        </Label>
        <Input
          id={id}
          type="time"
          className="min-h-11"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={pendente}
        />
      </div>
      <Button
        type="button"
        className="min-h-11"
        onClick={() => gravar(valor)}
        disabled={pendente || valor === '' || valor === inicial}
      >
        Salvar
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="min-h-11"
        onClick={() => gravar(null)}
        disabled={pendente || (inicial === '' && valor === '')}
      >
        Limpar
      </Button>
    </div>
  );
}
