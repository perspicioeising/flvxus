// components/physical-assessments/components/steps/stepAnalysis.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIAnalysis, BodyCompositionResult, Student } from '@/components/physical-assessments/types/physical-assessment';
import { 
  Brain,
  Save,
  Target,
  Utensils,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Crown,
  Award,
  Activity,
  Zap,
  Star
} from 'lucide-react';

interface StepAnalysisProps {
  aiAnalysis: AIAnalysis | null;
  calculations: BodyCompositionResult | null;
  selectedStudent: Student | null;
  onSave: () => void;
  isSaving: boolean;
  mode: 'create' | 'edit';
}

export function StepAnalysis({
  aiAnalysis,
  calculations,
  selectedStudent,
  onSave,
  isSaving,
  mode
}: StepAnalysisProps) {
  if (!aiAnalysis) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="relative mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center shadow-2xl">
            <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-900 via-pink-600 to-indigo-900 dark:from-purple-300 dark:via-pink-400 dark:to-indigo-300 bg-clip-text text-transparent mb-4">
          Análise IA não disponível
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
          Execute a análise IA na etapa anterior para ver as recomendações personalizadas
        </p>
      </div>
    );
  }

  const getHealthRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'baixo':
      case 'low':
        return 'from-green-500 to-emerald-500';
      case 'moderado':
      case 'moderate':
        return 'from-yellow-500 to-orange-500';
      case 'alto':
      case 'high':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getHealthRiskIcon = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'baixo':
      case 'low':
        return CheckCircle2;
      case 'moderado':
      case 'moderate':
        return AlertTriangle;
      case 'alto':
      case 'high':
        return AlertTriangle;
      default:
        return Target;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header da Análise */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-indigo-600/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
          <CardHeader className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-indigo-900/10 rounded-t-2xl sm:rounded-t-3xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Análise Inteligente
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                  Recomendações personalizadas para {selectedStudent?.full_name}
                </p>
              </div>
              <Badge className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-xs font-semibold border-0 shrink-0">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Resumo da Análise */}
      {aiAnalysis.summary && (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              Resumo da Avaliação
            </h4>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {aiAnalysis.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Composição Corporal */}
      {aiAnalysis.bodyComposition && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Classificação */}
          {aiAnalysis.bodyComposition.classification && (
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg inline-flex">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Classificação
                </h5>
                <Badge className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-semibold border-0">
                  {aiAnalysis.bodyComposition.classification}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Risco para Saúde */}
          {aiAnalysis.bodyComposition.healthRisk && (
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-3 sm:mb-4">
                  <div className={`p-3 bg-gradient-to-br ${getHealthRiskColor(aiAnalysis.bodyComposition.healthRisk)} rounded-xl sm:rounded-2xl shadow-lg inline-flex`}>
                    {(() => {
                      const RiskIcon = getHealthRiskIcon(aiAnalysis.bodyComposition.healthRisk);
                      return <RiskIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />;
                    })()}
                  </div>
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Risco para Saúde
                </h5>
                <Badge className={`px-3 py-1 bg-gradient-to-r ${getHealthRiskColor(aiAnalysis.bodyComposition.healthRisk)} text-white rounded-full text-xs font-semibold border-0`}>
                  {aiAnalysis.bodyComposition.healthRisk}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Comparação */}
          {aiAnalysis.bodyComposition.comparison && (
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl md:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg inline-flex">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Comparação
                </h5>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {aiAnalysis.bodyComposition.comparison}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recomendações */}
      {aiAnalysis.recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Treino */}
          {aiAnalysis.recommendations.training && aiAnalysis.recommendations.training.length > 0 && (
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl shadow-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    Recomendações de Treino
                  </h5>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {aiAnalysis.recommendations.training.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2 shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Nutrição */}
          {aiAnalysis.recommendations.nutrition && aiAnalysis.recommendations.nutrition.length > 0 && (
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl shadow-lg">
                    <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    Recomendações Nutricionais
                  </h5>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {aiAnalysis.recommendations.nutrition.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Estilo de Vida */}
          {aiAnalysis.recommendations.lifestyle && aiAnalysis.recommendations.lifestyle.length > 0 && (
            <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg sm:rounded-xl shadow-lg">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    Estilo de Vida
                  </h5>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {aiAnalysis.recommendations.lifestyle.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-2 shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tendências (se disponível) */}
      {aiAnalysis.trends && (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl shadow-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Análise de Tendências
              </h5>
            </div>
            
            {aiAnalysis.trends.progress && (
              <div className="mb-4">
                <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-xs sm:text-sm">
                  Progresso Geral:
                </h6>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {aiAnalysis.trends.progress}
                </p>
              </div>
            )}

            {aiAnalysis.trends.areas_improvement && aiAnalysis.trends.areas_improvement.length > 0 && (
              <div>
                <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-xs sm:text-sm">
                  Áreas de Melhoria:
                </h6>
                <ul className="space-y-2">
                  {aiAnalysis.trends.areas_improvement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {area}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seção de Métricas Resumidas (Opcional) */}
      {calculations && (
        <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl shadow-lg">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Métricas da Avaliação
              </h5>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">IMC</p>
                <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {calculations.bmi}
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">% Gordura</p>
                <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
                  {calculations.fatPercentage}%
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">M. Gorda</p>
                <p className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400">
                  {calculations.fatMass}kg
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">M. Magra</p>
                <p className="text-lg sm:text-xl font-black text-green-600 dark:text-green-400">
                  {calculations.leanMass}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Salvar */}
      <div className="flex justify-center pt-6 sm:pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
        >
          {isSaving ? (
            <>
              <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Salvando Avaliação...</span>
              <span className="sm:hidden">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">
                {mode === 'edit' ? 'Atualizar' : 'Finalizar'} Avaliação
              </span>
              <span className="sm:hidden">
                {mode === 'edit' ? 'Atualizar' : 'Finalizar'}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}