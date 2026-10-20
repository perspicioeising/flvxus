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
import { excluirExercicio } from '@/actions/exercicios';

/**
 * Botão de exclusão de exercício do tenant, com confirmação. Após excluir,
 * volta para a biblioteca.
 */
export function ExerciseDeleteButton({
  exerciseId,
  nome,
}: {
  exerciseId: string;
  nome: string;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = React.useState(false);

  async function excluir() {
    setExcluindo(true);
    try {
      const r = await excluirExercicio(exerciseId);
      if (r.ok) {
        toast({ title: r.message ?? 'Exercício excluído.' });
        router.push('/professor/exercicios');
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
          <AlertDialogTitle>Excluir exercício?</AlertDialogTitle>
          <AlertDialogDescription>
            O exercício “{nome}” será removido da sua biblioteca. Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
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
