'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/** Uma opção de dia/divisão com itens, para o seletor. */
export interface OpcaoDia {
  /** Dia da semana (0..6) ou `null` para o balde "Sem dia definido". */
  weekday: number | null;
  /** Rótulo pt-BR do dia (ou "Sem dia definido"). */
  rotulo: string;
  /** Quantidade de exercícios desse dia (para o resumo). */
  total: number;
}

/** Chave estável do valor selecionado (evita ambiguidade do `null`). */
function chave(weekday: number | null): string {
  return weekday === null ? 'sem-dia' : String(weekday);
}

/**
 * Seletor de dia/divisão da ficha (Client Component). Mostra SÓ os dias que têm
 * exercícios (incluindo o balde "Sem dia definido") e avisa o pai qual foi
 * escolhido. Mobile-first: alvos ≥ 44px, sem depender de hover; marca o ativo
 * com `aria-pressed` para acessibilidade.
 */
export function SeletorDia({
  opcoes,
  selecionado,
  onSelecionar,
}: {
  opcoes: OpcaoDia[];
  selecionado: number | null;
  onSelecionar: (weekday: number | null) => void;
}) {
  if (opcoes.length <= 1) return null;

  return (
    <div
      role="group"
      aria-label="Escolha o dia do treino"
      className="flex flex-wrap gap-2"
    >
      {opcoes.map((opcao) => {
        const ativo = chave(opcao.weekday) === chave(selecionado);
        return (
          <button
            key={chave(opcao.weekday)}
            type="button"
            aria-pressed={ativo}
            onClick={() => onSelecionar(opcao.weekday)}
            className={cn(
              'min-h-11 rounded-full border px-4 text-sm font-medium transition-colors',
              ativo
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            )}
          >
            {opcao.rotulo}
            <span className={cn('ml-1.5', ativo ? 'opacity-80' : 'text-muted-foreground')}>
              ({opcao.total})
            </span>
          </button>
        );
      })}
    </div>
  );
}
