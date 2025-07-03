'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Dumbbell,
  X,
  ChevronLeft,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { WorkoutTimer } from './WorkoutTimer';
import { ExerciseCard } from './ExerciseCard';
import { SetTracker } from './SetTracker';
import { WorkoutSummary } from './WorkoutSummary';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { LoadingScreen } from '../LoadingScreen';

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
        const response = await fetch(`/api/workouts/${workoutId}`);
        
        if (!response.ok) {
          throw new Error('Treino não encontrado');
        }
        
        const data = await response.json();
        setWorkout(data);
        
        // Se não há sessão ativa, iniciar nova sessão
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
  const progress = totalExercises > 0 ? ((currentExerciseIndex + 1) / totalExercises) * 100 : 0;

  // Verificar se todas as séries do exercício atual foram completadas
  const isCurrentExerciseComplete = useCallback(() => {
    if (!session?.exercises || !currentExercise) return false;
    
    const exerciseProgress = session.exercises.find((e: any) => e.exercise_id === currentExercise.exercise.id);
    if (!exerciseProgress) return false;
    
    const completedSets = exerciseProgress.weights?.filter((w: any) => w !== undefined && w !== null).length || 0;
    return completedSets >= currentExercise.sets;
  }, [session?.exercises, currentExercise]);

  const handleExerciseComplete = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Último exercício completado - mostrar resumo
      setShowSummary(true);
    }
  }, [currentExerciseIndex, totalExercises]);

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
    } catch (error) {
      console.error('Erro ao completar série:', error);
    }
  }, [session, currentExercise, updateExerciseProgress]);

  const handleExerciseNotes = useCallback(async (notes: string) => {
    if (!currentExercise) return;
    
    try {
      await updateExerciseProgress(currentExercise.exercise.id, { notes });
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
    }
  }, [currentExercise, updateExerciseProgress]);

  const handleDifficultyRating = useCallback(async (rating: number) => {
    if (!currentExercise) return;
    
    try {
      await updateExerciseProgress(currentExercise.exercise.id, { difficulty_rating: rating });
    } catch (error) {
      console.error('Erro ao salvar dificuldade:', error);
    }
  }, [currentExercise, updateExerciseProgress]);

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

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    router.push(`/dashboard/my-workouts/${planId}`);
  };

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Verificar se deve mostrar o botão de finalizar
  const shouldShowFinishButton = () => {
    if (!session?.exercises) return false;
    
    // Verificar se pelo menos metade dos exercícios foi iniciada
    const startedExercises = session.exercises.filter((e: any) => (e.sets_completed || 0) > 0).length;
    return startedExercises >= Math.ceil(totalExercises / 2);
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

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 py-4 max-w-2xl">
        
        {/* Header Compacto */}
        <div className="sticky top-0 z-50 bg-app-overlay/95 backdrop-blur-xl pb-4 -mx-3 px-3 border-b border-app-border-accent/30">
          <div className="bg-app-overlay border border-app-border-accent/50 rounded-2xl p-3 shadow-app-xl">
            
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
                  className="h-9 px-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-xl text-green-600"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  <span className="text-xs font-semibold">Finalizar</span>
                </Button>
              )}
            </div>

            {/* Workout Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-app-heading truncate">
                    {workout.name}
                  </h1>
                  <p className="text-xs text-app-text-secondary">
                    Exercício {currentExerciseIndex + 1} de {totalExercises}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-app-text-secondary">Progresso</span>
                  <span className="font-bold text-app-heading">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Exercise Navigation */}
              <div className="flex items-center justify-between bg-app-bg-secondary rounded-xl p-2">
                <Button
                  variant="ghost"
                  onClick={goToPreviousExercise}
                  disabled={currentExerciseIndex === 0}
                  size="sm"
                  className="h-8 px-3 bg-app-card hover:bg-app-bg-accent rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  <span className="text-xs">Anterior</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalExercises, 5) }, (_, i) => {
                    const isActive = i === currentExerciseIndex;
                    const isCompleted = session?.exercises?.[i] && (session.exercises[i].sets_completed || 0) > 0;
                    
                    return (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          isActive 
                            ? 'bg-app-achievement-workout w-4' 
                            : isCompleted 
                              ? 'bg-app-achievement-consecutive' 
                              : 'bg-app-text-muted'
                        }`}
                      />
                    );
                  })}
                  {totalExercises > 5 && (
                    <span className="text-xs text-app-text-muted ml-1">+{totalExercises - 5}</span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={goToNextExercise}
                  disabled={currentExerciseIndex === totalExercises - 1}
                  size="sm"
                  className="h-8 px-3 bg-app-card hover:bg-app-bg-accent rounded-lg disabled:opacity-50"
                >
                  <span className="text-xs">Próximo</span>
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-4 mt-4">
          
          {/* Exercise Card */}
          {currentExercise && (
            <ExerciseCard
              exercise={currentExercise}
              exerciseNumber={currentExerciseIndex + 1}
              totalExercises={totalExercises}
              onComplete={handleExerciseComplete}
              onNotesChange={handleExerciseNotes}
              onDifficultyRating={handleDifficultyRating}
            />
          )}

          {/* Set Tracker */}
          {currentExercise && session && (
            <SetTracker
              exercise={currentExercise}
              session={session}
              onSetComplete={handleSetComplete}
              onExerciseComplete={handleExerciseComplete}
            />
          )}

          {/* Navigation Buttons - Only when needed */}
          {(currentExerciseIndex > 0 || currentExerciseIndex < totalExercises - 1 || isCurrentExerciseComplete()) && (
            <div className="flex gap-3">
              {currentExerciseIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={goToPreviousExercise}
                  className="flex-1 bg-app-card border-app-border-muted hover:bg-app-bg-secondary rounded-xl font-medium py-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Exercício Anterior
                </Button>
              )}

              {(currentExerciseIndex < totalExercises - 1 && isCurrentExerciseComplete()) && (
                <Button
                  onClick={goToNextExercise}
                  className="flex-1 bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl py-3"
                >
                  Próximo Exercício
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {(currentExerciseIndex === totalExercises - 1 && isCurrentExerciseComplete()) && (
                <Button
                  onClick={() => setShowSummary(true)}
                  className="flex-1 bg-app-achievement-consecutive hover:bg-app-achievement-consecutive/90 text-white font-bold rounded-xl py-3"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Finalizar Treino
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Confirmation Dialog */}
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