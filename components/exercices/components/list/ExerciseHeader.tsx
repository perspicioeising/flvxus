// /components/exercises/components/list/ExerciseHeader.tsx

import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Dumbbell, Zap } from "lucide-react";
import { ExerciseHeaderProps } from "@/components/exercices/types/exercise";

export function ExerciseHeader({ 
  exerciseCount, 
  onCreateNew 
}: ExerciseHeaderProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 dark:from-purple-500/10 dark:via-pink-400/10 dark:to-purple-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Header com ícone e título */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Ícone com badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>

            {/* Textos */}
            <div className="min-w-0 space-y-1 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                Exercícios
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-base leading-tight">
                <span className="font-semibold text-purple-600 dark:text-purple-400">{exerciseCount}</span> exercício{exerciseCount !== 1 ? 's' : ''}
                <span className="hidden sm:inline"> • Biblioteca Avançada</span>
              </p>
            </div>
          </div>

          {/* Botão Criar */}
          <Button
            onClick={onCreateNew}
            size="icon"
            className="h-12 w-12 sm:h-14 sm:w-14 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}