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
  Trophy
} from 'lucide-react';
import { WorkoutTimer } from './WorkoutTimer';
import { ExerciseCard } from './ExerciseCard';
import { SetTracker } from './SetTracker';
import { WorkoutSummary } from './WorkoutSummary';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';
import { ExerciseNotesModal } from './ExerciseNotesModal';
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  
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

  const handleExerciseComplete = useCallback(() => {
    // Mostrar modal de anotações quando exercício é concluído
    setShowNotesModal(true);
  }, []);

  const handleNotesSubmit = useCallback(async (notes: string, difficulty: number) => {
    if (!currentExercise) return;
    
    try {
      await updateExerciseProgress(currentExercise.exercise.id, { 
        notes,
        difficulty_rating: difficulty 
      });
      
      // Avançar para próximo exercício ou finalizar
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
    }
  }, [currentExercise, currentExerciseIndex, totalExercises, updateExerciseProgress]);

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
        handleExerciseComplete();
      }
    } catch (error) {
      console.error('Erro ao completar série:', error);
    }
  }, [session, currentExercise, updateExerciseProgress, handleExerciseComplete]);

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

  const shouldShowFinishButton = () => {
    if (!session?.exercises) return false;
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
      <div className="container mx-auto px-3 py-4 max-w-lg">
        
                  {/* Header Limpo e Compacto */}
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
                className="h-9 px-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-xl text-green-600"
              >
                <Trophy className="h-4 w-4 mr-1" />
                <span className="text-xs font-semibold">Finalizar</span>
              </Button>
            )}
          </div>

          {/* Workout Info */}
          <div className="text-center">
            <h1 className="text-lg font-bold text-app-heading mb-1">
              {workout.name}
            </h1>
            <p className="text-sm text-app-text-secondary">
              Exercício {currentExerciseIndex + 1} de {totalExercises}
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-4">
          
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
              onExerciseComplete={handleExerciseComplete}
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

      <ExerciseNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        onSave={handleNotesSubmit}
        exerciseName={currentExercise?.exercise?.name || ''}
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