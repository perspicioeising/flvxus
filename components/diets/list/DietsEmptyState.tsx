// /components/diets/components/list/DietsEmptyState.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Utensils, Search } from 'lucide-react';
import type { DietsEmptyStateProps } from '../types';

export function DietsEmptyState({ 
  hasFilters, 
  onCreateNew,
  onClearFilters 
}: DietsEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-green-500/10 to-teal-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-100 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center shadow-2xl">
              {hasFilters ? (
                <Search className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Utensils className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 via-green-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-emerald-600 to-gray-900 dark:from-white dark:via-emerald-400 dark:to-white bg-clip-text text-transparent mb-4">
            {hasFilters
              ? 'Nenhuma dieta encontrada'
              : 'Crie sua primeira dieta!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar a dieta que você procura"
              : "Comece a criar planos nutricionais personalizados para seus alunos com a ajuda da inteligência artificial"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 transform hover:scale-105 border-0"
            >
              <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {hasFilters
                ? 'Criar Nova Dieta'
                : 'Começar Agora'}
            </Button>

            {hasFilters && (
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}