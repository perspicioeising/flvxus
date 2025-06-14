// components/physical-assessments/components/steps/StepResults.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BodyCompositionResult } from '@/components/physical-assessments/types/physical-assessment';
import { RESULTS_METRICS } from '@/components/constants/physical-assessment';
import { 
  Scale, 
  BarChart3, 
  Weight, 
  Activity, 
  Brain, 
  Save, 
  Info,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface StepResultsProps {
  calculations: BodyCompositionResult | null;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  onAnalyze: () => void;
  onSave: () => void;
  isAnalyzing: boolean;
  isSaving: boolean;
  mode: 'create' | 'edit';
}

export function StepResults({
  calculations,
  notes,
  onUpdateNotes,
  onAnalyze,
  onSave,
  isAnalyzing,
  isSaving,
  mode
}: StepResultsProps) {
  if (!calculations) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="relative mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-4">
          Dados insuficientes
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
          Complete as medidas obrigatórias para ver os resultados
        </p>
      </div>
    );
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Scale,
      BarChart3,
      Weight,
      Activity
    };
    return icons[iconName] || BarChart3;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {RESULTS_METRICS.map((metric) => {
          const IconComponent = getIconComponent(metric.icon);
          const value = calculations[metric.key as keyof BodyCompositionResult];
          const maxValue = metric.maxValue || 100;
          const percentage = typeof value === 'number' ? Math.min((value / maxValue) * 100, 100) : 0;
          
          return (
            <div key={metric.key} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className="space-y-0.5 sm:space-y-1 text-left">
                      <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                        {metric.label}
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 dark:text-white">
                        {value}{metric.suffix || ''}
                      </p>
                    </div>
                    <div className={`p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-lg sm:rounded-xl shadow-lg shrink-0`}>
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <div className="h-1 sm:h-1.5 lg:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Observações */}
      <div className="space-y-3 sm:space-y-4">
        <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
          Observações da Avaliação
        </Label>
        <Textarea
          placeholder="Adicione observações sobre a avaliação, condições especiais, limitações encontradas..."
          value={notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 resize-none"
        />
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing || isSaving}
          className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Analisando...</span>
              <span className="sm:hidden">Analisando...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Analisar com IA</span>
              <span className="sm:hidden">Analisar</span>
            </>
          )}
        </Button>

        <Button
          onClick={onSave}
          disabled={isSaving || isAnalyzing}
          className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-2xl hover:shadow-green-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:scale-100 border-0"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Salvando...</span>
              <span className="sm:hidden">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">
                {mode === 'edit' ? 'Atualizar' : 'Salvar'} Avaliação
              </span>
              <span className="sm:hidden">
                {mode === 'edit' ? 'Atualizar' : 'Salvar'}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}