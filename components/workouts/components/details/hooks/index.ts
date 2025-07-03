// components/workouts/detail/hooks/index.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  WorkoutDetailData, 
  WorkoutStats, 
  UseWorkoutDetailReturn,
  UseWorkoutActionsReturn
} from '../types';

// Hook para carregar detalhes do treino
export const useWorkoutDetail = (workoutId: string): UseWorkoutDetailReturn => {
  const { toast } = useToast();
  const [workout, setWorkout] = useState<WorkoutDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcular estatísticas do treino (ATUALIZADO para nova estrutura)
  const stats = useMemo((): WorkoutStats | null => {
    if (!workout || !workout.workout_exercises) return null;

    const exercises = workout.workout_exercises;
    
    // Verificar se há configuração avançada
    const hasAdvancedConfiguration = exercises.some(ex => ex.sets_config && ex.sets_config.length > 0);
    
    // Calcular total de séries
    const totalSets = exercises.reduce((sum, ex) => {
      return sum + (ex.sets_config?.length || ex.sets);
    }, 0);

    // Calcular total de repetições (apenas se houver sets_config)
    let totalReps: number = 0; // Initialize with 0
    if (hasAdvancedConfiguration) {
      totalReps = exercises.reduce((sum, ex) => {
        if (ex.sets_config && ex.sets_config.length > 0) {
          return sum + ex.sets_config.reduce((setSum, set) => setSum + set.target_reps, 0);
        }
        return sum + (ex.sets * ex.reps);
      }, 0);
    }

    // Calcular tempo estimado
    const estimatedDuration = exercises.reduce((sum, ex) => {
      const exerciseSets = ex.sets_config?.length || ex.sets;
      const exerciseTime = exerciseSets * 30; // 30s por série estimado
      const restTime = (exerciseSets - 1) * ex.rest;
      return sum + exerciseTime + restTime;
    }, 0);

    const muscleGroups = Array.from(
      new Set(exercises.flatMap(ex => ex.exercise.muscle_group))
    );

    const equipmentNeeded = Array.from(
      new Set(exercises.flatMap(ex => ex.exercise.equipment || []))
    );

    return {
      totalExercises: exercises.length,
      totalSets,
      totalReps,
      estimatedDuration: Math.round(estimatedDuration / 60), // em minutos
      averageRest: exercises.length > 0 ? Math.round(exercises.reduce((sum, ex) => sum + ex.rest, 0) / exercises.length) : 0,
      muscleGroups,
      equipmentNeeded,
      hasAdvancedConfiguration
    };
  }, [workout]);

  // Buscar detalhes do treino
  const fetchWorkout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/workouts/${workoutId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar treino');
      }

      setWorkout(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar treino",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast]);

  // Refresh do treino
  const refreshWorkout = useCallback(() => {
    return fetchWorkout();
  }, [fetchWorkout]);

  // Carregar no mount
  useEffect(() => {
    if (workoutId) {
      fetchWorkout();
    }
  }, [workoutId, fetchWorkout]);

  return {
    workout,
    stats,
    isLoading,
    error,
    refreshWorkout
  };
};

// Hook para ações do treino (clonar, deletar) - ATUALIZADO
export const useWorkoutActions = (): UseWorkoutActionsReturn => {
  const router = useRouter();
  const { toast } = useToast();
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const cloneWorkout = useCallback(async (workout: WorkoutDetailData) => {
    try {
      setIsCloning(true);

      const cloneData = {
        name: `${workout.name} (Cópia)`,
        description: workout.description || "",
        level: workout.level,
        goal: workout.goal,
        exercises: workout.workout_exercises?.map((we, index) => ({
          exercise_id: we.exercise_id,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          sets_config: we.sets_config || [],
          general_notes: we.general_notes || we.notes || "",
          order: index + 1
        })) || []
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloneData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao clonar treino');
      }

      toast({
        title: "Treino clonado com sucesso! 📋",
        description: `${cloneData.name} foi criado`,
      });

      // Redirecionar para o novo treino ou lista
      router.push(`/dashboard/workouts/${result.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        variant: "destructive",
        title: "Erro ao clonar treino",
        description: message,
      });
    } finally {
      setIsCloning(false);
    }
  }, [toast, router]);

  const deleteWorkout = useCallback(async (workout: WorkoutDetailData) => {
    if (!confirm(`Tem certeza que deseja excluir o treino "${workout.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao deletar treino');
      }

      toast({
        title: "Treino removido com sucesso! 🗑️",
        description: `${workout.name} foi removido`,
      });

      // Redirecionar para lista de treinos
      router.push('/dashboard/workouts');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        variant: "destructive",
        title: "Erro ao remover treino",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [toast, router]);

  return {
    isCloning,
    isDeleting,
    cloneWorkout,
    deleteWorkout
  };
};