'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/** Uma opção de divisão com itens, para o seletor. */
export interface OpcaoDivisao {
  /** Rótulo da divisão (ex.: 'A') ou `null` para o balde "Divisão única". */
  division: string | null;
  /** Rótulo exibível da divisão (o próprio valor ou "Divisão única"). */
  rotulo: string;
  /** Quantidade de exercícios dessa divisão (para o resumo). */
  total: number;
}

/**
 * Seletor de DIVISÃO da ficha (Client Component). Mostra SÓ as divisões que têm
 * exercícios (incluindo o balde "Divisão única") e avisa o pai qual foi
 * escolhida. Mobile-first: alvos ≥ 44px, sem depender de hover; marca a ativa
 * com `aria-pressed` para acessibilidade. Esconde-se quando há ≤ 1 opção.
 *
 * Espelha `SeletorDia`, mas a chave do valor é o próprio rótulo de texto da
 * divisão (não há ambiguidade de `null` como no dia numérico).
 */
export function SeletorDivisao({
  opcoes,
  selecionado,
  onSelecionar,
}: {
  opcoes: OpcaoDivisao[];
  selecionado: string | null;
  onSelecionar: (division: string | null) => void;
}) {
  if (opcoes.length <= 1) return null;

  return (
    <div
      role="group"
      aria-label="Escolha a divisão do treino"
      className="flex flex-wrap gap-2"
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.division === selecionado;
        return (
          <button
            key={opcao.rotulo}
            type="button"
            aria-pressed={ativo}
            onClick={() => onSelecionar(opcao.division)}
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
