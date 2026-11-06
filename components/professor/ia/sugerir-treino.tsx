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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { sugerirTreino } from '@/actions/ia';
import type { SuggestWorkoutOutput } from '@/schemas/ia/suggest-workout';
import { RevisaoRascunho } from './revisao-rascunho';
import { RascunhoTreino } from './rascunho-visualizacoes';
import { useAcesso } from '@/components/billing/acesso-provider';

export interface AlunoOpcao {
  user_id: string;
  full_name: string | null;
}

const NIVEIS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
] as const;

/**
 * Diálogo "Sugerir treino com IA": escolhe aluno + objetivo + nível + dias por
 * semana, chama `sugerirTreino` e mostra o rascunho para revisão/aprovação
 * (aprovar materializa em `workout_plans` como rascunho). Degrada com mensagem
 * amigável quando a função não está disponível.
 */
export function SugerirTreinoIa({
  alunos,
  alunoFixo,
}: {
  alunos: AlunoOpcao[];
  /**
   * Quando presente (aluno autônomo), esconde o Select de aluno e usa este id
   * como `student_id`; o bloqueio "cadastre um aluno" (semAlunos) não aplica.
   */
  alunoFixo?: string;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [studentId, setStudentId] = React.useState(alunoFixo ?? '');
  const [goal, setGoal] = React.useState('');
  const [nivel, setNivel] = React.useState('');
  const [dias, setDias] = React.useState('3');
  const [equipamentos, setEquipamentos] = React.useState('');
  const [foco, setFoco] = React.useState('');
  const [gerando, setGerando] = React.useState(false);

  const [generationId, setGenerationId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<SuggestWorkoutOutput | null>(null);

  // Para o autônomo, nunca bloqueia por "sem alunos" (ele é o próprio aluno).
  const semAlunos = !alunoFixo && alunos.length === 0;
  const diasNum = Number.parseInt(dias, 10);
  const { podeEscrever } = useAcesso();
  const desabilitado =
    !studentId || !goal.trim() || !nivel || !Number.isFinite(diasNum) || gerando || !podeEscrever;

  async function gerar() {
    if (desabilitado) return;
    setGerando(true);
    try {
      // Campos opcionais: só enviam quando preenchidos (vazios = sem efeito).
      const equipamentosLista = equipamentos
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
      const focoLimpo = foco.trim();
      const r = await sugerirTreino({
        student_id: studentId,
        goal: goal.trim(),
        experience_level: nivel,
        days_per_week: diasNum,
        ...(equipamentosLista.length > 0 ? { available_equipment: equipamentosLista } : {}),
        ...(focoLimpo ? { focus: focoLimpo } : {}),
      });
      if (r.ok && r.generationId) {
        setGenerationId(r.generationId);
        setDraft(r.draft as SuggestWorkoutOutput);
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

  function resetar() {
    setGenerationId(null);
    setDraft(null);
    setEquipamentos('');
    setFoco('');
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        if (!v) resetar();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={semAlunos}
          title={semAlunos ? 'Cadastre um aluno primeiro.' : undefined}
        >
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          Sugerir treino com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sugerir treino com IA</DialogTitle>
          <DialogDescription>
            {alunoFixo
              ? 'Gere um rascunho de treino. Você revisa e ajusta antes de salvar.'
              : 'Gere um rascunho de treino. Você revisa e aprova antes de liberar para o aluno.'}
          </DialogDescription>
        </DialogHeader>

        {generationId && draft ? (
          <RevisaoRascunho
            generationId={generationId}
            draft={draft}
            rotuloAprovar="Aprovar e criar ficha"
            aoAprovar={() => setAberto(false)}
          >
            <RascunhoTreino draft={draft} />
          </RevisaoRascunho>
        ) : (
          <div className="space-y-4">
            {alunoFixo ? null : (
              <div className="space-y-1.5">
                <Label htmlFor="treino-aluno">Aluno</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger id="treino-aluno">
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
            )}

            <div className="space-y-1.5">
              <Label htmlFor="treino-objetivo">Objetivo</Label>
              <Input
                id="treino-objetivo"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex.: hipertrofia de membros inferiores"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="treino-nivel">Nível</Label>
                <Select value={nivel} onValueChange={setNivel}>
                  <SelectTrigger id="treino-nivel">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEIS.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="treino-dias">Dias por semana</Label>
                <Input
                  id="treino-dias"
                  type="number"
                  min={1}
                  max={7}
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="treino-equipamentos">Equipamentos disponíveis (opcional)</Label>
              <Input
                id="treino-equipamentos"
                value={equipamentos}
                onChange={(e) => setEquipamentos(e.target.value)}
                placeholder="Ex.: halteres, barra, elástico (separe por vírgula)"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="treino-foco">Foco / divisão desejada (opcional)</Label>
              <Input
                id="treino-foco"
                value={foco}
                onChange={(e) => setFoco(e.target.value)}
                placeholder="Ex.: ABC, push/pull/legs, ênfase em superiores"
              />
            </div>

            <Button type="button" className="min-h-11" onClick={gerar} disabled={desabilitado}>
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {gerando ? 'Gerando…' : 'Gerar treino'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
