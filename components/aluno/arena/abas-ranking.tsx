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
      <TabsList className="grid h-auto w-full grid-cols-4">
        <TabsTrigger value="academia">Academia</TabsTrigger>
        <TabsTrigger value="amigos">Amigos</TabsTrigger>
        <TabsTrigger value="mensal">Global Mês</TabsTrigger>
        <TabsTrigger value="anual">Global anual</TabsTrigger>
      </TabsList>
      <TabsContent value="academia">{minhaAcademia}</TabsContent>
      <TabsContent value="amigos">{amigos}</TabsContent>
      <TabsContent value="mensal">{globalMensal}</TabsContent>
      <TabsContent value="anual">{globalAnual}</TabsContent>
    </Tabs>
  );
}
