
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Dumbbell, 
  Target, 
  Clock, 
  Hash,
  Award,
  Save,
  Edit3,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { DIFFICULTY_LEVELS, WORKOUT_GOALS } from '../../constants';
import { StepReviewProps } from '../../types';

export function StepReview({
  formData,
  selectedExercises,
  onSave,
  isSaving,
  mode
}: StepReviewProps) {
  const selectedLevel = DIFFICULTY_LEVELS.find(l => l.value === formData.level);
  const selectedGoal = WORKOUT_GOALS.find(g => g.value === formData.goal);
  
  const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const totalTime = selectedExercises.reduce((sum, ex) => sum + (ex.sets * (30 + ex.rest)), 0); // Estimativa
  const avgRestTime = selectedExercises.length > 0 
    ? Math.round(selectedExercises.reduce((sum, ex) => sum + ex.rest, 0) / selectedExercises.length)
    : 0;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Revisão do Treino
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Revise todas as informações antes de finalizar
        </p>
      </div>

      {/* Workout Summary Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-red-200/50 dark:border-red-800/30 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formData.name}
              </h3>
              {formData.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {formData.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {selectedLevel && (
                  <Badge className={`px-4 py-2 bg-gradient-to-r ${selectedLevel.color} text-white rounded-full font-semibold`}>
                    <Award className="h-4 w-4 mr-2" />
                    {selectedLevel.label}
                  </Badge>
                )}
                {selectedGoal && (
                  <Badge className={`px-4 py-2 bg-gradient-to-r ${selectedGoal.color} text-white rounded-full font-semibold`}>
                    <Target className="h-4 w-4 mr-2" />
                    {selectedGoal.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedExercises.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exercícios
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Hash className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSets}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Séries Total
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(totalTime / 60)}min
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tempo Est.
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgRestTime}s
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Descanso Médio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-red-600 dark:text-red-400" />
            Lista de Exercícios
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sequência e configuração dos exercícios
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {selectedExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {exercise.name}
                  </h5>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {exercise.sets} séries
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {exercise.reps} repetições
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exercise.rest}s descanso
                    </span>
                  </div>
                  {exercise.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                      "{exercise.notes}"
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {exercise.muscle_group.slice(0, 2).map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="secondary"
                      className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    >
                      {muscle}
                    </Badge>
                  ))}
                  {exercise.muscle_group.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{exercise.muscle_group.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedExercises.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum exercício adicionado
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Volte para a etapa de exercícios para adicionar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <div className="flex-1">
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-300">
                  Tudo pronto!
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Seu treino está configurado e pronto para ser salvo
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-green-800 dark:text-green-300">
                  {selectedExercises.length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Exercícios
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-800 dark:text-green-300">
                  {totalSets}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Séries
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-800 dark:text-green-300">
                  ~{Math.round(totalTime / 60)}min
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Duração
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:w-48">
          <Button
            onClick={onSave}
            disabled={isSaving || selectedExercises.length === 0}
            className={`h-14 font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 border-0 ${
              selectedExercises.length > 0
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed transform-none'
            }`}
          >
            {isSaving ? (
              <>
                <div className="h-5 w-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'edit' ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-3" />
                {mode === 'edit' ? 'Atualizar Treino' : 'Salvar Treino'}
              </>
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mode === 'edit' ? 'Suas alterações serão salvas' : 'O treino será adicionado à biblioteca'}
            </p>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Edit3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
              Dicas para um treino eficaz
            </h4>
            <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li>• Certifique-se de que a progressão dos exercícios faça sentido</li>
              <li>• Considere alternar grupos musculares para otimizar o descanso</li>
              <li>• Ajuste os tempos de descanso conforme a intensidade do exercício</li>
              <li>• Revise as observações para garantir execução correta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}