import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus, Search } from "lucide-react";

interface StudentsEmptyStateProps {
  hasFilters: boolean;
  onNewStudent: () => void;
  onClearFilters: () => void;
}

export function StudentsEmptyState({ hasFilters, onNewStudent, onClearFilters }: StudentsEmptyStateProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/10 via-app-achievement-consecutive/10 to-app-achievement-weight/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 card-app rounded-3xl overflow-hidden shadow-app-xl">
        <CardContent className="text-center py-16 sm:py-24">
          
          {/* Ícone com animação */}
          <div className="relative mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-app-text-accent/10 via-app-achievement-consecutive/10 to-app-achievement-weight/10 rounded-full flex items-center justify-center shadow-app-xl">
              {hasFilters ? (
                <Search className="h-16 w-16 sm:h-20 sm:w-20 text-app-text-accent" />
              ) : (
                <User className="h-16 w-16 sm:h-20 sm:w-20 text-app-text-accent" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-app-text-accent/30 via-app-achievement-consecutive/30 to-app-achievement-weight/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          {/* Título e Descrição */}
          <h3 className="text-3xl font-black text-app-heading mb-4">
            {hasFilters ? 'Nenhum aluno encontrado' : 'Transforme Vidas!'}
          </h3>
          
          <p className="text-app-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar o aluno que você procura"
              : "Comece sua jornada como personal trainer adicionando seu primeiro aluno e transformando vidas através do fitness"}
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasFilters ? (
              <>
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="bg-app-card border-app-border-default hover:bg-app-bg-secondary hover:border-app-border-accent px-8 py-3 rounded-2xl font-semibold shadow-app-medium hover:shadow-app-large transition-all duration-300"
                >
                  <Search className="mr-3 h-5 w-5" />
                  Limpar Filtros
                </Button>
                <Button
                  onClick={onNewStudent}
                  className="btn-gradient-primary px-8 py-3 rounded-2xl font-bold shadow-app-xl hover:shadow-app-xl transition-all duration-500 transform hover:scale-105 border-0"
                >
                  <Plus className="mr-3 h-5 w-5" />
                  Adicionar Aluno
                </Button>
              </>
            ) : (
              <Button
                onClick={onNewStudent}
                className="btn-gradient-primary px-10 py-4 rounded-2xl font-bold shadow-app-xl hover:shadow-app-xl transition-all duration-500 transform hover:scale-105 border-0"
              >
                <Plus className="mr-3 h-6 w-6" />
                Começar Agora
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}