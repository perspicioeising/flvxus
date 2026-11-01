'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Dumbbell,
  GripVertical,
  Trash2,
} from 'lucide-react';

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { EmptyState } from '@/components/patterns';
import type { SetKind } from '@/types/database.types';
import { cn } from '@/lib/utils';
import { SET_KINDS } from '@/schemas/treino';
import { DIAS_SEMANA, SET_KIND_LABEL } from './labels';
import { ExercisePicker, type ExercicioDisponivel } from './exercise-picker';

/** Valor sem dia da semana no Select (o Radix não aceita value vazio). */
const SEM_DIA = 'none';

/** Valor sem divisão definida no Select (o Radix não aceita value vazio). */
const SEM_DIVISAO = 'none';

/** Rótulos de divisão disponíveis no seletor (A/B/C/D/E). */
const DIVISOES = ['A', 'B', 'C', 'D', 'E'] as const;

/** Uma SÉRIE detalhada no editor (tipo + observação por série). */
export interface SerieEditavel {
  set_number: number;
  kind: SetKind;
  note: string;
  target_reps?: string;
  target_load?: string;
}

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
  /** Apenas quando `comDivisao` — rótulo da divisão (ex.: 'A') ou null. */
  division?: string | null;
  /**
   * Séries detalhadas (tipo + observação). Ausente/vazio = usa o padrão
   * ('Trabalho', sem observação) na execução. Materializada sob demanda ao
   * expandir o bloco "Configurar séries individualmente".
   */
  series?: SerieEditavel[];
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
    division: null,
  };
}

/** Converte o campo `sets` (string) num inteiro >= 0, ou `null` se não numérico. */
function quantidadeSeries(sets: string): number | null {
  if (sets.trim() === '') return null;
  const n = Number(sets);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

/**
 * Sincroniza o array `series` de um item com a quantidade `sets`: cresce
 * acrescentando linhas 'work' no fim, encolhe cortando o fim. Preserva as
 * linhas existentes (tipo/observação já configurados). Retorna o array ajustado
 * — ou o mesmo array se nada mudou.
 */
function sincronizarSeries(
  series: SerieEditavel[],
  quantidade: number
): SerieEditavel[] {
  if (series.length === quantidade) return series;
  if (series.length > quantidade) {
    return series.slice(0, quantidade);
  }
  const proximo = [...series];
  for (let n = series.length + 1; n <= quantidade; n += 1) {
    proximo.push({ set_number: n, kind: 'work', note: '' });
  }
  return proximo;
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
  comDivisao = false,
}: {
  itens: ItemEditavel[];
  onChange: (itens: ItemEditavel[]) => void;
  exercicios: ExercicioDisponivel[];
  comDiaSemana?: boolean;
  comDivisao?: boolean;
}) {
  function adicionar(exercicio: ExercicioDisponivel) {
    onChange([...itens, novoItem(exercicio)]);
  }

  function atualizar(indice: number, patch: Partial<ItemEditavel>) {
    onChange(itens.map((item, i) => (i === indice ? { ...item, ...patch } : item)));
  }

  /**
   * Atualiza o campo `sets` e, quando o item já tem séries materializadas,
   * re-sincroniza o array `series` com a nova quantidade (cresce com default
   * 'work', encolhe pelo fim). `sets` vazio/não numérico não materializa; `0`
   * zera as linhas.
   */
  function atualizarSets(indice: number, valor: string) {
    onChange(
      itens.map((item, i) => {
        if (i !== indice) return item;
        const proximo: ItemEditavel = { ...item, sets: valor };
        if (item.series !== undefined) {
          const quantidade = quantidadeSeries(valor);
          proximo.series =
            quantidade === null
              ? item.series
              : sincronizarSeries(item.series, quantidade);
        }
        return proximo;
      })
    );
  }

  /** Alterna a configuração de séries individuais de um item. */
  function alternarSeries(indice: number, aberto: boolean) {
    onChange(
      itens.map((item, i) => {
        if (i !== indice) return item;
        if (!aberto) {
          // Recolher descarta a configuração detalhada (volta ao padrão).
          const { series: _descartado, ...resto } = item;
          void _descartado;
          return resto;
        }
        const quantidade = quantidadeSeries(item.sets) ?? 0;
        return { ...item, series: sincronizarSeries(item.series ?? [], quantidade) };
      })
    );
  }

  /** Atualiza uma série específica de um item. */
  function atualizarSerie(
    indice: number,
    setNumber: number,
    patch: Partial<SerieEditavel>
  ) {
    onChange(
      itens.map((item, i) => {
        if (i !== indice || !item.series) return item;
        return {
          ...item,
          series: item.series.map((serie) =>
            serie.set_number === setNumber ? { ...serie, ...patch } : serie
          ),
        };
      })
    );
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
                    onChange={(e) => atualizarSets(indice, e.target.value)}
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

              {comDivisao ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.key}-division`}>Divisão</Label>
                  <Select
                    value={item.division == null || item.division === '' ? SEM_DIVISAO : item.division}
                    onValueChange={(valor) =>
                      atualizar(indice, {
                        division: valor === SEM_DIVISAO ? null : valor,
                      })
                    }
                  >
                    <SelectTrigger id={`${item.key}-division`} className="sm:w-56">
                      <SelectValue placeholder="Divisão única" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEM_DIVISAO}>Divisão única</SelectItem>
                      {DIVISOES.map((divisao) => (
                        <SelectItem key={divisao} value={divisao}>
                          Divisão {divisao}
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

              {/* Configuração de séries individuais (tipo + observação por
                  série). Materializa N linhas ao expandir, onde N = `sets`.
                  Recolher volta ao padrão ('Trabalho', sem observação). */}
              <Collapsible
                open={item.series !== undefined}
                onOpenChange={(aberto) => alternarSeries(indice, aberto)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-full justify-between"
                  >
                    Configurar séries individualmente
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        item.series !== undefined && 'rotate-180'
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  {item.series === undefined || item.series.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Informe a quantidade de séries acima para configurar cada
                      uma individualmente.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {item.series.map((serie) => (
                        <li
                          key={serie.set_number}
                          className="space-y-3 rounded-xl border border-border bg-background p-3"
                        >
                          <p className="text-sm font-medium text-foreground">
                            Série {serie.set_number}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label htmlFor={`${item.key}-set-${serie.set_number}-kind`}>
                                Tipo
                              </Label>
                              <Select
                                value={serie.kind}
                                onValueChange={(valor) =>
                                  atualizarSerie(indice, serie.set_number, {
                                    kind: valor as SetKind,
                                  })
                                }
                              >
                                <SelectTrigger
                                  id={`${item.key}-set-${serie.set_number}-kind`}
                                  className="min-h-11"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SET_KINDS.map((kind) => (
                                    <SelectItem key={kind} value={kind}>
                                      {SET_KIND_LABEL[kind]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor={`${item.key}-set-${serie.set_number}-note`}>
                                Observação
                              </Label>
                              <Input
                                id={`${item.key}-set-${serie.set_number}-note`}
                                className="min-h-11"
                                value={serie.note}
                                onChange={(e) =>
                                  atualizarSerie(indice, serie.set_number, {
                                    note: e.target.value,
                                  })
                                }
                                placeholder="Ex.: carga leve, foco na técnica"
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ol>
      )}

      <ExercisePicker exercicios={exercicios} onSelecionar={adicionar} />
    </div>
  );
}
