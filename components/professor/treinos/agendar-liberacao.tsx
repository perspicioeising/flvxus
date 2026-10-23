'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { programarLiberacao, desmarcarLiberacao } from '@/actions/treinos';
import type { AgendamentoInput } from '@/schemas/treino';
import type { PlanStatus } from '@/types/database.types';
import { formatarDataBr } from './labels';

type Modo = 'agora' | 'data' | 'dias';

/** `YYYY-MM-DD` de amanhã (UTC), usado como `min` do input de data. */
function amanhaISO(): string {
  const amanha = new Date(Date.now() + 86_400_000);
  return amanha.toISOString().slice(0, 10);
}

/**
 * Agendamento de liberação de uma ficha (só rascunho). O professor escolhe
 * liberar agora, agendar por data fixa ou por prazo em dias. Quando já há um
 * agendamento, mostra a data e permite removê-lo. Inputs nativos — zero
 * dependência nova. A validação real é no Zod/servidor (`programarLiberacao`).
 */
export function AgendarLiberacao({
  planId,
  statusAtual,
  scheduledReleaseAt,
}: {
  planId: string;
  statusAtual: PlanStatus;
  scheduledReleaseAt: string | null;
}) {
  const router = useRouter();
  const [modo, setModo] = React.useState<Modo>('agora');
  const [data, setData] = React.useState('');
  const [dias, setDias] = React.useState('');
  const [erroCampo, setErroCampo] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);

  // Só rascunho pode ser agendado/liberado (coerente com a action).
  if (statusAtual !== 'draft') {
    return null;
  }

  const minData = amanhaISO();

  async function executar(entrada: AgendamentoInput) {
    setErroCampo(null);
    setSalvando(true);
    try {
      const r = await programarLiberacao(planId, entrada);
      if (r.ok) {
        toast({ title: r.message ?? 'Liberação programada.' });
        router.refresh();
      } else if (r.fieldErrors) {
        setErroCampo(r.fieldErrors.data ?? r.fieldErrors.dias ?? r.message ?? null);
        if (r.message && !r.fieldErrors.data && !r.fieldErrors.dias) {
          toast({ title: r.message, variant: 'destructive' });
        }
      } else {
        toast({ title: r.message ?? 'Não foi possível programar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  }

  function confirmar() {
    // `z.coerce` no servidor revalida tudo; aqui convertemos os valores dos
    // inputs nativos para os tipos de `AgendamentoInput` (Date/number).
    if (modo === 'agora') {
      void executar({ modo: 'agora' });
    } else if (modo === 'data') {
      void executar({ modo: 'data', data: new Date(data) });
    } else {
      void executar({ modo: 'dias', dias: Number(dias) });
    }
  }

  async function remover() {
    setSalvando(true);
    try {
      const r = await desmarcarLiberacao(planId);
      if (r.ok) {
        toast({ title: r.message ?? 'Agendamento removido.' });
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível remover.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">Liberação programada</h3>
      </div>

      {scheduledReleaseAt ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Agendada para <strong>{formatarDataBr(scheduledReleaseAt)}</strong>.
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={salvando}
            onClick={remover}
          >
            {salvando ? 'Removendo…' : 'Remover agendamento'}
          </Button>
        </div>
      ) : null}

      <RadioGroup
        value={modo}
        onValueChange={(v) => {
          setModo(v as Modo);
          setErroCampo(null);
        }}
        className="gap-3"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="agora" id="modo-agora" />
          <Label htmlFor="modo-agora" className="cursor-pointer font-normal">
            Liberar agora
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="data" id="modo-data" />
          <Label htmlFor="modo-data" className="cursor-pointer font-normal">
            Agendar para uma data
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="dias" id="modo-dias" />
          <Label htmlFor="modo-dias" className="cursor-pointer font-normal">
            Agendar por prazo em dias
          </Label>
        </div>
      </RadioGroup>

      {modo === 'data' ? (
        <div className="space-y-1.5">
          <Label htmlFor="agendar-data">Data de liberação</Label>
          <Input
            id="agendar-data"
            type="date"
            min={minData}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
      ) : null}

      {modo === 'dias' ? (
        <div className="space-y-1.5">
          <Label htmlFor="agendar-dias">Liberar em (dias)</Label>
          <Input
            id="agendar-dias"
            type="number"
            min="1"
            step="1"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
            placeholder="Ex.: 30"
          />
        </div>
      ) : null}

      {erroCampo ? <p className="text-sm text-destructive">{erroCampo}</p> : null}

      <Button
        type="button"
        className="min-h-11"
        disabled={salvando || (modo === 'data' && !data) || (modo === 'dias' && !dias)}
        onClick={confirmar}
      >
        {salvando ? 'Salvando…' : modo === 'agora' ? 'Liberar agora' : 'Agendar liberação'}
      </Button>
    </div>
  );
}
