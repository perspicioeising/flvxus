'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EstadoAcao } from '@/actions/avaliacoes';

/**
 * UI de upload de fotos na tela de DETALHE do professor — permite anexar fotos
 * a uma avaliação já criada. Reusa a action `uploadFotoAvaliacao` via adaptador
 * `'use server'` (que injeta o id da rota), recebido na prop `onUploadFoto`.
 * LGPD adiado: sem gate de consentimento. Mobile-first e acessível.
 */
export function UploadFotos({
  onUploadFoto,
}: {
  onUploadFoto: (formData: FormData) => Promise<EstadoAcao>;
}) {
  const router = useRouter();
  const [arquivos, setArquivos] = React.useState<File[]>([]);
  const [enviando, setEnviando] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function enviar() {
    if (arquivos.length === 0) return;
    setEnviando(true);
    try {
      let falhas = 0;
      let ultimaMensagem: string | undefined;
      for (const arquivo of arquivos) {
        const fd = new FormData();
        fd.append('foto', arquivo);
        const r = await onUploadFoto(fd);
        if (!r.ok) {
          falhas += 1;
          ultimaMensagem = r.message;
        }
      }

      if (falhas === 0) {
        toast({ title: 'Fotos enviadas.' });
      } else {
        toast({
          title: ultimaMensagem ?? `Falha ao enviar ${falhas} foto(s).`,
          variant: 'destructive',
        });
      }

      // Limpa a seleção e atualiza a lista do server component.
      setArquivos([]);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="fotos-upload">Adicionar fotos</Label>
      <Input
        id="fotos-upload"
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={enviando}
        onChange={(e) => setArquivos(Array.from(e.target.files ?? []))}
      />
      <p className="text-sm text-muted-foreground">
        As fotos ficam em bucket privado e só são exibidas por link temporário.
        {arquivos.length > 0 ? ` ${arquivos.length} arquivo(s) selecionado(s).` : ''}
      </p>
      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto"
        disabled={enviando || arquivos.length === 0}
        onClick={enviar}
      >
        <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
        {enviando ? 'Enviando…' : 'Adicionar fotos'}
      </Button>
    </div>
  );
}
