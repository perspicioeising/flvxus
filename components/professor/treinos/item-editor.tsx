'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Dumbbell, GripVertical, Trash2 } from 'lucide-react';

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
import { EmptyState } from '@/components/patterns';
import { DIAS_SEMANA } from './labels';
import { ExercisePicker, type ExercicioDisponivel } from './exercise-picker';

/** Valor sem dia da semana no Select (o Radix não aceita value vazio). */
const SEM_DIA = 'none';

/** Um item de prescrição no editor (modelo ou ficha). */
export interface ItemEditavel {
  /** Chave estável para o React (não é persistida). */
  key: string;
  exercise_id: string;
  exercise_name: string;
  sets: string;
  reps: string;
  rest_seconds: string;
  target_load: string;
  notes: string;
  /** Apenas quando `comDiaSemana` — dia da semana (0..6) ou null. */
  weekday: number | null;
}

/** Cria um item vazio a partir do exercício escolhido. */
export function novoItem(exercicio: ExercicioDisponivel): ItemEditavel {
  return {
    key: `${exercicio.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    exercise_id: exercicio.id,
    exercise_name: exercicio.name,
    sets: '',
    reps: '',
    rest_seconds: '',
    target_load: '',
    notes: '',
    weekday: null,
  };
}

/**
 * Editor da lista de exercícios de um treino. Controlado pelo formulário pai.
 *
 * Reordenação por controles ACESSÍVEIS subir/descer (botões com `aria-label`,
 * navegáveis por teclado) — o caminho obrigatório desta feature; drag-and-drop
 * ficaria como melhoria opcional. `comDiaSemana` liga o seletor de dia (usado
 * nas fichas por aluno; os modelos não têm dia).
 */
export function ItemEditor({
  itens,
  onChange,
  exercicios,
  comDiaSemana = false,
}: {
  itens: ItemEditavel[];
  onChange: (itens: ItemEditavel[]) => void;
  exercicios: ExercicioDisponivel[];
  comDiaSemana?: boolean;
}) {
  function adicionar(exercicio: ExercicioDisponivel) {
    onChange([...itens, novoItem(exercicio)]);
  }

  function atualizar(indice: number, patch: Partial<ItemEditavel>) {
    onChange(itens.map((item, i) => (i === indice ? { ...item, ...patch } : item)));
  }

  function remover(indice: number) {
    onChange(itens.filter((_, i) => i !== indice));
  }

  function mover(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= itens.length) return;
    const copia = [...itens];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    onChange(copia);
  }

  return (
    <div className="space-y-4">
      {itens.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum exercício adicionado"
          description="Use o botão abaixo para incluir exercícios da sua biblioteca."
        />
      ) : (
        <ol className="space-y-3">
          {itens.map((item, indice) => (
            <li
              key={item.key}
              className="rounded-2xl border border-border bg-card p-4 space-y-4"
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 hidden text-muted-foreground sm:block"
                  aria-hidden="true"
                >
                  <GripVertical className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    <span className="text-muted-foreground">{indice + 1}.</span>{' '}
                    {item.exercise_name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    aria-label={`Mover ${item.exercise_name} para cima`}
                    disabled={indice === 0}
                    onClick={() => mover(indice, -1)}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    aria-label={`Mover ${item.exercise_name} para baixo`}
                    disabled={indice === itens.length - 1}
                    onClick={() => mover(indice, 1)}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-destructive"
                    aria-label={`Remover ${item.exercise_name}`}
                    onClick={() => remover(indice)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.key}-sets`}>Séries</Label>
                  <Input
                    id={`${item.key}-sets`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={item.sets}
                    onChange={(e) => atualizar(indice, { sets: e.target.value })}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.key}-reps`}>Repetições</Label>
                  <Input
                    id={`${item.key}-reps`}
                    value={item.reps}
                    onChange={(e) => atualizar(indice, { reps: e.target.value })}
                    placeholder="8-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.key}-rest`}>Descanso (s)</Label>
                  <Input
                    id={`${item.key}-rest`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={item.rest_seconds}
                    onChange={(e) => atualizar(indice, { rest_seconds: e.target.value })}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.key}-load`}>Carga (kg)</Label>
                  <Input
                    id={`${item.key}-load`}
                    inputMode="decimal"
                    value={item.target_load}
                    onChange={(e) => atualizar(indice, { target_load: e.target.value })}
                    placeholder="40"
                  />
                </div>
              </div>

              {comDiaSemana ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.key}-weekday`}>Dia da semana</Label>
                  <Select
                    value={item.weekday === null ? SEM_DIA : String(item.weekday)}
                    onValueChange={(valor) =>
                      atualizar(indice, {
                        weekday: valor === SEM_DIA ? null : Number(valor),
                      })
                    }
                  >
                    <SelectTrigger id={`${item.key}-weekday`} className="sm:w-56">
                      <SelectValue placeholder="Sem dia definido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEM_DIA}>Sem dia definido</SelectItem>
                      {DIAS_SEMANA.map((dia) => (
                        <SelectItem key={dia.valor} value={String(dia.valor)}>
                          {dia.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor={`${item.key}-notes`}>Observações</Label>
                <Input
                  id={`${item.key}-notes`}
                  value={item.notes}
                  onChange={(e) => atualizar(indice, { notes: e.target.value })}
                  placeholder="Cadência, técnica, etc."
                />
              </div>
            </li>
          ))}
        </ol>
      )}

      <ExercisePicker exercicios={exercicios} onSelecionar={adicionar} />
    </div>
  );
}
