'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, EyeOff } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { alterarStatusFicha } from '@/actions/treinos';
import type { PlanStatus } from '@/types/database.types';
import { STATUS_DESCRICAO, STATUS_LABEL, visivelAoAluno } from './labels';
import { TRANSICOES_STATUS_INFO } from './status-transicoes';

/**
 * Controle de status da ficha. Mostra o status atual, deixa CLARO se o aluno
 * vê ou não a ficha e oferece apenas as transições válidas a partir do estado
 * atual. A invariante "aluno só vê `released`" é garantida por RLS — aqui é só
 * o fluxo de trabalho do professor.
 */
export function StatusControl({
  planId,
  statusAtual,
}: {
  planId: string;
  statusAtual: PlanStatus;
}) {
  const router = useRouter();
  const [salvando, setSalvando] = React.useState<PlanStatus | null>(null);

  const visivel = visivelAoAluno(statusAtual);
  const proximos = TRANSICOES_STATUS_INFO[statusAtual];

  async function mudar(novoStatus: PlanStatus) {
    setSalvando(novoStatus);
    try {
      const r = await alterarStatusFicha(planId, novoStatus);
      if (r.ok) {
        toast({ title: r.message ?? 'Status atualizado.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível atualizar o status.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        {visivel ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        )}
        <AlertTitle>{STATUS_LABEL[statusAtual]}</AlertTitle>
        <AlertDescription>{STATUS_DESCRICAO[statusAtual]}</AlertDescription>
      </Alert>

      {!visivel ? (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Apenas fichas <strong>liberadas</strong> ficam visíveis para o aluno.
          </span>
        </p>
      ) : null}

      {proximos.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {proximos.map(({ para, rotulo, principal }) => (
            <Button
              key={para}
              type="button"
              variant={principal ? 'default' : 'outline'}
              className="min-h-11"
              disabled={salvando !== null}
              onClick={() => mudar(para)}
            >
              {salvando === para ? 'Salvando…' : rotulo}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Esta ficha está arquivada e não tem mais transições disponíveis.
        </p>
      )}
    </div>
  );
}
