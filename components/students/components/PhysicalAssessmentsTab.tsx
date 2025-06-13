import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Activity, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PhysicalAssessmentsTabProps {
  assessments: any[];
  studentId: string;
}

export function PhysicalAssessmentsTab({ assessments, studentId }: PhysicalAssessmentsTabProps) {
  const router = useRouter();

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Avaliações Físicas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Histórico de avaliações físicas do aluno
                </CardDescription>
              </div>
            </div>
            
            <Button
              onClick={() => router.push(`/dashboard/physical-assessments/new?student=${studentId}`)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold border-0 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nova Avaliação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {assessments.length > 0 ? (
              assessments.map((assessment: any) => (
                <Card key={assessment.id} className="group bg-white dark:bg-gray-900/70 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
                                Peso
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {assessment.weight}kg
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">
                                Gordura
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {assessment.fat_percentage}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">
                                IMC
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {assessment.bmi || 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wider">
                                Massa Magra
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {assessment.lean_mass || 'N/A'}kg
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {assessment.protocol && (
                          <div className="pt-2">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg">
                              Protocolo: {assessment.protocol}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                        className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 shrink-0"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Ver Detalhes</span>
                        <span className="sm:hidden">Ver</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center shadow-lg">
                    <Activity className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhuma avaliação física encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Comece criando a primeira avaliação física para acompanhar o progresso do aluno
                </p>
                
                <Button
                  onClick={() => router.push(`/dashboard/physical-assessments/new?student=${studentId}`)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold border-0"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeira Avaliação
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}