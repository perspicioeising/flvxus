'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Trash2, X } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { aprovarGeracao, editarRascunho, rejeitarGeracao } from '@/actions/ia';

/**
 * Painel de REVISÃO de um rascunho de IA (dieta/treino/análise). Mostra o
 * rascunho renderizado por `children`, permite EDITAR o JSON do rascunho
 * (revalidado no servidor pelo Zod de saída) e APROVAR (materializa no destino
 * real) ou DESCARTAR. Reusável pelos 3 fluxos da FEAT-005.
 */
export function RevisaoRascunho({
  generationId,
  draft,
  children,
  rotuloAprovar = 'Aprovar e salvar',
  aoAprovar,
}: {
  generationId: string;
  draft: unknown;
  children: React.ReactNode;
  rotuloAprovar?: string;
  /** Callback opcional após aprovar com sucesso (ex.: navegar para o destino). */
  aoAprovar?: (targetId?: string) => void;
}) {
  const router = useRouter();
  const [editando, setEditando] = React.useState(false);
  const [texto, setTexto] = React.useState(() => JSON.stringify(draft, null, 2));
  const [ocupado, setOcupado] = React.useState(false);

  async function salvarEdicao() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(texto);
    } catch {
      toast({ title: 'JSON inválido. Revise o conteúdo.', variant: 'destructive' });
      return;
    }
    setOcupado(true);
    try {
      const r = await editarRascunho(generationId, parsed);
      if (r.ok) {
        toast({ title: r.message ?? 'Rascunho salvo.' });
        setEditando(false);
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível salvar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setOcupado(false);
    }
  }

  async function aprovar() {
    setOcupado(true);
    try {
      const r = await aprovarGeracao(generationId);
      if (r.ok) {
        toast({ title: r.message ?? 'Rascunho aprovado.' });
        if (aoAprovar) aoAprovar(r.id);
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível aprovar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setOcupado(false);
    }
  }

  async function descartar() {
    setOcupado(true);
    try {
      const r = await rejeitarGeracao(generationId);
      if (r.ok) {
        toast({ title: r.message ?? 'Rascunho descartado.' });
        router.refresh();
      } else {
        toast({ title: r.message ?? 'Não foi possível descartar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        Este é um rascunho gerado por IA. Revise e ajuste antes de aprovar — só na
        aprovação ele é salvo para o aluno.
      </div>

      {editando ? (
        <div className="space-y-2">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={16}
            className="font-mono text-xs"
            aria-label="Editar rascunho (JSON)"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="min-h-11" onClick={salvarEdicao} disabled={ocupado}>
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              Salvar edição
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setTexto(JSON.stringify(draft, null, 2));
                setEditando(false);
              }}
              disabled={ocupado}
            >
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div>{children}</div>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="button" className="min-h-11" onClick={aprovar} disabled={ocupado}>
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              {rotuloAprovar}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setEditando(true)}
              disabled={ocupado}
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Editar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-destructive"
              onClick={descartar}
              disabled={ocupado}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Descartar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
