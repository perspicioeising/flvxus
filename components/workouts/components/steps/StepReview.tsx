// components/workouts/steps/StepReview.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Activity, 
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
        <div className="w-20 h-20 bg-achievement-workout rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-text-heading mb-2">
          Revisão do Treino
        </h2>
        <p className="text-app-text-secondary">
          Revise todas as informações antes de finalizar
        </p>
      </div>

      {/* Workout Summary Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-achievement-workout/30 to-app-achievement-workout/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-3xl p-8 shadow-app-xl">
          
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-large">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-app-text-heading mb-2">
                {formData.name}
              </h3>
              {formData.description && (
                <p className="text-app-text-secondary mb-4 leading-relaxed">
                  {formData.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {selectedLevel && (
                  <Badge className={`px-4 py-2 bg-achievement-workout text-white rounded-full font-semibold`}>
                    <Award className="h-4 w-4 mr-2" />
                    {selectedLevel.label}
                  </Badge>
                )}
                {selectedGoal && (
                  <Badge className={`px-4 py-2 bg-app-achievement-consecutive text-white rounded-full font-semibold`}>
                    <Target className="h-4 w-4 mr-2" />
                    {selectedGoal.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-app-bg-secondary/20 rounded-xl border border-app-border-muted">
              <div className="w-12 h-12 bg-achievement-workout rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-app-text-primary">
                {selectedExercises.length}
              </p>
              <p className="text-sm text-app-text-secondary">
                Exercícios
              </p>
            </div>
            
            <div className="text-center p-4 bg-app-bg-secondary/20 rounded-xl border border-app-border-muted">
              <div className="w-12 h-12 bg-app-achievement-consecutive rounded-xl flex items-center justify-center mx-auto mb-3">
                <Hash className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-app-text-primary">
                {totalSets}
              </p>
              <p className="text-sm text-app-text-secondary">
                Séries Total
              </p>
            </div>
            
            <div className="text-center p-4 bg-app-bg-secondary/20 rounded-xl border border-app-border-muted">
              <div className="w-12 h-12 bg-app-achievement-exercise rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-app-text-primary">
                {Math.round(totalTime / 60)}min
              </p>
              <p className="text-sm text-app-text-secondary">
                Tempo Est.
              </p>
            </div>
            
            <div className="text-center p-4 bg-app-bg-secondary/20 rounded-xl border border-app-border-muted">
              <div className="w-12 h-12 bg-app-achievement-weight rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-app-text-primary">
                {avgRestTime}s
              </p>
              <p className="text-sm text-app-text-secondary">
                Descanso Médio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="bg-app-card rounded-2xl shadow-app-xl border border-app-border-muted">
        <div className="p-6 border-b border-app-border-muted">
          <h4 className="text-lg font-bold text-app-text-primary flex items-center gap-2">
            <Activity className="h-5 w-5 text-app-achievement-workout" />
            Lista de Exercícios
          </h4>
          <p className="text-sm text-app-text-secondary mt-1">
            Sequência e configuração dos exercícios
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {selectedExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center gap-4 p-4 bg-app-bg-secondary/20 rounded-xl hover:bg-app-bg-secondary/30 transition-all duration-200 border border-app-border-muted"
              >
                <div className="w-12 h-12 bg-achievement-workout rounded-xl flex items-center justify-center text-white font-bold shadow-app-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-app-text-primary mb-1">
                    {exercise.name}
                  </h5>
                  <div className="flex flex-wrap gap-2 text-sm text-app-text-secondary">
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
                    <p className="text-sm text-app-text-muted mt-1 italic">
                      "{exercise.notes}"
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {exercise.muscle_group.slice(0, 2).map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="secondary"
                      className="text-xs bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent"
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
              <Activity className="h-16 w-16 text-app-text-muted mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-app-text-primary mb-2">
                Nenhum exercício adicionado
              </h4>
              <p className="text-app-text-secondary">
                Volte para a etapa de exercícios para adicionar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <div className="flex-1">
          <div className="p-6 bg-gradient-to-r from-app-achievement-consecutive/10 to-app-achievement-consecutive/20 rounded-2xl border border-app-border-accent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-app-achievement-consecutive rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-app-achievement-consecutive">
                  Tudo pronto!
                </h4>
                <p className="text-sm text-app-text-secondary">
                  Seu treino está configurado e pronto para ser salvo
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-app-achievement-consecutive">
                  {selectedExercises.length}
                </p>
                <p className="text-xs text-app-text-secondary">
                  Exercícios
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-app-achievement-consecutive">
                  {totalSets}
                </p>
                <p className="text-xs text-app-text-secondary">
                  Séries
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-app-achievement-consecutive">
                  ~{Math.round(totalTime / 60)}min
                </p>
                <p className="text-xs text-app-text-secondary">
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
            className={`h-14 font-bold rounded-xl shadow-app-xl transition-all duration-300 transform hover:scale-105 border-0 ${
              selectedExercises.length > 0
                ? 'bg-achievement-workout hover:bg-app-achievement-workout/90 hover:shadow-app-achievement-workout/25 text-white'
                : 'bg-app-bg-secondary text-app-text-muted cursor-not-allowed transform-none'
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
            <p className="text-xs text-app-text-muted">
              {mode === 'edit' ? 'Suas alterações serão salvas' : 'O treino será adicionado à biblioteca'}
            </p>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-r from-app-achievement-consecutive/10 to-app-achievement-exercise/10 rounded-2xl p-6 border border-app-border-accent">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-app-achievement-consecutive rounded-xl flex items-center justify-center flex-shrink-0">
            <Edit3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-app-achievement-consecutive mb-2">
              Dicas para um treino eficaz
            </h4>
            <ul className="space-y-1 text-sm text-app-text-secondary">
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