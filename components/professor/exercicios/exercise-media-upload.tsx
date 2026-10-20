'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadMidiaExercicio } from '@/actions/exercicios';
import type { ExerciseMediaKind } from '@/lib/storage';

const CONFIG: Record<ExerciseMediaKind, { label: string; accept: string; inputId: string }> = {
  video: {
    label: 'Enviar vídeo',
    accept: 'video/*',
    inputId: 'upload-video',
  },
  thumbnail: {
    label: 'Enviar imagem (thumbnail)',
    accept: 'image/*',
    inputId: 'upload-thumbnail',
  },
};

/**
 * Upload de mídia (vídeo/thumbnail) de um exercício. Chama a Server Action
 * `uploadMidiaExercicio`, que grava no bucket privado e persiste o path. A
 * exibição acontece via URL assinada no RSC (nunca URL pública aqui).
 */
export function ExerciseMediaUpload({
  exerciseId,
  kind,
}: {
  exerciseId: string;
  kind: ExerciseMediaKind;
}) {
  const router = useRouter();
  const { label, accept, inputId } = CONFIG[kind];
  const [arquivo, setArquivo] = React.useState<File | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  async function enviar() {
    if (!arquivo) {
      toast({ title: 'Selecione um arquivo.', variant: 'destructive' });
      return;
    }
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('file', arquivo);
      const r = await uploadMidiaExercicio(exerciseId, kind, fd);
      if (r.ok) {
        toast({ title: r.message ?? 'Mídia enviada.' });
        setArquivo(null);
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Falha ao enviar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          type="file"
          accept={accept}
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="flex-1"
        />
        <Button
          type="button"
          className="min-h-11 shrink-0"
          onClick={enviar}
          disabled={enviando || !arquivo}
        >
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          {enviando ? 'Enviando…' : 'Enviar'}
        </Button>
      </div>
    </div>
  );
}
