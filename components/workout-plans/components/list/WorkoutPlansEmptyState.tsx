
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CalendarCheck, Search } from 'lucide-react';

interface WorkoutPlansEmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
  onClearFilters: () => void;
}

export function WorkoutPlansEmptyState({ 
  hasFilters, 
  onCreateNew,
  onClearFilters 
}: WorkoutPlansEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 card-app backdrop-blur-xl rounded-3xl overflow-hidden shadow-app-xl">
        <CardContent className="text-center py-16 sm:py-24">
          <div className="relative mb-6 sm:mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-app-achievement-workout/20 via-app-achievement-consecutive/20 to-app-achievement-workout/20 rounded-full flex items-center justify-center shadow-app-xl">
              {hasFilters ? (
                <Search className="h-16 w-16 sm:h-20 sm:w-20 text-app-achievement-workout" />
              ) : (
                <CalendarCheck className="h-16 w-16 sm:h-20 sm:w-20 text-app-achievement-workout" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/30 via-app-achievement-consecutive/30 to-app-achievement-workout/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-app-text-heading via-app-achievement-workout to-app-text-heading bg-clip-text text-transparent mb-4">
            {hasFilters
              ? 'Nenhum plano encontrado'
              : 'Crie seu primeiro plano!'}
          </h3>
          <p className="text-app-text-secondary mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar o plano que você procura"
              : "Comece a organizar treinos personalizados para seus alunos com planos estruturados e eficazes"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onCreateNew}
              className="bg-achievement-workout hover:bg-app-btn-primary-hover text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold shadow-app-xl hover:shadow-app-achievement-workout/25 transition-all duration-500 transform hover:scale-105 border-0"
            >
              <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              {hasFilters
                ? 'Criar Novo Plano'
                : 'Começar Agora'}
            </Button>

            {hasFilters && (
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="bg-app-card border-app-border-accent text-app-achievement-workout hover:bg-app-achievement-workout/10 px-6 py-3 rounded-2xl font-semibold shadow-app-medium transition-all duration-300"
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
