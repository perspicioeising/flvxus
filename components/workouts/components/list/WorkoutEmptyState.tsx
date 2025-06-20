// components/workouts/components/list/WorkoutEmptyState.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, Search } from "lucide-react";
import { WorkoutEmptyStateProps } from '../../types';

export function WorkoutEmptyState({ userRole, hasFilters, onCreateNew }: WorkoutEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-emerald-500/10 to-cyan-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-green-100 via-emerald-100 to-green-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center shadow-2xl">
              {hasFilters ? (
                <Search className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 dark:text-green-400" />
              ) : (
                <Activity className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-green-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent mb-4">
            {hasFilters ? 'Nenhum treino encontrado' : 'Crie Seu Primeiro Treino!'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar o treino que você procura"
              : "Comece criando programas de treino personalizados para seus alunos"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {userRole === 'trainer' && (
              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0"
              >
                <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                {hasFilters ? 'Novo Treino' : 'Começar Agora'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}