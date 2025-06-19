// /components/exercises/components/list/ExerciseEmptyState.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Dumbbell } from "lucide-react";
import { ExerciseEmptyStateProps } from "@/components/exercices/types/exercise";

export function ExerciseEmptyState({ 
  hasFilters, 
  onCreateNew,
  onClearFilters 
}: ExerciseEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center shadow-2xl">
              <Dumbbell className="h-16 w-16 sm:h-20 sm:w-20 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 dark:from-white dark:via-purple-400 dark:to-white bg-clip-text text-transparent mb-4">
            {hasFilters
              ? 'Nenhum exercício encontrado'
              : 'Construa sua Biblioteca!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar o exercício que você procura"
              : "Comece a criar sua biblioteca personalizada de exercícios para oferecer treinos ainda mais eficazes aos seus alunos"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 border-0"
            >
              <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {hasFilters
                ? 'Adicionar Exercício'
                : 'Começar Agora'}
            </Button>

            {hasFilters && (
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300"
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