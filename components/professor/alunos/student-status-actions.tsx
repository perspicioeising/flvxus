'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { alterarStatusAluno } from '@/actions/alunos';
import type { StudentStatus } from '@/types/database.types';
import { STATUS_ALUNO } from '@/schemas/aluno';
import { STATUS_LABEL } from './labels';

/** Rótulo do botão para cada status de destino. */
const ACAO_LABEL: Record<(typeof STATUS_ALUNO)[number], string> = {
  active: 'Ativar',
  inactive: 'Inativar',
  archived: 'Arquivar',
};

/**
 * Ações de status da ficha do aluno. Oferece apenas as transições diferentes do
 * status atual, chamando a Server Action `alterarStatusAluno`.
 */
export function StudentStatusActions({
  userId,
  statusAtual,
}: {
  userId: string;
  statusAtual: StudentStatus | null;
}) {
  const router = useRouter();
  const [pendente, setPendente] = React.useState<string | null>(null);

  async function alterar(status: (typeof STATUS_ALUNO)[number]) {
    setPendente(status);
    try {
      const r = await alterarStatusAluno(userId, status);
      if (r.ok) {
        toast({ title: r.message ?? `Status alterado para ${STATUS_LABEL[status]}.` });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível alterar o status.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setPendente(null);
    }
  }

  const opcoes = STATUS_ALUNO.filter((s) => s !== statusAtual);

  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((status) => (
        <Button
          key={status}
          type="button"
          variant={status === 'archived' ? 'outline' : 'secondary'}
          className="min-h-11"
          disabled={pendente !== null}
          onClick={() => alterar(status)}
        >
          {pendente === status ? 'Salvando…' : ACAO_LABEL[status]}
        </Button>
      ))}
    </div>
  );
}
