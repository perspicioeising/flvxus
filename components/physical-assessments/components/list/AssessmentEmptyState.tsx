// /components/physical-assessments/components/list/AssessmentEmptyState.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Brain } from "lucide-react";
import { AssessmentEmptyStateProps } from "@/components/physical-assessments/types/physical-assessment";

export function AssessmentEmptyState({ 
  userRole, 
  hasFilters, 
  onCreateNew 
}: AssessmentEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-cyan-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-cyan-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center shadow-2xl">
              <Brain className="h-16 w-16 sm:h-20 sm:w-20 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-4">
            {hasFilters
              ? 'Nenhuma avaliação encontrada'
              : 'Transforme Vidas com IA!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar a avaliação que você procura"
              : "Comece criando avaliações físicas inteligentes com análise de IA para transformar a vida dos seus alunos"}
          </p>

          {(userRole === 'trainer' || userRole === null) && (
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 border-0"
            >
              <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {hasFilters
                ? 'Criar Nova Avaliação'
                : 'Começar Agora'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}