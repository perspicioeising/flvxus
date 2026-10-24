'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Download, Trash2 } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/patterns';
import type { EstadoAcao } from '@/actions/avaliacoes';

/** Uma foto de avaliação com seu path do bucket e a URL assinada de exibição. */
export interface FotoAvaliacao {
  path: string;
  url: string;
}

export interface GaleriaFotosAvaliacaoProps {
  fotos: FotoAvaliacao[];
  /**
   * Quando presente, habilita a exclusão (só o professor passa). Ausente no
   * lado do aluno — nenhum botão de excluir é renderizado.
   */
  onExcluir?: (path: string) => Promise<EstadoAcao>;
}

/** Deriva um nome de arquivo sensato a partir do path do bucket. */
function nomeArquivo(path: string, indice: number): string {
  const base = path.split('/').pop();
  if (base && base.length > 0) return base;
  return `avaliacao-foto-${indice + 1}`;
}

/**
 * Galeria interativa das fotos de uma avaliação física. As miniaturas abrem um
 * lightbox (Dialog acessível: foco preso, ESC/overlay fecham). Cada foto pode
 * ser baixada (via signed URL de bucket privado) e, quando `onExcluir` é
 * fornecido, excluída com confirmação. Mobile-first, alvos de toque >=44px.
 */
export function GaleriaFotosAvaliacao({
  fotos,
  onExcluir,
}: GaleriaFotosAvaliacaoProps) {
  const router = useRouter();
  const [ampliada, setAmpliada] = React.useState<FotoAvaliacao | null>(null);
  const [aExcluir, setAExcluir] = React.useState<FotoAvaliacao | null>(null);
  const [excluindo, setExcluindo] = React.useState(false);

  if (fotos.length === 0) return null;

  async function baixar(foto: FotoAvaliacao, indice: number) {
    const nome = nomeArquivo(foto.path, indice);
    try {
      // Bucket privado: baixa via signed URL (fetch -> blob -> objectURL) para
      // forçar o download em vez de navegar.
      const resposta = await fetch(foto.url);
      if (!resposta.ok) throw new Error('fetch falhou');
      const blob = await resposta.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback quando CORS/rede impede o fetch: link direto com download.
      const a = document.createElement('a');
      a.href = foto.url;
      a.download = nome;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  async function confirmarExclusao() {
    if (!onExcluir || !aExcluir) return;
    setExcluindo(true);
    try {
      const r = await onExcluir(aExcluir.path);
      if (r.ok) {
        toast({ title: r.message ?? 'Foto excluída.' });
        setAExcluir(null);
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível excluir a foto.',
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
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fotos.map((foto, indice) => (
          <li
            key={foto.path}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <button
              type="button"
              onClick={() => setAmpliada(foto)}
              aria-label="Ampliar foto da avaliação"
              className="block min-h-11 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src={foto.url}
                alt="Foto da avaliação física"
                width={400}
                height={400}
                className="h-40 w-full object-cover"
                unoptimized
              />
            </button>
            <div className="flex items-center justify-end gap-1 p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                onClick={() => baixar(foto, indice)}
                aria-label="Baixar foto da avaliação"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </Button>
              {onExcluir ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 text-destructive hover:text-destructive"
                  onClick={() => setAExcluir(foto)}
                  aria-label="Excluir foto da avaliação"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={ampliada != null}
        onOpenChange={(aberto) => {
          if (!aberto) setAmpliada(null);
        }}
      >
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto da avaliação física ampliada</DialogTitle>
          </DialogHeader>
          {ampliada ? (
            <Image
              src={ampliada.url}
              alt="Foto da avaliação física ampliada"
              width={1200}
              height={1200}
              className="mx-auto max-h-[85vh] w-auto object-contain"
              unoptimized
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {onExcluir ? (
        <ConfirmDialog
          open={aExcluir != null}
          onOpenChange={(aberto) => {
            if (!aberto) setAExcluir(null);
          }}
          title="Excluir foto?"
          description="A foto será removida permanentemente desta avaliação. Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          destructive
          loading={excluindo}
          onConfirm={confirmarExclusao}
        />
      ) : null}
    </>
  );
}
