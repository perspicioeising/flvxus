// components/my-workouts/components/execution/WorkoutSummary.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy,
  Clock,
  Target,
  Dumbbell,
  Star,
  ArrowLeft,
  Save,
  Calendar,
  Activity,
  BarChart3,
  Zap,
  Award,
  Flame,
  MessageSquare
} from 'lucide-react';
import { DIFFICULTY_LEVELS } from '../../constants';

interface WorkoutSummaryProps {
  workout: any;
  session: any;
  totalTime: number;
  onFinish: (notes?: string) => void;
  onBack: () => void;
}

export function WorkoutSummary({ workout, session, totalTime, onFinish, onBack }: WorkoutSummaryProps) {
  const [finalNotes, setFinalNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await onFinish(finalNotes);
    } catch (error) {
      setIsFinishing(false);
    }
  };

  // Calcular estatísticas
  const completedExercises = session?.exercises?.filter((e: any) => e.sets_completed > 0).length || 0;
  const totalWeight = session?.exercises?.reduce((sum: number, e: any) => {
    return sum + (e.weights?.reduce((w: number, weight: number) => w + (weight || 0), 0) || 0);
  }, 0) || 0;
  
  const totalSets = session?.exercises?.reduce((sum: number, e: any) => sum + (e.sets_completed || 0), 0) || 0;
  const totalReps = session?.exercises?.reduce((sum: number, e: any) => {
    return sum + (e.reps?.reduce((r: number, rep: number) => r + (rep || 0), 0) || 0);
  }, 0) || 0;

  const averageDifficulty = session?.exercises?.filter((e: any) => e.difficulty_rating)
    .reduce((sum: number, e: any) => sum + e.difficulty_rating, 0) / 
    session?.exercises?.filter((e: any) => e.difficulty_rating).length || 0;

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-2 py-4 max-w-4xl">
        
        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-2xl p-6 shadow-app-xl">
            
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="h-10 w-10 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-app-large">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-black text-app-heading">
                  Treino Concluído!
                </h1>
                <p className="text-app-text-secondary">
                  Parabéns pelo seu esforço e dedicação
                </p>
              </div>

              <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Workout Title */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-app-heading mb-2">
                {workout.name}
              </h2>
              <Badge className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-semibold">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Duração</p>
              <p className="text-lg font-black text-app-heading">{formatTime(totalTime)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Exercícios</p>
              <p className="text-lg font-black text-app-heading">{completedExercises}/{workout.workout_exercises?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Peso Total</p>
              <p className="text-lg font-black text-app-heading">{totalWeight.toFixed(0)}kg</p>
            </CardContent>
          </Card>

          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted uppercase tracking-wider mb-1">Séries</p>
              <p className="text-lg font-black text-app-heading">{totalSets}</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="border-0 card-app mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-app-achievement-workout" />
              Estatísticas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
                <Dumbbell className="h-8 w-8 text-app-achievement-workout mx-auto mb-2" />
                <p className="text-sm text-app-text-muted mb-1">Total de Repetições</p>
                <p className="text-2xl font-bold text-app-heading">{totalReps}</p>
              </div>
              
              <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-app-text-muted mb-1">Intensidade Média</p>
                <p className="text-2xl font-bold text-app-heading">
                  {averageDifficulty ? averageDifficulty.toFixed(1) : 'N/A'}
                </p>
              </div>
              
              <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-app-text-muted mb-1">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-app-heading">
                  {workout.workout_exercises?.length ? Math.round((completedExercises / workout.workout_exercises.length) * 100) : 0}%
                </p>
              </div>
              
              <div className="text-center p-4 bg-app-bg-secondary rounded-xl">
                <Flame className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-app-text-muted mb-1">Calorias Est.</p>
                <p className="text-2xl font-bold text-app-heading">
                  {Math.round(totalTime * 0.12)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Summary */}
        <Card className="border-0 card-app mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-app-achievement-workout" />
              Resumo dos Exercícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session?.exercises?.map((exerciseProgress: any, index: number) => {
                const workoutExercise = workout.workout_exercises?.find((we: any) => we.exercise.id === exerciseProgress.exercise_id);
                if (!workoutExercise) return null;

                const completedSets = exerciseProgress.sets_completed || 0;
                const totalSets = workoutExercise.sets;
                const exerciseWeight = exerciseProgress.weights?.reduce((sum: number, w: number) => sum + (w || 0), 0) || 0;
                const exerciseReps = exerciseProgress.reps?.reduce((sum: number, r: number) => sum + (r || 0), 0) || 0;
                const difficulty = exerciseProgress.difficulty_rating;
                const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.value === difficulty);

                return (
                  <div key={exerciseProgress.exercise_id} className="p-4 bg-app-bg-secondary rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-app-heading">
                        {workoutExercise.exercise.name}
                      </h4>
                      <Badge className={`px-2 py-1 rounded-full text-xs ${
                        completedSets === totalSets 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {completedSets}/{totalSets} séries
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-app-text-muted">Peso Total:</p>
                        <p className="font-bold text-app-heading">{exerciseWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-app-text-muted">Repetições:</p>
                        <p className="font-bold text-app-heading">{exerciseReps}</p>
                      </div>
                      <div>
                        <p className="text-app-text-muted">Série Máx:</p>
                        <p className="font-bold text-app-heading">
                          {Math.max(...(exerciseProgress.weights || [0]))}kg
                        </p>
                      </div>
                      <div>
                        <p className="text-app-text-muted">Dificuldade:</p>
                        <p className="font-bold text-app-heading">
                          {difficultyInfo ? `${difficultyInfo.emoji} ${difficultyInfo.value}` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {exerciseProgress.notes && (
                      <div className="mt-3 p-3 bg-app-card rounded-lg">
                        <p className="text-xs text-app-text-muted mb-1">Suas observações:</p>
                        <p className="text-sm text-app-text-primary">{exerciseProgress.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Final Notes */}
        <Card className="border-0 card-app mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-app-achievement-workout" />
              Observações Finais (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Como foi seu treino hoje? Compartilhe suas impressões, conquistas ou desafios..."
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              className="min-h-[100px] bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-xl"
            />
          </CardContent>
        </Card>

        {/* Achievements Preview */}
        <Card className="border-0 card-app mb-6">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-app-large">
                <Star className="h-10 w-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-app-heading mb-2">
                  Parabéns pelo Treino! 🎉
                </h3>
                <p className="text-app-text-secondary">
                  Você ganhou <span className="font-bold text-app-achievement-workout">10 pontos XP</span> por completar este treino.
                  Continue assim para desbloquear novas conquistas!
                </p>
              </div>
              
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-6 w-6 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 bg-app-card border-app-border-muted hover:bg-app-border-accent/20 rounded-xl font-semibold py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Button
            onClick={handleFinish}
            disabled={isFinishing}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-app-large hover:shadow-green-500/25 transition-all duration-300 py-3"
          >
            {isFinishing ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Finalizar Treino
              </>
            )}
          </Button>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

// components/my-workouts/components/execution/ConfirmationDialog.tsx
