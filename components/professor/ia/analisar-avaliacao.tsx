'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { analisarAvaliacao } from '@/actions/ia';
import type { AnalyzeAssessmentOutput } from '@/schemas/ia/analyze-assessment';
import { RevisaoRascunho } from './revisao-rascunho';
import { RascunhoAnalise } from './rascunho-visualizacoes';

/**
 * Botão real "Analisar com IA" (substitui o `AnalisarIaStub`). Dispara
 * `analisarAvaliacao` para a avaliação atual e mostra o rascunho de análise
 * para revisão/aprovação (aprovar grava em
 * `physical_assessments.ai_analysis/ai_recommendations`). Degrada com mensagem
 * amigável quando a função de IA não está disponível.
 */
export function AnalisarAvaliacaoIa({ assessmentId }: { assessmentId: string }) {
  const [analisando, setAnalisando] = React.useState(false);
  const [generationId, setGenerationId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<AnalyzeAssessmentOutput | null>(null);

  async function analisar() {
    setAnalisando(true);
    try {
      const r = await analisarAvaliacao({ assessment_id: assessmentId });
      if (r.ok && r.generationId) {
        setGenerationId(r.generationId);
        setDraft(r.draft as AnalyzeAssessmentOutput);
        toast({ title: r.message ?? 'Rascunho gerado.' });
      } else {
        toast({ title: r.message ?? 'Não foi possível analisar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setAnalisando(false);
    }
  }

  if (generationId && draft) {
    return (
      <RevisaoRascunho
        generationId={generationId}
        draft={draft}
        rotuloAprovar="Aprovar análise"
        aoAprovar={() => {
          setGenerationId(null);
          setDraft(null);
        }}
      >
        <RascunhoAnalise draft={draft} />
      </RevisaoRascunho>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11"
      onClick={analisar}
      disabled={analisando}
    >
      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
      {analisando ? 'Analisando…' : 'Analisar avaliação com IA'}
    </Button>
  );
}
