'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Droplets } from 'lucide-react';

import { metaSugeridaMl } from '@/lib/habitos/meta-agua';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { definirMetaAgua } from '@/actions/habitos';
import {
  CamposLembreteAgua,
  LEMBRETES_AGUA_PADRAO,
  type LembretesAguaValor,
} from '@/components/aluno/habitos/campos-lembrete-agua';

export interface MetaAguaAlunoProps {
  /** `user_id` do aluno-alvo. */
  alunoId: string;
  /** Meta atual salva (ml) ou `null` quando ainda não há. */
  metaAtualMl: number | null;
  /** Peso (kg) da última avaliação, para a sugestão quando não há meta salva. */
  pesoKg: number | null;
  /** Lembretes de água salvos (Agenda) ou `null` para os padrões. */
  lembretesAtuais?: LembretesAguaValor | null;
}

/**
 * Card "Meta de água" na ficha do aluno (G2). O professor define/edita a meta de
 * hidratação do aluno chamando `definirMetaAgua(targetMl, source, alunoId)` — a
 * RLS valida o vínculo trainer→student do tenant. O campo pré-preenche com a
 * meta salva ou, na ausência, com `metaSugeridaMl(peso)`.
 *
 * `source` é best-effort: se o professor salvar o valor pré-preenchido SEM
 * editar, registramos a origem (`derived_weight` quando havia peso, `default`
 * quando não); qualquer edição manual vira `manual`.
 */
export function MetaAguaAluno({ alunoId, metaAtualMl, pesoKg, lembretesAtuais }: MetaAguaAlunoProps) {
  const router = useRouter();
  const [pendente, iniciar] = React.useTransition();

  // Pré-preenchimento: meta salva prevalece; senão a sugestão pelo peso.
  const sugerida = metaSugeridaMl(pesoKg);
  const inicial = metaAtualMl ?? sugerida;
  const [valor, setValor] = React.useState(String(inicial));
  const [lembretes, setLembretes] = React.useState<LembretesAguaValor>(
    lembretesAtuais ?? LEMBRETES_AGUA_PADRAO
  );

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
      const r = await definirMetaAgua(alvo, source, alunoId, lembretes);
      if (r.ok) {
        toast({ title: r.message ?? 'Meta salva.' });
        router.refresh();
      } else {
        toast({
          title: r.message ?? 'Não foi possível salvar a meta.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Droplets className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-bold text-foreground">Meta de água</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {metaAtualMl != null
          ? `Meta atual: ${metaAtualMl} ml por dia.`
          : `Ainda sem meta salva. Sugestão pelo peso: ${sugerida} ml.`}
      </p>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="meta-agua-ml">Meta de água (ml)</Label>
          <Input
            id="meta-agua-ml"
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
      <CamposLembreteAgua
        idPrefixo="aluno-alvo-agua"
        valor={lembretes}
        onChange={setLembretes}
        disabled={pendente}
      />
    </div>
  );
}
