'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, Moon, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { RotationStepInput } from '@/schemas/treino';

/**
 * Editor da SEQUÊNCIA DE ROTAÇÃO da ficha (FEAT-003): o professor organiza a
 * ordem em que o aluno roda as divisões e INTERCALA dias de descanso
 * (ex.: A → B → descanso → C). Só faz sentido para fichas POR DIVISÃO; o pai
 * (`ficha-form`) só renderiza este editor quando há pelo menos uma divisão e
 * nenhum item "sem divisão" (regra R3 do `fichaSchema`).
 *
 * Controlado pelo formulário pai via `value`/`onChange`:
 *   - `value === null` → rotação automática (derivada): sem descanso, o aluno
 *     roda as divisões na ordem padrão. Ligar o editor materializa a sequência.
 *   - `value` array → sequência explícita (passos `division`/`rest`).
 *
 * As divisões detectadas são a fonte da verdade dos passos de divisão: quando
 * elas mudam (o professor adicionou/removeu uma divisão nos itens), a sequência
 * é reconciliada — divisões novas entram no fim, removidas saem, descansos
 * existentes são preservados pela posição relativa.
 */
export interface RotationEditorProps {
  /** Rótulos de divisão detectados nos itens (ordenados, ex.: ['A','B','C']). */
  divisoes: string[];
  /** Sequência atual (ou `null` para rotação automática). */
  value: RotationStepInput[] | null;
  onChange: (value: RotationStepInput[] | null) => void;
}

/** Monta a sequência padrão: todas as divisões na ordem, sem descanso. */
function sequenciaPadrao(divisoes: string[]): RotationStepInput[] {
  return divisoes.map((label) => ({ type: 'division', label }));
}

/**
 * Reconcilia a sequência com as divisões detectadas: remove passos de divisão
 * cujo rótulo não existe mais e acrescenta ao fim as divisões que ainda não
 * aparecem. Preserva descansos e a ordem relativa dos passos mantidos.
 */
function reconciliar(
  steps: RotationStepInput[],
  divisoes: string[]
): RotationStepInput[] {
  const set = new Set(divisoes);
  const mantidos = steps.filter(
    (s) => s.type === 'rest' || (s.type === 'division' && set.has(s.label))
  );
  const jaPresentes = new Set(
    mantidos
      .filter((s): s is { type: 'division'; label: string } => s.type === 'division')
      .map((s) => s.label)
  );
  const faltando = divisoes.filter((d) => !jaPresentes.has(d));
  return [
    ...mantidos,
    ...faltando.map((label) => ({ type: 'division' as const, label })),
  ];
}

export function RotationEditor({ divisoes, value, onChange }: RotationEditorProps) {
  const ativo = value !== null;

  // Sequência efetiva exibida: reconciliada com as divisões atuais quando ativa.
  const steps = React.useMemo(
    () => (value !== null ? reconciliar(value, divisoes) : sequenciaPadrao(divisoes)),
    [value, divisoes]
  );

  function alternar(aberto: boolean) {
    onChange(aberto ? sequenciaPadrao(divisoes) : null);
  }

  function atualizar(proximo: RotationStepInput[]) {
    onChange(proximo);
  }

  function adicionarDescanso(indice: number) {
    const proximo = [...steps];
    proximo.splice(indice + 1, 0, { type: 'rest' });
    atualizar(proximo);
  }

  function removerDescanso(indice: number) {
    atualizar(steps.filter((_, i) => i !== indice));
  }

  function mover(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= steps.length) return;
    const copia = [...steps];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    atualizar(copia);
  }

  return (
    <Collapsible open={ativo} onOpenChange={alternar}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 w-full justify-between">
          Sugerir dias de descanso na rotação
          <Moon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3">
        <p className="text-sm text-muted-foreground">
          Organize a ordem em que o aluno roda as divisões e intercale dias de
          descanso. Ao concluir uma divisão, a próxima da sequência fica em
          destaque; quando o próximo passo é um descanso, o aluno vê o aviso
          &ldquo;Hoje é descanso&rdquo;.
        </p>

        <ol className="space-y-2">
          {steps.map((step, indice) => (
            <li
              key={`${step.type}-${step.type === 'division' ? step.label : 'rest'}-${indice}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              {step.type === 'division' ? (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xl font-black text-primary-soft-foreground">
                  {step.label}
                </span>
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Moon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {step.type === 'division' ? `Divisão ${step.label}` : 'Descanso'}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  aria-label={`Mover passo ${indice + 1} para cima`}
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
                  aria-label={`Mover passo ${indice + 1} para baixo`}
                  disabled={indice === steps.length - 1}
                  onClick={() => mover(indice, 1)}
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </Button>
                {step.type === 'rest' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-destructive"
                    aria-label={`Remover descanso na posição ${indice + 1}`}
                    onClick={() => removerDescanso(indice)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    aria-label={`Adicionar descanso após a divisão ${step.label}`}
                    onClick={() => adicionarDescanso(indice)}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}
