import { useState, useEffect, useCallback } from 'react';
import { WorkoutSession, ExerciseProgress } from '../types';

export function useWorkoutSession(workoutId: string, planId: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const startSession = useCallback((workout: any) => {
    const newSession: WorkoutSession = {
      workout_id: workoutId,
      plan_id: planId,
      started_at: new Date().toISOString(),
      exercises: workout.workout_exercises.map((we: any) => ({
        exercise_id: we.exercise.id,
        sets_completed: 0,
        weights: [],
        reps: [],
        difficulty_rating: undefined,
        notes: '',
        rest_time: we.rest
      })),
      current_exercise_index: 0,
      is_paused: false,
      total_duration: 0
    };
    
    setSession(newSession);
    setIsActive(true);
    
    // Salvar no localStorage como backup
    localStorage.setItem('current_workout_session', JSON.stringify(newSession));
  }, [workoutId, planId]);

  const updateExerciseProgress = useCallback((exerciseId: string, progress: Partial<ExerciseProgress>) => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      exercises: session.exercises.map(ex => 
        ex.exercise_id === exerciseId 
          ? { ...ex, ...progress }
          : ex
      )
    };
    
    setSession(updatedSession);
    localStorage.setItem('current_workout_session', JSON.stringify(updatedSession));
  }, [session]);

  const completeWorkout = useCallback(async (finalNotes?: string) => {
    if (!session) return;

    try {
      const workoutData = {
        workoutId: session.workout_id,
        planId: session.plan_id,
        duration: Math.floor(currentTime / 60), // em minutos
        exercises: session.exercises,
        notes: finalNotes
      };

      const response = await fetch('/api/workout-progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        throw new Error('Erro ao finalizar treino');
      }

      // Limpar sessão
      setSession(null);
      setIsActive(false);
      setCurrentTime(0);
      localStorage.removeItem('current_workout_session');

      return await response.json();
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }, [session, currentTime]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && session && !session.is_paused) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, session?.is_paused]);

  // Recuperar sessão do localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('current_workout_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.workout_id === workoutId && parsed.plan_id === planId) {
          setSession(parsed);
          setIsActive(true);
        }
      } catch (error) {
        localStorage.removeItem('current_workout_session');
      }
    }
  }, [workoutId, planId]);

  return {
    session,
    isActive,
    currentTime,
    startSession,
    updateExerciseProgress,
    completeWorkout,
    pauseSession: () => setSession(prev => prev ? { ...prev, is_paused: true } : null),
    resumeSession: () => setSession(prev => prev ? { ...prev, is_paused: false } : null)
  };
}