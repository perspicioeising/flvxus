// components/physical-assessments/components/comparisonEmptyState.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Sparkles, TrendingUp } from "lucide-react";

export function ComparisonEmptyState() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-red-600/10 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
          <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-yellow-50/50 via-orange-50/50 to-red-50/50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 rounded-t-2xl sm:rounded-t-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative mx-auto sm:mx-0">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Evolução e Comparações
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Análise temporal e comparações com avaliações anteriores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center py-16 sm:py-24 px-4">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-xl sm:shadow-2xl">
                <Calendar className="h-16 w-16 sm:h-20 sm:w-20 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-clip-text text-transparent mb-4">
              Primeira Avaliação
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed px-4">
              Esta é a primeira avaliação do aluno. As comparações estarão disponíveis após a próxima avaliação.
            </p>
            <Badge className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Linha de Base Estabelecida
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}