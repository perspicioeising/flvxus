'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns';
import { excluirMidiaExercicio } from '@/actions/exercicios';
import type { ExerciseMediaKind } from '@/lib/storage/exercise-media';

const CONFIG: Record<
  ExerciseMediaKind,
  { botao: string; aria: string; titulo: string; descricao: string }
> = {
  video: {
    botao: 'Excluir vídeo',
    aria: 'Excluir vídeo demonstrativo',
    titulo: 'Excluir vídeo?',
    descricao:
      'O vídeo demonstrativo será removido permanentemente deste exercício. Esta ação não pode ser desfeita.',
  },
  thumbnail: {
    botao: 'Excluir imagem',
    aria: 'Excluir imagem (thumbnail)',
    titulo: 'Excluir imagem?',
    descricao:
      'A imagem (thumbnail) será removida permanentemente deste exercício. Esta ação não pode ser desfeita.',
  },
};

/**
 * Botão de exclusão da mídia (vídeo/thumbnail) de um exercício, com
 * confirmação (ConfirmDialog acessível: foco preso, ESC/overlay fecham). Ao
 * confirmar, chama `excluirMidiaExercicio` e dá `router.refresh()` no sucesso —
 * o preview some e o campo de upload (sempre renderizado) reaparece, cobrindo o
 * fluxo de "substituir" sem action dedicada. Mesma UX da galeria de fotos.
 */
export function ExerciseMediaDeleteButton({
  exerciseId,
  kind,
}: {
  exerciseId: string;
  kind: ExerciseMediaKind;
}) {
  const router = useRouter();
  const { botao, aria, titulo, descricao } = CONFIG[kind];
  const [aberto, setAberto] = React.useState(false);
  const [excluindo, setExcluindo] = React.useState(false);

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const r = await excluirMidiaExercicio(exerciseId, kind);
      if (r.ok) {
        toast({ title: r.message ?? 'Mídia excluída.' });
        setAberto(false);
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível excluir a mídia.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 text-destructive hover:text-destructive"
        onClick={() => setAberto(true)}
        aria-label={aria}
      >
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        {botao}
      </Button>

      <ConfirmDialog
        open={aberto}
        onOpenChange={(valor) => {
          if (!valor) setAberto(false);
        }}
        title={titulo}
        description={descricao}
        confirmLabel="Excluir"
        destructive
        loading={excluindo}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
