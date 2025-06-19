
// components/workouts/components/list/WorkoutEmptyState.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Search } from "lucide-react";
import { WorkoutEmptyStateProps } from '../../types';

export function WorkoutEmptyState({ userRole, hasFilters, onCreateNew }: WorkoutEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-rose-500/10 to-pink-600/10 dark:from-pink-500/5 dark:via-rose-400/5 dark:to-pink-500/5 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-20 px-6">
          
          {/* Icon */}
          <div className="relative mb-6 sm:mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-pink-100 via-rose-100 to-pink-100 dark:from-pink-900/30 dark:via-rose-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-2xl">
              {hasFilters ? (
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-pink-600 dark:text-pink-400" />
              ) : (
                <Dumbbell className="h-12 w-12 sm:h-16 sm:w-16 text-pink-600 dark:text-pink-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-rose-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          {/* Content */}
          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-pink-600 to-gray-900 dark:from-white dark:via-pink-400 dark:to-white bg-clip-text text-transparent mb-4">
            {hasFilters ? 'Nenhum treino encontrado' : 'Crie Seu Primeiro Treino!'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar o treino que você procura"
              : "Comece criando programas de treino personalizados para seus alunos"}
          </p>

          {/* Action button */}
          {userRole === 'trainer' && (
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-pink-500/25 transition-all duration-500 transform hover:scale-110 border-0 min-h-[44px]"
            >
              <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {hasFilters ? 'Novo Treino' : 'Começar Agora'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

