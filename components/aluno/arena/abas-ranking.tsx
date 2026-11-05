'use client';

import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface AbasRankingProps {
  /** Ranking do tenant (minha academia), já montado no servidor. */
  minhaAcademia: ReactNode;
  /** Ranking de amigos (conjunto fechado eu+amigos), já montado no servidor. */
  amigos: ReactNode;
  /** Ranking global mensal, já montado no servidor. */
  globalMensal: ReactNode;
  /** Ranking global anual, já montado no servidor. */
  globalAnual: ReactNode;
}

// Estilo DISCRETO das abas (OPÇÃO A): faixa escura; a aba ativa ganha um leve
// realce de fundo e um SUBLINHADO FINO VERDE embaixo; inativas ficam só texto
// cinza. Menos chamativo que o verde chapado anterior. O sublinhado usa uma
// borda inferior transparente nas inativas para não deslocar o layout.
const TRIGGER_CLASSES =
  'rounded-none border-b-2 border-transparent bg-transparent px-2 py-2.5 text-sm font-semibold text-muted-foreground shadow-none transition-colors ' +
  'data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none';

/**
 * Seletor de abas do ranking da Arena. Apenas alterna entre os rankings já
 * renderizados no servidor — não faz fetch próprio. Mobile-first: a lista de
 * abas rola horizontalmente em telas estreitas (são quatro abas desde o G3, com
 * a aba "Amigos" do ranking social).
 */
export function AbasRanking({
  minhaAcademia,
  amigos,
  globalMensal,
  globalAnual,
}: AbasRankingProps) {
  return (
    <Tabs defaultValue="academia" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="academia" className={TRIGGER_CLASSES}>
          Academia
        </TabsTrigger>
        <TabsTrigger value="amigos" className={TRIGGER_CLASSES}>
          Amigos
        </TabsTrigger>
        <TabsTrigger value="mensal" className={TRIGGER_CLASSES}>
          Mensal
        </TabsTrigger>
        <TabsTrigger value="anual" className={TRIGGER_CLASSES}>
          Anual
        </TabsTrigger>
      </TabsList>
      <TabsContent value="academia">{minhaAcademia}</TabsContent>
      <TabsContent value="amigos">{amigos}</TabsContent>
      <TabsContent value="mensal">{globalMensal}</TabsContent>
      <TabsContent value="anual">{globalAnual}</TabsContent>
    </Tabs>
  );
}
