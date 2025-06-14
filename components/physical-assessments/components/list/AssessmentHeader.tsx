// /components/physical-assessments/components/list/AssessmentHeader.tsx

import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Book } from "lucide-react";
import { AssessmentHeaderComponentProps } from "@/components/physical-assessments/types/physical-assessment";

export function AssessmentHeader({ 
  userRole, 
  stats, 
  onCreateNew 
}: AssessmentHeaderComponentProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 dark:from-blue-500/10 dark:via-purple-400/10 dark:to-cyan-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Header com ícone e título */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Ícone com badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Book className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>

            {/* Textos */}
            <div className="min-w-0 space-y-1 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                Avaliações
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-base leading-tight">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span> avaliações
                <span className="hidden sm:inline"> • Sistema inteligente</span>
              </p>
            </div>
          </div>

          {/* Botão Simples - Quadrado */}
          {(userRole === 'trainer' || userRole === null) && (
            <Button
              onClick={onCreateNew}
              size="icon"
              className="h-12 w-12 sm:h-14 sm:w-14 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}