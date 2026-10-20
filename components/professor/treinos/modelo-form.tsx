'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { modeloSchema } from '@/schemas/treino';
import { criarModelo, editarModelo, type EstadoAcao } from '@/actions/treinos';
import { ItemEditor, type ItemEditavel } from './item-editor';
import type { ExercicioDisponivel } from './exercise-picker';
import { itensEditaveisParaInput } from './form-helpers';

export interface ModeloFormProps {
  modo: 'criar' | 'editar';
  exercicios: ExercicioDisponivel[];
  /** Presente no modo editar. */
  workoutId?: string;
  valoresIniciais?: {
    name: string;
    description: string;
    itens: ItemEditavel[];
  };
}

/**
 * Formulário de MODELO de treino (criar/editar). Monta a entrada e valida com o
 * MESMO schema Zod (`modeloSchema`) da Server Action antes de enviar, exibindo
 * erros de validação inline. Mobile-first e acessível.
 */
export function ModeloForm({
  modo,
  exercicios,
  workoutId,
  valoresIniciais,
}: ModeloFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(valoresIniciais?.name ?? '');
  const [description, setDescription] = React.useState(
    valoresIniciais?.description ?? ''
  );
  const [itens, setItens] = React.useState<ItemEditavel[]>(
    valoresIniciais?.itens ?? []
  );
  const [erroNome, setErroNome] = React.useState<string | null>(null);
  const [erroItens, setErroItens] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErroNome(null);
    setErroItens(null);

    const entrada = {
      name,
      description,
      itens: itensEditaveisParaInput(itens, false),
    };

    const parsed = modeloSchema.safeParse(entrada);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      if (fe.name?.[0]) setErroNome(fe.name[0]);
      if (fe.itens?.[0]) setErroItens(fe.itens[0]);
      toast({ title: 'Verifique os campos destacados.', variant: 'destructive' });
      return;
    }

    setEnviando(true);
    try {
      const r: EstadoAcao =
        modo === 'criar'
          ? await criarModelo(parsed.data)
          : await editarModelo(workoutId as string, parsed.data);

      if (r.ok) {
        toast({ title: r.message ?? 'Salvo com sucesso.' });
        router.push('/professor/modelos-treino');
        router.refresh();
        return;
      }
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
        <Label htmlFor="modelo-name">Nome do modelo</Label>
        <Input
          id="modelo-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          aria-invalid={Boolean(erroNome)}
          aria-describedby={erroNome ? 'modelo-name-erro' : undefined}
        />
        {erroNome ? (
          <p id="modelo-name-erro" className="text-sm font-medium text-destructive">
            {erroNome}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="modelo-description">Descrição (opcional)</Label>
        <Textarea
          id="modelo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Para que serve este modelo, foco muscular, etc."
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Exercícios</h2>
        {erroItens ? (
          <p className="text-sm font-medium text-destructive">{erroItens}</p>
        ) : null}
        <ItemEditor itens={itens} onChange={setItens} exercicios={exercicios} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => router.push('/professor/modelos-treino')}
          disabled={enviando}
        >
          Cancelar
        </Button>
        <Button type="submit" className="min-h-11" disabled={enviando}>
          {enviando
            ? 'Salvando…'
            : modo === 'criar'
              ? 'Criar modelo'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
