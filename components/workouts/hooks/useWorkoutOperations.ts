// components/workouts/hooks/useWorkoutOperations.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Workout, CreateWorkoutRequest } from '../types';
import { SUCCESS_MESSAGES } from '../constants';

export function useWorkoutOperations() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Criar treino
  const createWorkout = useCallback(async (data: CreateWorkoutRequest): Promise<Workout> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar treino');
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_CREATED,
        description: `Treino "${data.name}" criado com sucesso!`,
      });

      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar treino",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Atualizar treino
  const updateWorkout = useCallback(async (id: string, data: Partial<CreateWorkoutRequest>): Promise<Workout> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar treino');
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_UPDATED,
        description: `Treino "${data.name}" atualizado com sucesso!`,
      });

      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar treino",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Deletar treino
  const deleteWorkout = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar treino');
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_DELETED,
        description: `Treino "${name}" removido com sucesso!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar treino",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Clonar treino
  const cloneWorkout = useCallback(async (workout: Workout): Promise<Workout> => {
    try {
      setIsLoading(true);
      
      // Preparar dados do treino clonado
      const cloneData: CreateWorkoutRequest = {
        name: `${workout.name} - Cópia`,
        description: workout.description || '',
        level: workout.level,
        goal: workout.goal,
        exercises: workout.workout_exercises?.map(we => ({
          exercise_id: we.exercise_id,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          sets_config: we.sets_config || [],
          general_notes: we.general_notes || '',
          order: we.order
        })) || []
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao clonar treino');
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_CLONED,
        description: `Treino "${workout.name}" clonado com sucesso!`,
      });

      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao clonar treino",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Buscar treino específico
  const getWorkout = useCallback(async (id: string): Promise<Workout> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workouts/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar treino');
      }

      return result;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar treino",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    createWorkout,
    updateWorkout,
    deleteWorkout,
    cloneWorkout,
    getWorkout,
    isLoading
  };
}