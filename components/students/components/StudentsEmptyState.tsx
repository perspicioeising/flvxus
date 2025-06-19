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
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-teal-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="text-center py-16 sm:py-24">
          
          {/* Icon with Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-2xl">
              {hasFilters ? (
                <Search className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 dark:text-green-400" />
              ) : (
                <User className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
          </div>

          {/* Title and Description */}
          <h3 className="text-3xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-4">
            {hasFilters ? 'Nenhum aluno encontrado' : 'Transforme Vidas!'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            {hasFilters
              ? "Ajuste os filtros de busca para encontrar o aluno que você procura"
              : "Comece sua jornada como personal trainer adicionando seu primeiro aluno e transformando vidas através do fitness"}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hasFilters ? (
              <>
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Search className="mr-3 h-5 w-5" />
                  Limpar Filtros
                </Button>
                <Button
                  onClick={onNewStudent}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0"
                >
                  <Plus className="mr-3 h-5 w-5" />
                  Adicionar Aluno
                </Button>
              </>
            ) : (
              <Button
                onClick={onNewStudent}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 border-0"
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