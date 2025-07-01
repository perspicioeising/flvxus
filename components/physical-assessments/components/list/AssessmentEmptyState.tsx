import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Brain } from "lucide-react";

interface AssessmentEmptyStateProps { 
  userRole: string | null;
  hasFilters: boolean;
  onCreateNew: () => void;
}

export function AssessmentEmptyState({ 
  userRole, 
  hasFilters, 
  onCreateNew 
}: AssessmentEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-btn-primary/10 to-app-achievement-workout/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 card-app backdrop-blur-xl rounded-3xl overflow-hidden shadow-app-xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-app-achievement-workout/10 via-app-btn-primary/10 to-app-achievement-workout/10 rounded-full flex items-center justify-center shadow-app-xl">
              <Brain className="h-16 w-16 sm:h-20 sm:w-20 text-app-achievement-workout" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/30 via-app-btn-primary/30 to-app-achievement-workout/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-app-heading mb-4">
            {hasFilters
              ? 'Nenhuma avaliação encontrada'
              : 'Transforme Vidas com IA!'}
          </h3>
          <p className="text-app-text-secondary mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar a avaliação que você procura"
              : "Comece criando avaliações físicas inteligentes com análise de IA para transformar a vida dos seus alunos"}
          </p>

          {(userRole === 'trainer' || userRole === null) && (
            <Button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-app-achievement-workout via-app-btn-primary to-app-achievement-workout hover:shadow-app-achievement-workout/25 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-app-xl transition-all duration-500 transform hover:scale-105 border-0"
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
