'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { gerarDieta } from '@/actions/ia';
import type { GenerateDietOutput } from '@/schemas/ia/generate-diet';
import { RevisaoRascunho } from './revisao-rascunho';
import { RascunhoDieta } from './rascunho-visualizacoes';

export interface AlunoOpcao {
  user_id: string;
  full_name: string | null;
}

/**
 * Fluxo "Gerar dieta com IA": escolhe aluno + objetivo + restrições, chama a
 * action `gerarDieta` (Edge Function) e, com o rascunho em mãos, mostra o
 * painel de revisão/edição/aprovação. Degrada com mensagem amigável quando a
 * função não está disponível (a action já mapeia o erro).
 */
export function GerarDietaIa({ alunos }: { alunos: AlunoOpcao[] }) {
  const [studentId, setStudentId] = React.useState('');
  const [goal, setGoal] = React.useState('');
  const [restricoes, setRestricoes] = React.useState('');
  const [gerando, setGerando] = React.useState(false);

  const [generationId, setGenerationId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<GenerateDietOutput | null>(null);

  const semAlunos = alunos.length === 0;
  const desabilitado = !studentId || !goal.trim() || gerando;

  async function gerar() {
    if (!studentId || !goal.trim()) return;
    setGerando(true);
    try {
      const restrictions = restricoes
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      const r = await gerarDieta({ student_id: studentId, goal: goal.trim(), restrictions });
      if (r.ok && r.generationId) {
        setGenerationId(r.generationId);
        setDraft(r.draft as GenerateDietOutput);
        toast({ title: r.message ?? 'Rascunho gerado.' });
      } else {
        toast({ title: r.message ?? 'Não foi possível gerar.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setGerando(false);
    }
  }

  function limpar() {
    setGenerationId(null);
    setDraft(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Gerar dieta com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {semAlunos ? (
          <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            Cadastre um aluno para gerar uma dieta.
          </p>
        ) : generationId && draft ? (
          <div className="space-y-4">
            <RevisaoRascunho generationId={generationId} draft={draft} aoAprovar={limpar}>
              <RascunhoDieta draft={draft} />
            </RevisaoRascunho>
            <Button type="button" variant="ghost" className="min-h-11" onClick={limpar}>
              Gerar outra dieta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dieta-aluno">Aluno</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="dieta-aluno">
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.user_id} value={a.user_id}>
                      {a.full_name ?? 'Aluno sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dieta-objetivo">Objetivo</Label>
              <Input
                id="dieta-objetivo"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex.: perda de gordura mantendo massa"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dieta-restricoes">Restrições (separadas por vírgula)</Label>
              <Input
                id="dieta-restricoes"
                value={restricoes}
                onChange={(e) => setRestricoes(e.target.value)}
                placeholder="Ex.: sem lactose, vegetariano"
              />
            </div>

            <Button type="button" className="min-h-11" onClick={gerar} disabled={desabilitado}>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {gerando ? 'Gerando…' : 'Gerar dieta'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
