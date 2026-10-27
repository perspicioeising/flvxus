'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/browser';
import {
  criarUploadUrlMidiaExercicio,
  confirmarMidiaExercicio,
} from '@/actions/exercicios';
import {
  EXERCISE_MEDIA_BUCKET,
  limiteMidiaExercicio,
  prefixoMimePermitido,
  type ExerciseMediaKind,
} from '@/lib/storage/exercise-media';

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

/** Formata um limite em bytes como "N MB" para mensagens em pt-BR. */
function limiteEmMB(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/**
 * Upload de mídia (vídeo/thumbnail) de um exercício via UPLOAD DIRETO ao
 * Supabase Storage com SIGNED UPLOAD URL. O arquivo NÃO passa mais pela Server
 * Action — isso remove o gargalo do `bodySizeLimit` do Next e viabiliza vídeos
 * de até 50MB (thumbnail até 5MB).
 *
 * Fluxo:
 *   1. Valida tamanho/tipo no cliente (antes de pedir a URL).
 *   2. `criarUploadUrlMidiaExercicio` (Server Action leve) emite a signed upload
 *      URL + token + path determinístico derivado no servidor.
 *   3. `uploadToSignedUrl` envia o arquivo DIRETO ao bucket privado.
 *   4. `confirmarMidiaExercicio` (Server Action) persiste o path no exercício.
 *
 * A exibição continua via URL assinada no RSC (nunca URL pública aqui).
 *
 * Nota: `uploadToSignedUrl` não expõe progresso byte-a-byte, então o estado de
 * envio é INDETERMINADO ("Enviando…" + barra indeterminada); o botão fica
 * desabilitado enquanto envia.
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

    // Validação no cliente (o servidor revalida ao emitir a signed URL).
    const limite = limiteMidiaExercicio(kind);
    if (arquivo.size > limite) {
      const alvo = kind === 'video' ? 'O vídeo' : 'A imagem';
      toast({
        title: `${alvo} excede o limite de ${limiteEmMB(limite)}.`,
        variant: 'destructive',
      });
      return;
    }
    const prefixo = prefixoMimePermitido(kind);
    if (!arquivo.type.startsWith(prefixo)) {
      const esperado = kind === 'video' ? 'um vídeo' : 'uma imagem';
      toast({ title: `Envie ${esperado} em um formato válido.`, variant: 'destructive' });
      return;
    }

    setEnviando(true);
    try {
      // 1. Pede a signed upload URL (sem enviar o arquivo).
      const assinada = await criarUploadUrlMidiaExercicio(exerciseId, kind, {
        name: arquivo.name,
        size: arquivo.size,
        type: arquivo.type,
      });
      if (!assinada.ok || !assinada.url || !assinada.token || !assinada.path) {
        toast({ title: assinada.message ?? 'Falha ao enviar.', variant: 'destructive' });
        return;
      }

      // 2. Upload DIRETO ao Storage (não passa pela Server Action).
      const supabase = createClient();
      const { error: erroUpload } = await supabase.storage
        .from(assinada.bucket ?? EXERCISE_MEDIA_BUCKET)
        .uploadToSignedUrl(assinada.path, assinada.token, arquivo, {
          contentType: arquivo.type,
        });
      if (erroUpload) {
        toast({
          title: `Falha ao enviar o arquivo: ${erroUpload.message}`,
          variant: 'destructive',
        });
        return;
      }

      // 3. Confirma: persiste o path no exercício.
      const confirmada = await confirmarMidiaExercicio(exerciseId, kind, assinada.path);
      if (confirmada.ok) {
        toast({ title: confirmada.message ?? 'Mídia enviada.' });
        setArquivo(null);
        router.refresh();
      } else {
        toast({ title: confirmada.message ?? 'Falha ao salvar.', variant: 'destructive' });
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
          disabled={enviando}
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
      {enviando ? (
        <div className="space-y-1">
          {/* Progresso indeterminado: uploadToSignedUrl não expõe bytes enviados. */}
          <Progress
            value={100}
            aria-label="Enviando mídia…"
            className="h-2 animate-pulse"
          />
          <p className="text-xs text-muted-foreground" role="status">
            Enviando… não feche esta página.
          </p>
        </div>
      ) : null}
    </div>
  );
}
