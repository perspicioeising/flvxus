'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { definirFotoPerfil, removerFotoPerfil } from '@/actions/perfil';
import {
  MAX_AVATAR_BYTES,
  ehMimeAvatarPermitido,
  processarAvatar,
} from '@/lib/image/crop-quadrado';

export interface FotoPerfilProps {
  /** URL pública da foto atual, ou `null` quando ainda não há foto. */
  fotoAtual: string | null;
  /** Nome de exibição, usado para as iniciais do placeholder. */
  nomeExibicao: string | null;
}

/** Iniciais do nome para o placeholder (mesmo padrão do avatar de hoje). */
function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '–';
  if (partes.length === 1) return partes[0][0]?.toUpperCase() ?? '–';
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

/**
 * Bloco de identidade: foto de perfil com preview circular + ações. Reutilizável
 * por aluno (vinculado/self_managed) e professor — todos editam o próprio
 * `profiles` sob RLS via `definirFotoPerfil`/`removerFotoPerfil`.
 *
 * Pipeline: seletor de arquivo (jpg/png/webp) → valida tipo/tamanho no cliente →
 * crop quadrado + resize 512×512 (`processarAvatar`, canvas puro) → envia via
 * Server Action → grava `avatar_url` → toast → `router.refresh()`. Quando não há
 * foto, mostra as iniciais (mesmo placeholder de antes). Mobile-first, alvos
 * ≥44px, pt-BR.
 */
export function FotoPerfil({ fotoAtual, nomeExibicao }: FotoPerfilProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = React.useState(false);

  function abrirSeletor() {
    inputRef.current?.click();
  }

  async function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    // Permite reescolher o mesmo arquivo depois (o onChange só dispara se mudar).
    e.target.value = '';
    if (!arquivo) return;

    if (!ehMimeAvatarPermitido(arquivo.type)) {
      toast({
        title: 'Formato não suportado. Use JPG, PNG ou WEBP.',
        variant: 'destructive',
      });
      return;
    }
    if (arquivo.size > MAX_AVATAR_BYTES) {
      toast({ title: 'A imagem excede o limite de 2 MB.', variant: 'destructive' });
      return;
    }

    setEnviando(true);
    try {
      const processada = await processarAvatar(arquivo);
      const fd = new FormData();
      fd.append('file', processada.blob, `avatar.${processada.ext}`);

      const r = await definirFotoPerfil(fd);
      if (r.ok) {
        toast({ title: r.message ?? 'Foto atualizada.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível atualizar a foto.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title:
          err instanceof Error
            ? err.message
            : 'Não foi possível processar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  }

  function remover() {
    setEnviando(true);
    void (async () => {
      try {
        const r = await removerFotoPerfil();
        if (r.ok) {
          toast({ title: r.message ?? 'Foto removida.' });
          router.refresh();
        } else {
          toast({
            title: r.message ?? 'Não foi possível remover a foto.',
            variant: 'destructive',
          });
        }
      } finally {
        setEnviando(false);
      }
    })();
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Avatar className="h-20 w-20">
        {fotoAtual ? <AvatarImage src={fotoAtual} alt="Sua foto de perfil" /> : null}
        <AvatarFallback className="bg-primary-soft text-2xl font-black text-primary-soft-foreground">
          {iniciais(nomeExibicao)}
        </AvatarFallback>
      </Avatar>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={aoSelecionar}
        disabled={enviando}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={abrirSeletor}
          disabled={enviando}
        >
          <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
          {enviando ? 'Enviando…' : fotoAtual ? 'Alterar foto' : 'Adicionar foto'}
        </Button>
        {fotoAtual ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 text-muted-foreground"
            onClick={remover}
            disabled={enviando}
          >
            Remover foto
          </Button>
        ) : null}
      </div>
    </div>
  );
}
