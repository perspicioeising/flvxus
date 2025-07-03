
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Play,
  Pause,
  StopCircle,
  Timer,
  Dumbbell,
  Target,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  Trophy,
  Star,
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import { WorkoutTimer } from './WorkoutTimer';
import { ExerciseCard } from './ExerciseCard';
import { SetTracker } from './SetTracker';
import { WorkoutSummary } from './/WorkoutSummary';
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

  const handleExerciseComplete = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Último exercício completado
      setShowSummary(true);
    }
  }, [currentExerciseIndex, totalExercises]);

  const handleSetComplete = useCallback((setIndex: number, weight: number, reps: number) => {
    if (!session || !currentExercise) return;

    const exerciseProgress = session.exercises.find(e => e.exercise_id === currentExercise.exercise.id);
    if (!exerciseProgress) return;

    const newWeights = [...exerciseProgress.weights];
    const newReps = [...exerciseProgress.reps];
    
    newWeights[setIndex] = weight;
    newReps[setIndex] = reps;

    updateExerciseProgress(currentExercise.exercise.id, {
      weights: newWeights,
      reps: newReps,
      sets_completed: Math.max(exerciseProgress.sets_completed, setIndex + 1)
    });
  }, [session, currentExercise, updateExerciseProgress]);

  const handleExerciseNotes = useCallback((notes: string) => {
    if (!currentExercise) return;
    
    updateExerciseProgress(currentExercise.exercise.id, { notes });
  }, [currentExercise, updateExerciseProgress]);

  const handleDifficultyRating = useCallback((rating: number) => {
    if (!currentExercise) return;
    
    updateExerciseProgress(currentExercise.exercise.id, { difficulty_rating: rating });
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
    // Manter sessão salva no localStorage para continuar depois
    router.push(`/dashboard/my-workouts/${planId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <div className="container mx-auto px-2 py-4 max-w-4xl">
        
        {/* Header fixo */}
        <div className="sticky top-0 z-40 bg-app-gradient/95 backdrop-blur-xl pb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-orange-500/20 to-app-achievement-workout/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl p-4 shadow-app-xl">
              
              {/* Navigation e Timer */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  onClick={handleExit}
                  className="h-10 w-10 bg-app-bg-secondary hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
                >
                  <X className="h-5 w-5 text-red-600" />
                </Button>

                <div className="flex items-center gap-4">
                  <WorkoutTimer 
                    currentTime={currentTime}
                    isActive={isActive && !session?.is_paused}
                    onPause={pauseSession}
                    onResume={resumeSession}
                  />
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setShowSummary(true)}
                  className="h-10 px-4 bg-app-bg-secondary hover:bg-green-100 dark:hover:bg-green-900/20 rounded-xl transition-all duration-300 text-green-600"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Finalizar</span>
                </Button>
              </div>

              {/* Workout Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-achievement-workout rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg sm:text-xl font-bold text-app-heading">
                      {workout.name}
                    </h1>
                    <p className="text-sm text-app-text-secondary">
                      Exercício {currentExerciseIndex + 1} de {totalExercises}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-app-text-secondary">Progresso do Treino</span>
                    <span className="font-semibold text-app-heading">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-6 mt-6">
          
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

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
              className="flex-1 bg-app-card border-app-border-muted hover:bg-app-border-accent/20 rounded-xl font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={() => setCurrentExerciseIndex(prev => Math.min(totalExercises - 1, prev + 1))}
              disabled={currentExerciseIndex === totalExercises - 1}
              className="flex-1 bg-gradient-to-r from-app-achievement-workout to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl"
            >
              Próximo
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </div>

        {/* Bottom Padding for mobile */}
        <div className="h-20"></div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
        title="Sair do Treino?"
        description="Seu progresso será salvo e você poderá continuar depois."
        confirmText="Sair"
        cancelText="Continuar Treinando"
      />
    </div>
  );
}