'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { excluirFicha, excluirModelo, type EstadoAcao } from '@/actions/treinos';

function DeleteButton({
  titulo,
  descricao,
  acao,
  redirecionarPara,
}: {
  titulo: string;
  descricao: string;
  acao: () => Promise<EstadoAcao>;
  redirecionarPara: string;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = React.useState(false);

  async function excluir() {
    setExcluindo(true);
    try {
      const r = await acao();
      if (r.ok) {
        toast({ title: r.message ?? 'Excluído.' });
        router.push(redirecionarPara);
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível excluir.', variant: 'destructive' });
        setExcluindo(false);
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
      setExcluindo(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 text-destructive">
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={excluir} disabled={excluindo}>
            {excluindo ? 'Excluindo…' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Botão de exclusão de MODELO, com confirmação. */
export function ModeloDeleteButton({ workoutId, nome }: { workoutId: string; nome: string }) {
  return (
    <DeleteButton
      titulo="Excluir modelo?"
      descricao={`O modelo “${nome}” e seus exercícios serão removidos. Esta ação não pode ser desfeita.`}
      acao={() => excluirModelo(workoutId)}
      redirecionarPara="/professor/modelos-treino"
    />
  );
}

/** Botão de exclusão de FICHA, com confirmação. */
export function FichaDeleteButton({ planId, nome }: { planId: string; nome: string }) {
  return (
    <DeleteButton
      titulo="Excluir ficha?"
      descricao={`A ficha “${nome}” e seus exercícios serão removidos. Esta ação não pode ser desfeita.`}
      acao={() => excluirFicha(planId)}
      redirecionarPara="/professor/treinos"
    />
  );
}
