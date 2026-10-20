'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

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
import { fichaSchema } from '@/schemas/treino';
import { criarFicha, editarFicha, type EstadoAcao } from '@/actions/treinos';
import { ItemEditor, type ItemEditavel } from './item-editor';
import type { ExercicioDisponivel } from './exercise-picker';
import { itensEditaveisParaInput } from './form-helpers';

/** Aluno disponível para seleção na ficha. */
export interface AlunoOpcao {
  user_id: string;
  full_name: string | null;
}

export interface FichaFormProps {
  modo: 'criar' | 'editar';
  exercicios: ExercicioDisponivel[];
  alunos: AlunoOpcao[];
  /** Presente no modo editar. */
  planId?: string;
  valoresIniciais?: {
    student_id: string;
    name: string;
    source_workout_id: string | null;
    itens: ItemEditavel[];
  };
}

/**
 * Formulário de FICHA por aluno (criar/editar). Valida com o MESMO schema Zod
 * (`fichaSchema`) antes de enviar. Itens podem ter dia da semana. O status é
 * controlado separadamente (`StatusControl`) após a criação — toda ficha nasce
 * como rascunho e só fica visível ao aluno quando liberada (RLS).
 */
export function FichaForm({
  modo,
  exercicios,
  alunos,
  planId,
  valoresIniciais,
}: FichaFormProps) {
  const router = useRouter();
  const [studentId, setStudentId] = React.useState(
    valoresIniciais?.student_id ?? ''
  );
  const [name, setName] = React.useState(valoresIniciais?.name ?? '');
  const [itens, setItens] = React.useState<ItemEditavel[]>(
    valoresIniciais?.itens ?? []
  );
  const sourceWorkoutId = valoresIniciais?.source_workout_id ?? null;

  const [erroAluno, setErroAluno] = React.useState<string | null>(null);
  const [erroNome, setErroNome] = React.useState<string | null>(null);
  const [erroItens, setErroItens] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErroAluno(null);
    setErroNome(null);
    setErroItens(null);

    const entrada = {
      student_id: studentId,
      name,
      source_workout_id: sourceWorkoutId ?? undefined,
      itens: itensEditaveisParaInput(itens, true),
    };

    const parsed = fichaSchema.safeParse(entrada);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      if (fe.student_id?.[0]) setErroAluno(fe.student_id[0]);
      if (fe.name?.[0]) setErroNome(fe.name[0]);
      if (fe.itens?.[0]) setErroItens(fe.itens[0]);
      toast({ title: 'Verifique os campos destacados.', variant: 'destructive' });
      return;
    }

    setEnviando(true);
    try {
      const r: EstadoAcao =
        modo === 'criar'
          ? await criarFicha(parsed.data)
          : await editarFicha(planId as string, parsed.data);

      if (r.ok) {
        toast({ title: r.message ?? 'Salvo com sucesso.' });
        router.push(r.id ? `/professor/treinos/${r.id}` : '/professor/treinos');
        router.refresh();
        return;
      }
      if (r.fieldErrors?.student_id) setErroAluno(r.fieldErrors.student_id);
      if (r.fieldErrors?.name) setErroNome(r.fieldErrors.name);
      toast({
        title: r.message ?? 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="ficha-aluno">Aluno</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger id="ficha-aluno" aria-invalid={Boolean(erroAluno)}>
            <SelectValue placeholder="Selecione o aluno" />
          </SelectTrigger>
          <SelectContent>
            {alunos.map((aluno) => (
              <SelectItem key={aluno.user_id} value={aluno.user_id}>
                {aluno.full_name ?? 'Aluno sem nome'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {erroAluno ? (
          <p className="text-sm font-medium text-destructive">{erroAluno}</p>
        ) : null}
        {alunos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem alunos. Convide um aluno antes de montar uma ficha.
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ficha-name">Nome da ficha</Label>
        <Input
          id="ficha-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          aria-invalid={Boolean(erroNome)}
          placeholder="Ex.: Treino de hipertrofia - Semana 1"
        />
        {erroNome ? (
          <p className="text-sm font-medium text-destructive">{erroNome}</p>
        ) : null}
      </div>

      {sourceWorkoutId ? (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Esta ficha foi criada a partir de um modelo. Você pode ajustar os
          exercícios e organizar por dia da semana abaixo.
        </p>
      ) : null}

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Exercícios</h2>
        {erroItens ? (
          <p className="text-sm font-medium text-destructive">{erroItens}</p>
        ) : null}
        <ItemEditor
          itens={itens}
          onChange={setItens}
          exercicios={exercicios}
          comDiaSemana
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => router.push('/professor/treinos')}
          disabled={enviando}
        >
          Cancelar
        </Button>
        <Button type="submit" className="min-h-11" disabled={enviando}>
          {enviando
            ? 'Salvando…'
            : modo === 'criar'
              ? 'Criar ficha'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
