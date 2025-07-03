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
    if (isFinishing) return;
    
    setIsFinishing(true);
    try {
      await onFinish(finalNotes);
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      setIsFinishing(false);
    }
  };

  const handleBack = () => {
    if (isFinishing) return;
    onBack();
  };

  const handleNotesChange = (value: string) => {
    setFinalNotes(value);
  };

  // Calcular estatísticas de forma segura
  const completedExercises = session?.exercises?.filter((e: any) => (e.sets_completed || 0) > 0).length || 0;
  
  const totalWeight = session?.exercises?.reduce((sum: number, e: any) => {
    const exerciseWeight = e.weights?.reduce((w: number, weight: number) => w + (weight || 0), 0) || 0;
    return sum + exerciseWeight;
  }, 0) || 0;
  
  const totalSets = session?.exercises?.reduce((sum: number, e: any) => sum + (e.sets_completed || 0), 0) || 0;
  
  const totalReps = session?.exercises?.reduce((sum: number, e: any) => {
    const exerciseReps = e.reps?.reduce((r: number, rep: number) => r + (rep || 0), 0) || 0;
    return sum + exerciseReps;
  }, 0) || 0;

  const exercisesWithDifficulty = session?.exercises?.filter((e: any) => e.difficulty_rating) || [];
  const averageDifficulty = exercisesWithDifficulty.length > 0 
    ? exercisesWithDifficulty.reduce((sum: number, e: any) => sum + e.difficulty_rating, 0) / exercisesWithDifficulty.length 
    : 0;

  const completionRate = workout.workout_exercises?.length 
    ? Math.round((completedExercises / workout.workout_exercises.length) * 100) 
    : 0;

  const estimatedCalories = Math.round(totalTime * 0.12);

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 py-4 max-w-2xl">
        
        {/* Header Compacto */}
        <div className="relative mb-6">
          <div className="bg-app-overlay backdrop-blur-xl border border-app-border-accent rounded-2xl p-4 shadow-app-xl">
            
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBack}
                disabled={isFinishing}
                className="h-10 w-10 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-app-achievement-consecutive rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-app-large">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-app-heading">
                  Treino Concluído!
                </h1>
                <p className="text-sm text-app-text-secondary">
                  Parabéns pelo seu esforço
                </p>
              </div>

              <div className="w-10"></div>
            </div>

            {/* Workout Title */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-app-heading mb-2">
                {workout.name}
              </h2>
              <Badge className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards Principais */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-app-achievement-exercise rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted font-medium mb-1">Duração</p>
              <p className="text-lg font-bold text-app-heading">{formatTime(totalTime)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-app-achievement-consecutive rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted font-medium mb-1">Exercícios</p>
              <p className="text-lg font-bold text-app-heading">{completedExercises}/{workout.workout_exercises?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-app-achievement-workout rounded-xl flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted font-medium mb-1">Peso Total</p>
              <p className="text-lg font-bold text-app-heading">{totalWeight.toFixed(0)}kg</p>
            </CardContent>
          </Card>

          <Card className="border-0 card-app">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-app-achievement-weight rounded-xl flex items-center justify-center mx-auto mb-2">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-app-text-muted font-medium mb-1">Séries</p>
              <p className="text-lg font-bold text-app-heading">{totalSets}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Secundárias */}
        <Card className="border-0 card-app mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-app-heading mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-app-achievement-workout" />
              Estatísticas
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
                <Dumbbell className="h-6 w-6 text-app-achievement-workout mx-auto mb-1" />
                <p className="text-xs text-app-text-muted mb-1">Repetições</p>
                <p className="text-lg font-bold text-app-heading">{totalReps}</p>
              </div>
              
              <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
                <Award className="h-6 w-6 text-app-achievement-consecutive mx-auto mb-1" />
                <p className="text-xs text-app-text-muted mb-1">Conclusão</p>
                <p className="text-lg font-bold text-app-heading">{completionRate}%</p>
              </div>
              
              <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
                <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-xs text-app-text-muted mb-1">Intensidade</p>
                <p className="text-lg font-bold text-app-heading">
                  {averageDifficulty ? averageDifficulty.toFixed(1) : 'N/A'}
                </p>
              </div>
              
              <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
                <Flame className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-app-text-muted mb-1">Calorias</p>
                <p className="text-lg font-bold text-app-heading">{estimatedCalories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Summary */}
        <Card className="border-0 card-app mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold text-app-heading mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-app-achievement-workout" />
              Resumo dos Exercícios
            </h3>
            
            <div className="space-y-3">
              {session?.exercises?.map((exerciseProgress: any, index: number) => {
                const workoutExercise = workout.workout_exercises?.find((we: any) => we.exercise.id === exerciseProgress.exercise_id);
                if (!workoutExercise) return null;

                const completedSets = exerciseProgress.sets_completed || 0;
                const totalSets = workoutExercise.sets;
                const exerciseWeight = exerciseProgress.weights?.reduce((sum: number, w: number) => sum + (w || 0), 0) || 0;
                const exerciseReps = exerciseProgress.reps?.reduce((sum: number, r: number) => sum + (r || 0), 0) || 0;
                const difficulty = exerciseProgress.difficulty_rating;
                const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
                const maxWeight = Math.max(...(exerciseProgress.weights || [0]));

                return (
                  <div key={exerciseProgress.exercise_id} className="p-3 bg-app-bg-secondary rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-app-heading text-sm">
                        {workoutExercise.exercise.name}
                      </h4>
                      <Badge className={`px-2 py-1 rounded-full text-xs ${
                        completedSets === totalSets 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {completedSets}/{totalSets}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-app-text-muted">Peso Total</p>
                        <p className="font-bold text-app-heading">{exerciseWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-app-text-muted">Repetições</p>
                        <p className="font-bold text-app-heading">{exerciseReps}</p>
                      </div>
                      <div>
                        <p className="text-app-text-muted">Máximo</p>
                        <p className="font-bold text-app-heading">{maxWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-app-text-muted">Dificuldade</p>
                        <p className="font-bold text-app-heading">
                          {difficultyInfo ? `${difficultyInfo.emoji} ${difficultyInfo.value}` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {exerciseProgress.notes && (
                      <div className="mt-2 p-2 bg-app-card rounded-lg">
                        <p className="text-xs text-app-text-muted mb-1">Suas observações:</p>
                        <p className="text-xs text-app-text-primary">{exerciseProgress.notes}</p>
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
          <CardContent className="p-4">
            <h3 className="font-bold text-app-heading mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-app-achievement-workout" />
              Observações Finais
            </h3>
            
            <Textarea
              placeholder="Como foi seu treino hoje? Compartilhe suas impressões..."
              value={finalNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-[80px] bg-app-card border-app-border-muted focus:border-app-achievement-workout rounded-xl text-sm resize-none"
            />
          </CardContent>
        </Card>

        {/* Achievement */}
        <Card className="border-0 card-app mb-6">
          <CardContent className="p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-app-large">
              <Star className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="font-bold text-app-heading mb-2">
              Parabéns! 🎉
            </h3>
            <p className="text-sm text-app-text-secondary mb-3">
              Você ganhou <span className="font-bold text-app-achievement-workout">10 pontos XP</span> por completar este treino.
            </p>
            
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            disabled={isFinishing}
            className="flex-1 bg-app-card border border-app-border-muted hover:bg-app-border-accent/20 rounded-xl font-semibold py-3 px-4 flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>

          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="flex-1 bg-app-achievement-consecutive hover:bg-app-achievement-consecutive/90 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center disabled:opacity-50 transition-colors shadow-app-large"
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
          </button>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}