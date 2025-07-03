// components/workouts/hooks/useExerciseLibrary.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Exercise, ExerciseFilters } from '../types';
import { DEFAULT_EXERCISE_FILTERS } from '../constants';


export function useExerciseLibrary() {
  const { toast } = useToast();
  
  // Estados
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filters, setFilters] = useState<ExerciseFilters>(DEFAULT_EXERCISE_FILTERS);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar exercícios
  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/exercises');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Verificar se data é um array
      if (Array.isArray(data)) {
        setExercises(data);
      } else if (data && Array.isArray(data.exercises)) {
        // Caso a API retorne { exercises: [...] }
        setExercises(data.exercises);
      } else {
        console.warn('API retornou dados em formato inesperado:', data);
        setExercises([]);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar exercícios:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar exercícios",
        description: error.message || 'Erro desconhecido ao carregar exercícios',
      });
      // Definir array vazio em caso de erro
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carregar exercícios na inicialização
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Filtrar exercícios
  const filteredExercises = useMemo(() => {
    // Garantir que exercises é sempre um array
    if (!Array.isArray(exercises)) {
      console.warn('exercises não é um array:', exercises);
      return [];
    }

    return exercises.filter(exercise => {
      // Verificar se exercise é um objeto válido
      if (!exercise || typeof exercise !== 'object') {
        return false;
      }

      // Filtro por nome/descrição
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const name = exercise.name?.toLowerCase() || '';
        const description = exercise.description?.toLowerCase() || '';
        
        if (!name.includes(searchTerm) && !description.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por grupo muscular
      if (filters.muscleGroup && filters.muscleGroup !== 'all') {
        const muscleGroups = exercise.muscle_group || [];
        if (!Array.isArray(muscleGroups)) {
          return false;
        }
        
        const hasMatchingMuscleGroup = muscleGroups.some(
          muscle => muscle?.toLowerCase()?.includes(filters.muscleGroup.toLowerCase())
        );
        if (!hasMatchingMuscleGroup) {
          return false;
        }
      }

      // Filtro por equipamento
      if (filters.equipment && filters.equipment !== 'all') {
        const equipments = exercise.equipment || [];
        if (!Array.isArray(equipments) || equipments.length === 0) {
          return false;
        }
        
        const hasMatchingEquipment = equipments.some(
          equipment => equipment?.toLowerCase()?.includes(filters.equipment.toLowerCase())
        );
        if (!hasMatchingEquipment) {
          return false;
        }
      }

      return true;
    });
  }, [exercises, filters]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_EXERCISE_FILTERS);
  }, []);

  // Recarregar exercícios
  const refreshExercises = useCallback(() => {
    return fetchExercises();
  }, [fetchExercises]);

  return {
    exercises: filteredExercises,
    filteredExercises,
    allExercises: exercises,
    filters,
    isLoading,
    updateFilters,
    clearFilters,
    refreshExercises,
    hasActiveFilters: filters.search !== '' || filters.muscleGroup !== 'all' || filters.equipment !== 'all'
  };
}