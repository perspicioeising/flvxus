'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

import { metaSugeridaMl } from '@/lib/habitos/meta-agua';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { definirMetaAgua } from '@/actions/habitos';

export interface EditarMetaAguaProps {
  /** Meta atual salva (ml) ou `null` quando ainda não há. */
  metaAtualMl: number | null;
  /** Peso (kg) da última avaliação, para a sugestão quando não há meta salva. */
  pesoKg: number | null;
}

/**
 * Edição da PRÓPRIA meta de água pelo aluno (vinculado ou autônomo), no início
 * de /aluno, logo abaixo do card de hidratação. Chama
 * `definirMetaAgua(targetMl, source)` SEM `alvoUserId` — a action resolve o alvo
 * para `auth.uid()`, então o aluno só edita a própria meta (nunca a de outro).
 * O campo pré-preenche com a meta salva ou, na ausência, com
 * `metaSugeridaMl(peso)` — mesma UX do card do professor.
 *
 * `source` é best-effort: salvar o valor pré-preenchido SEM editar registra a
 * origem (`derived_weight` quando havia peso, `default` sem peso); qualquer
 * edição manual vira `manual`. Fica recolhido atrás de um botão "Editar meta"
 * para não poluir o card de registro de água no mobile.
 */
export function EditarMetaAgua({ metaAtualMl, pesoKg }: EditarMetaAguaProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();
  const [aberto, setAberto] = React.useState(false);

  // Pré-preenchimento: meta salva prevalece; senão a sugestão pelo peso.
  const sugerida = metaSugeridaMl(pesoKg);
  const inicial = metaAtualMl ?? sugerida;
  const [valor, setValor] = React.useState(String(inicial));

  function salvar() {
    const alvo = Number(valor);
    if (!Number.isFinite(alvo)) {
      toast({ title: 'Informe uma meta válida.', variant: 'destructive' });
      return;
    }

    // Origem best-effort: valor igual ao pré-preenchido SEM meta salva →
    // derivado do peso (ou default sem peso); caso contrário, manual.
    const semEdicao = metaAtualMl == null && alvo === inicial;
    const source: 'manual' | 'derived_weight' | 'default' = semEdicao
      ? pesoKg
        ? 'derived_weight'
        : 'default'
      : 'manual';

    iniciar(async () => {
      // SEM alvoUserId: a action grava para auth.uid() (a própria meta).
      const r = await definirMetaAgua(alvo, source);
      if (r.ok) {
        toast({ title: r.message ?? 'Meta salva.' });
        setAberto(false);
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível salvar a meta.',
          variant: 'destructive',
        });
      }
    });
  }

  if (!aberto) {
    return (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 text-muted-foreground"
          onClick={() => setAberto(true)}
        >
          <Pencil className="mr-1 h-4 w-4" aria-hidden="true" />
          Editar meta
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        {metaAtualMl != null
          ? `Meta atual: ${metaAtualMl} ml por dia.`
          : `Ainda sem meta salva. Sugestão pelo peso: ${sugerida} ml.`}
      </p>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="aluno-meta-agua-ml">Meta de água (ml)</Label>
          <Input
            id="aluno-meta-agua-ml"
            type="number"
            inputMode="numeric"
            min={250}
            max={20000}
            step={50}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={pendente}
          />
        </div>
        <Button
          type="button"
          className="min-h-11"
          onClick={salvar}
          disabled={pendente}
        >
          {pendente ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 text-muted-foreground"
          onClick={() => setAberto(false)}
          disabled={pendente}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
