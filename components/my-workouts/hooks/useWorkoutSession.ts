// hooks/useWorkoutSession.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface ExerciseProgress {
  exercise_id: string;
  weights: number[];
  reps: number[];
  sets_completed: number;
  notes?: string;
  difficulty_rating?: number;
}

interface WorkoutSession {
  workout_id: string;
  plan_id: string;
  started_at: string;
  exercises: ExerciseProgress[];
  is_paused: boolean;
  pause_time?: number;
  total_pause_time: number;
}

export function useWorkoutSession(workoutId: string, planId: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar sessão existente do localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem(`workout_session_${workoutId}`);
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSession(parsedSession);
      
      // Calcular tempo decorrido
      const started = new Date(parsedSession.started_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - started) / 1000) - parsedSession.total_pause_time;
      setCurrentTime(elapsed);
      
      if (!parsedSession.is_paused) {
        setIsActive(true);
      }
    }
  }, [workoutId]);

  // Timer
  useEffect(() => {
    if (isActive && !session?.is_paused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, session?.is_paused]);

  // Salvar sessão no localStorage sempre que atualizar
  useEffect(() => {
    if (session) {
      localStorage.setItem(`workout_session_${workoutId}`, JSON.stringify(session));
    }
  }, [session, workoutId]);

  const startSession = useCallback((workout: any) => {
    const newSession: WorkoutSession = {
      workout_id: workoutId,
      plan_id: planId,
      started_at: new Date().toISOString(),
      exercises: workout.workout_exercises.map((ex: any) => ({
        exercise_id: ex.exercise.id,
        weights: new Array(ex.sets).fill(undefined),
        reps: new Array(ex.sets).fill(undefined),
        sets_completed: 0
      })),
      is_paused: false,
      total_pause_time: 0
    };

    setSession(newSession);
    setIsActive(true);
    setCurrentTime(0);
  }, [workoutId, planId]);

  const pauseSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        is_paused: true,
        pause_time: Date.now()
      };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setSession(prev => {
      if (!prev || !prev.pause_time) return prev;
      
      const pauseDuration = Math.floor((Date.now() - prev.pause_time) / 1000);
      return {
        ...prev,
        is_paused: false,
        pause_time: undefined,
        total_pause_time: prev.total_pause_time + pauseDuration
      };
    });
  }, []);

  const updateExerciseProgress = useCallback((exerciseId: string, updates: Partial<ExerciseProgress>) => {
    setSession(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        exercises: prev.exercises.map(ex => 
          ex.exercise_id === exerciseId 
            ? { ...ex, ...updates }
            : ex
        )
      };
    });
  }, []);

  const completeWorkout = useCallback(async (notes?: string) => {
    if (!session) return;

    // Calcular duração total
    const duration = currentTime;

    // Preparar dados para API
    const workoutData = {
      workoutId,
      planId,
      duration,
      exercises: session.exercises.map(ex => ({
        exercise_id: ex.exercise_id,
        weights: ex.weights.filter(w => w !== undefined),
        reps: ex.reps.filter(r => r !== undefined),
        sets_completed: ex.sets_completed,
        notes: ex.notes,
        difficulty_rating: ex.difficulty_rating
      })),
      notes
    };

    // Enviar para API
    const response = await fetch('/api/workout-progress/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      throw new Error('Failed to complete workout');
    }

    // Limpar sessão do localStorage
    localStorage.removeItem(`workout_session_${workoutId}`);
    
    return response.json();
  }, [session, workoutId, planId, currentTime]);

  const resetSession = useCallback(() => {
    localStorage.removeItem(`workout_session_${workoutId}`);
    setSession(null);
    setCurrentTime(0);
    setIsActive(false);
  }, [workoutId]);

  return {
    session,
    isActive,
    currentTime,
    startSession,
    pauseSession,
    resumeSession,
    updateExerciseProgress,
    completeWorkout,
    resetSession
  };
}