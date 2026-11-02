'use client';

import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface AbasRankingProps {
  /** Ranking do tenant (minha academia), já montado no servidor. */
  minhaAcademia: ReactNode;
  /** Ranking global mensal, já montado no servidor. */
  globalMensal: ReactNode;
  /** Ranking global anual, já montado no servidor. */
  globalAnual: ReactNode;
}

/**
 * Seletor de abas do ranking da Arena. Apenas alterna entre os três rankings
 * já renderizados no servidor — não faz fetch próprio. Mobile-first: a lista de
 * abas ocupa toda a largura em telas pequenas.
 */
export function AbasRanking({
  minhaAcademia,
  globalMensal,
  globalAnual,
}: AbasRankingProps) {
  return (
    <Tabs defaultValue="academia" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-3">
        <TabsTrigger value="academia">Minha academia</TabsTrigger>
        <TabsTrigger value="mensal">Global mensal</TabsTrigger>
        <TabsTrigger value="anual">Global anual</TabsTrigger>
      </TabsList>
      <TabsContent value="academia">{minhaAcademia}</TabsContent>
      <TabsContent value="mensal">{globalMensal}</TabsContent>
      <TabsContent value="anual">{globalAnual}</TabsContent>
    </Tabs>
  );
}
