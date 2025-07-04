'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X,
  Clock,
  Play,
  Pause,
  Dumbbell,
  Info,
  Trophy,
  ChevronLeft,
  ChevronRight,
  List,
  Save,
  ArrowRight,
  Star
} from 'lucide-react';
import { WorkoutTimer } from './WorkoutTimer';
import { ExerciseCard } from './ExerciseCard';
import { SetTracker } from './SetTracker';
import { WorkoutSummary } from './WorkoutSummary';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ExerciseSelector } from './ExerciseSelector';
import { LoadingScreen } from '../LoadingScreen';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';

interface WorkoutExecutionInterfaceProps {
  planId: string;
  workoutId: string;
}

export function WorkoutExecutionInterface({ planId, workoutId }: WorkoutExecutionInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [workout, setWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [completedExerciseId, setCompletedExerciseId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(0);
  
  const {
    session,
    isActive,
    currentTime,
    startSession,
    updateExerciseProgress,
    completeWorkout,
    pauseSession,
    resumeSession
  } = useWorkoutSession(workoutId, planId);

  // Fetch workout details
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setIsLoading(true);
        
        // Buscar detalhes do treino
        const response = await fetch(`/api/workouts/${workoutId}`);
        if (!response.ok) {
          throw new Error('Treino não encontrado');
        }
        const data = await response.json();
        setWorkout(data);
        
        if (!session) {
          startSession(data);
        }
        
      } catch (error) {
        console.error('Error fetching workout:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar treino",
          description: "Não foi possível carregar os detalhes do treino.",
        });
        router.push(`/dashboard/my-workouts/${planId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId, planId, session, startSession, router, toast]);

  const currentExercise = workout?.workout_exercises?.[currentExerciseIndex];
  const totalExercises = workout?.workout_exercises?.length || 0;

  const isCurrentExerciseComplete = useCallback(() => {
    if (!session?.exercises || !currentExercise) return false;
    
    const exerciseProgress = session.exercises.find((e: any) => e.exercise_id === currentExercise.exercise.id);
    if (!exerciseProgress) return false;
    
    const completedSets = exerciseProgress.weights?.filter((w: any) => w !== undefined && w !== null).length || 0;
    return completedSets >= currentExercise.sets;
  }, [session?.exercises, currentExercise]);

  const handleExerciseComplete = useCallback((exerciseId: string) => {
    // Definir qual exercício foi completado e mostrar modal específico
    setCompletedExerciseId(exerciseId);
    setShowNotesModal(true);
  }, []);

  const handleNotesSubmit = useCallback(async (notesValue: string, difficultyValue: number) => {
    if (!completedExerciseId) return;
    
    try {
      await updateExerciseProgress(completedExerciseId, { 
        notes: notesValue,
        difficulty_rating: difficultyValue 
      });
      
      // Limpar o exercício completado e resetar form
      setCompletedExerciseId(null);
      setShowNotesModal(false);
      setNotes('');
      setDifficultyRating(0);
      
      // Verificar se foi o último exercício
      const isLastExercise = currentExerciseIndex === totalExercises - 1;
      
      if (isLastExercise) {
        // Se foi o último exercício, mostrar opção de finalizar automaticamente
        toast({
          title: "Parabéns! 🎉",
          description: "Você completou todos os exercícios! Finalizando treino...",
          duration: 2000,
        });
        
        // Aguardar um pouco para o usuário ver a mensagem, depois ir para o resumo
        setTimeout(() => {
          setShowSummary(true);
        }, 2000);
      } else {
        // Avançar para próximo exercício automaticamente
        const nextExerciseIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextExerciseIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast({
          title: "Exercício concluído! 💪",
          description: `Avançando para: ${workout?.workout_exercises?.[nextExerciseIndex]?.exercise?.name}`,
        });
      }
      
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas observações.",
      });
    }
  }, [completedExerciseId, updateExerciseProgress, toast, currentExerciseIndex, totalExercises, workout, setShowSummary]);

  const handleNotesModalClose = () => {
    // Permitir fechar o modal sem bloquear o fluxo
    if (completedExerciseId) {
      // Se tem um exercício completado, salvar sem observações
      handleNotesSubmit('', 0);
    } else {
      // Limpar estados e fechar
      setShowNotesModal(false);
      setNotes('');
      setDifficultyRating(0);
    }
  };

  const handleSetComplete = useCallback(async (setIndex: number, weight: number, reps: number) => {
    if (!session || !currentExercise) return;

    try {
      const exerciseProgress = session.exercises?.find((e: any) => e.exercise_id === currentExercise.exercise.id);
      if (!exerciseProgress) return;

      const newWeights = [...(exerciseProgress.weights || [])];
      const newReps = [...(exerciseProgress.reps || [])];
      
      newWeights[setIndex] = weight;
      newReps[setIndex] = reps;

      await updateExerciseProgress(currentExercise.exercise.id, {
        weights: newWeights,
        reps: newReps,
        sets_completed: Math.max(exerciseProgress.sets_completed || 0, setIndex + 1)
      });

      // Verificar se exercício foi concluído
      if (setIndex + 1 >= currentExercise.sets) {
        handleExerciseComplete(currentExercise.exercise.id);
      }
    } catch (error) {
      console.error('Erro ao completar série:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar série",
        description: "Não foi possível salvar o progresso da série.",
      });
    }
  }, [session, currentExercise, updateExerciseProgress, handleExerciseComplete, toast]);

  const handleFinishWorkout = async (finalNotes?: string) => {
    try {
      await completeWorkout(finalNotes);
      
      toast({
        title: "Treino finalizado! 🎉",
        description: "Parabéns! Seu treino foi registrado com sucesso.",
      });
      
      router.push('/dashboard/my-workouts');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao finalizar treino",
        description: "Não foi possível salvar o progresso do treino.",
      });
    }
  };

  const handleExerciseSelect = (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setShowExerciseSelector(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateExercise = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    } else if (direction === 'next' && currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    router.push(`/dashboard/my-workouts/${planId}`);
  };

  const areAllExercisesCompleted = useCallback(() => {
    if (!session?.exercises || !workout?.workout_exercises) return false;
    
    return workout.workout_exercises.every((we: any) => {
      const progress = session.exercises.find((e: any) => e.exercise_id === we.exercise.id);
      return progress && (progress.sets_completed || 0) >= we.sets;
    });
  }, [session?.exercises, workout?.workout_exercises]);

  const shouldShowFinishButton = () => {
    if (!session?.exercises) return false;
    
    // Mostrar se todos os exercícios estão completos OU se pelo menos metade foi iniciada
    const allCompleted = areAllExercisesCompleted();
    if (allCompleted) return true;
    
    const startedExercises = session.exercises.filter((e: any) => (e.sets_completed || 0) > 0).length;
    return startedExercises >= Math.ceil(totalExercises / 2);
  };

  const getCompletedExercisesCount = () => {
    if (!session?.exercises || !workout?.workout_exercises) return 0;
    return workout.workout_exercises.filter((we: any) => {
      const progress = session.exercises.find((e: any) => e.exercise_id === we.exercise.id);
      return progress && (progress.sets_completed || 0) >= we.sets;
    }).length;
  };

  if (isLoading || !workout) {
    return <LoadingScreen />;
  }

  if (showSummary) {
    return (
      <WorkoutSummary
        workout={workout}
        session={session}
        totalTime={currentTime}
        onFinish={handleFinishWorkout}
        onBack={() => setShowSummary(false)}
      />
    );
  }

  const completedCount = getCompletedExercisesCount();

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 py-4 max-w-lg">
        
        {/* Header Melhorado */}
        <div className="sticky top-0 z-40 bg-app-overlay/95 backdrop-blur-xl rounded-2xl p-4 shadow-app-xl border border-app-border-accent/50 mb-4">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={handleExit}
              size="sm"
              className="h-9 w-9 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-xl text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>

            <WorkoutTimer 
              currentTime={currentTime}
              isActive={isActive && !session?.is_paused}
              onPause={pauseSession}
              onResume={resumeSession}
            />

            {shouldShowFinishButton() && (
              <Button
                variant="ghost"
                onClick={() => setShowSummary(true)}
                size="sm"
                className={`h-9 px-3 rounded-xl text-green-600 transition-all duration-300 ${
                  areAllExercisesCompleted() 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 animate-pulse' 
                    : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50'
                }`}
              >
                <Trophy className="h-4 w-4 mr-1" />
                <span className="text-xs font-semibold">
                  {areAllExercisesCompleted() ? 'Finalizar!' : 'Finalizar'}
                </span>
              </Button>
            )}
          </div>

          {/* Workout Info */}
          <div className="text-center mb-3">
            <h1 className="text-lg font-bold text-app-heading mb-1">
              {workout.name}
            </h1>
            <p className="text-sm text-app-text-secondary">
              {completedCount} de {totalExercises} exercícios concluídos
            </p>
          </div>

          {/* Exercise Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateExercise('prev')}
              disabled={currentExerciseIndex === 0}
              className="h-8 w-8 p-0 hover:bg-app-bg-secondary rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowExerciseSelector(true)}
              className="flex-1 mx-2 h-8 px-3 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-lg text-sm font-medium"
            >
              <List className="h-4 w-4 mr-2" />
              Exercício {currentExerciseIndex + 1} de {totalExercises}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateExercise('next')}
              disabled={currentExerciseIndex === totalExercises - 1}
              className="h-8 w-8 p-0 hover:bg-app-bg-secondary rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-4">
          
          {/* Mensagem de conclusão quando todos exercícios estão completos */}
          {areAllExercisesCompleted() && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 text-center shadow-app-xl">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                    Treino Completo! 🎉
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Todos os exercícios foram concluídos
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowSummary(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl px-6 py-3 shadow-app-large hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Ver Resumo e Finalizar
              </Button>
            </div>
          )}
          
          {/* Exercise Card com Botão de Detalhes */}
          {currentExercise && (
            <ExerciseCard
              exercise={currentExercise}
              exerciseNumber={currentExerciseIndex + 1}
              totalExercises={totalExercises}
              onShowDetails={() => setShowDetailsModal(true)}
            />
          )}

          {/* Set Tracker */}
          {currentExercise && session && (
            <SetTracker
              exercise={currentExercise}
              session={session}
              onSetComplete={handleSetComplete}
              onExerciseComplete={() => handleExerciseComplete(currentExercise.exercise.id)}
            />
          )}
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Modals */}
      <ExerciseDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        exercise={currentExercise?.exercise}
      />

      {/* Usar o modal melhorado com todos os campos */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-md"
            onClick={handleNotesModalClose}
          />
          
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/50 rounded-3xl w-full max-w-md shadow-app-xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
              <h3 className="text-xl font-bold text-app-heading">
                {currentExerciseIndex === totalExercises - 1 ? 'Último Exercício Concluído! 🏆' : 'Exercício Concluído! 🎉'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotesModalClose}
                className="h-8 w-8 text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-secondary rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="px-6 pb-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Celebration */}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-app-large ${
                  currentExerciseIndex === totalExercises - 1 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-app-achievement-consecutive'
                }`}>
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-app-heading mb-2">
                  {completedExerciseId 
                    ? workout?.workout_exercises?.find((we: any) => we.exercise.id === completedExerciseId)?.exercise?.name || ''
                    : ''
                  }
                </h4>
                <p className="text-sm text-app-text-secondary">
                  {currentExerciseIndex === totalExercises - 1 
                    ? 'Parabéns! Você completou todos os exercícios!' 
                    : 'Parabéns! Como foi este exercício?'
                  }
                </p>
              </div>

              {/* Difficulty Rating */}
              <div>
                <label className="text-sm font-semibold text-app-heading mb-3 block text-center">
                  Como foi a dificuldade?
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const difficultyInfo = {
                      1: { emoji: '😴', label: 'Muito Fácil' },
                      2: { emoji: '😊', label: 'Fácil' },
                      3: { emoji: '😐', label: 'Moderado' },
                      4: { emoji: '😅', label: 'Difícil' },
                      5: { emoji: '🥵', label: 'Muito Difícil' }
                    }[level] || { emoji: '😐', label: 'Moderado' };

                    return (
                      <button
                        key={level}
                        onClick={() => setDifficultyRating(level)}
                        className={`w-14 h-14 rounded-xl border-2 transition-all duration-200 ${
                          difficultyRating === level 
                            ? 'bg-app-achievement-workout text-white border-app-achievement-workout scale-110' 
                            : 'border-app-border-muted hover:bg-app-bg-secondary hover:scale-105'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg">{difficultyInfo.emoji}</div>
                          <div className="text-xs font-bold">{level}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {difficultyRating > 0 && (
                  <p className="text-center text-xs text-app-text-secondary mt-2">
                    {
                      {
                        1: 'Muito Fácil',
                        2: 'Fácil', 
                        3: 'Moderado',
                        4: 'Difícil',
                        5: 'Muito Difícil'
                      }[difficultyRating]
                    }
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-app-heading mb-2 block">
                  Observações pessoais (opcional):
                </label>
                <textarea
                  placeholder="Como foi este exercício? Dificuldades, melhorias, sensações..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[80px] max-h-[120px] p-3 bg-app-card border border-app-border-muted focus:border-app-achievement-workout rounded-xl text-sm resize-none outline-none transition-colors"
                />
              </div>

              {/* Achievement Stars */}
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className="h-5 w-5 text-yellow-400 fill-yellow-400" 
                    />
                  ))}
                </div>
                <p className="text-xs text-app-text-secondary">
                  +5 XP por completar o exercício
                </p>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 p-6 pt-4 border-t border-app-border-muted bg-app-bg-secondary/50">
              <div className="space-y-3">
                <Button
                  onClick={() => handleNotesSubmit(notes, difficultyRating)}
                  className={`w-full font-bold rounded-2xl py-4 text-lg shadow-app-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                    currentExerciseIndex === totalExercises - 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      : 'bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white'
                  }`}
                >
                  <Save className="h-5 w-5 mr-3" />
                  {currentExerciseIndex === totalExercises - 1 ? 'Finalizar Treino' : 'Salvar e Continuar'}
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleNotesSubmit('', 0)}
                  className="w-full bg-app-card border-2 border-app-border-muted hover:bg-app-bg-secondary rounded-2xl font-semibold py-3 transition-all duration-300"
                >
                  Pular e Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ExerciseSelector
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        exercises={workout?.workout_exercises || []}
        currentIndex={currentExerciseIndex}
        session={session}
        onSelect={handleExerciseSelect}
      />

      <ConfirmationDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
        title="Sair do Treino?"
        description="Seu progresso será salvo automaticamente e você poderá continuar depois."
        confirmText="Sair e Salvar"
        cancelText="Continuar Treinando"
      />
    </div>
  );
}