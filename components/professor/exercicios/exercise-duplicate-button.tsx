'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CopyPlus } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { duplicarExercicioParaTenant } from '@/actions/exercicios';

/**
 * Botão "Duplicar para o meu acervo" exibido nos exercícios do catálogo global
 * (somente leitura). Clona o exercício para o tenant do professor e leva para a
 * página de edição da cópia, onde ele pode personalizar livremente.
 */
export function ExerciseDuplicateButton({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();
  const [duplicando, setDuplicando] = React.useState(false);

  async function duplicar() {
    setDuplicando(true);
    try {
      const r = await duplicarExercicioParaTenant(exerciseId);
      if (r.ok && r.id) {
        toast({ title: r.message ?? 'Exercício duplicado para o seu acervo.' });
        router.push(`/professor/exercicios/${r.id}/editar`);
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível duplicar.',
          variant: 'destructive',
        });
        setDuplicando(false);
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
      setDuplicando(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11"
      onClick={duplicar}
      disabled={duplicando}
    >
      <CopyPlus className="mr-2 h-4 w-4" aria-hidden="true" />
      {duplicando ? 'Duplicando…' : 'Duplicar para o meu acervo'}
    </Button>
  );
}
