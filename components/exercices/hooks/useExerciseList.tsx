// /hooks/useExerciseList.tsx

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Exercise, 
  ExerciseStats, 
  ExerciseFilters, 
  ExercisePagination,
  ExerciseListResponse 
} from "@/components/exercices/types/exercise";
import { calculateExerciseStats, filterExercises } from "@/components/exercices/utils/exerciseUtils";

export function useExerciseList() {
  const { toast } = useToast();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [stats, setStats] = useState<ExerciseStats>({
    total: 0,
    thisMonth: 0,
    byMuscleGroup: {},
    byEquipment: {}
  });
  
  const [filters, setFilters] = useState<ExerciseFilters>({
    searchQuery: "",
    muscleFilter: "all",
    equipmentFilter: "all"
  });

  const [pagination, setPagination] = useState<ExercisePagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasMore: true // Começar com true para mostrar botão load more inicial
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch exercises inicial (busca todos)
  const fetchInitialExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fazendo requisição inicial para /api/exercises...');

      const response = await fetch('/api/exercises?all=true');
      const data = await response.json();

      console.log('📦 Resposta da API:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar exercícios');
      }

      let exercisesList: Exercise[] = [];
      
      if (Array.isArray(data)) {
        exercisesList = data;
      } else if (data.exercises) {
        exercisesList = data.exercises;
      } else {
        console.error('❌ Formato de resposta não reconhecido:', data);
        exercisesList = [];
      }

      console.log(`📊 Total de exercícios carregados: ${exercisesList.length}`);

      setAllExercises(exercisesList);
      calculateStats(exercisesList);

    } catch (error: any) {
      console.error('❌ Erro ao buscar exercícios:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar exercícios",
        description: error.message,
      });
      setAllExercises([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const calculateStats = (exercisesList: Exercise[]) => {
    console.log('📊 Calculando estatísticas para', exercisesList.length, 'exercícios');
    const newStats = calculateExerciseStats(exercisesList);
    console.log('📊 Stats calculados:', newStats);
    setStats(newStats);
  };

  // Filtrar exercícios localmente
  const filteredExercises = filterExercises(allExercises, filters);

  // Paginação local dos exercícios filtrados
  const paginatedExercises = filteredExercises.slice(0, pagination.page * pagination.limit);
  
  // Atualizar informações de paginação baseado nos filtros
  const updatePaginationInfo = useCallback(() => {
    const totalFiltered = filteredExercises.length;
    const totalPages = Math.ceil(totalFiltered / pagination.limit);
    const currentlyShowing = Math.min(pagination.page * pagination.limit, totalFiltered);
    const hasMore = currentlyShowing < totalFiltered;

    setPagination(prev => ({
      ...prev,
      total: totalFiltered,
      totalPages,
      hasMore
    }));
  }, [filteredExercises.length, pagination.limit, pagination.page]);

  // Load more exercises (aumenta página)
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      
      // Simular loading para UX
      setTimeout(() => {
        setPagination(prev => ({
          ...prev,
          page: prev.page + 1
        }));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [pagination.hasMore, isLoadingMore]);

  // Reset pagination quando filtros mudam
  const resetPagination = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  // Delete exercise
  const deleteExercise = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar exercício');
      }

      toast({
        title: "Exercício deletado",
        description: "O exercício foi removido com sucesso.",
      });

      // Remover da lista local
      setAllExercises(prev => prev.filter(ex => ex.id !== id));

    } catch (error: any) {
      console.error('❌ Erro ao deletar exercício:', error);
      toast({
        variant: "destructive",
        title: "Erro ao deletar exercício",
        description: error.message,
      });
    }
  }, [toast]);

  const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    resetPagination(); // Reset para página 1 quando filtros mudam
  }, [resetPagination]);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      muscleFilter: "all",
      equipmentFilter: "all"
    });
    resetPagination();
  }, [resetPagination]);

  const hasActiveFilters = Boolean(
    filters.searchQuery || 
    filters.muscleFilter !== 'all' || 
    filters.equipmentFilter !== 'all'
  );

  // Effect inicial - carregar dados uma vez
  useEffect(() => {
    fetchInitialExercises();
  }, []); // Apenas uma vez na inicialização

  // Effect para atualizar paginação quando filtros mudam
  useEffect(() => {
    updatePaginationInfo();
    console.log('📊 Paginação atualizada:', {
      totalFiltered: filteredExercises.length,
      page: pagination.page,
      limit: pagination.limit,
      showing: Math.min(pagination.page * pagination.limit, filteredExercises.length),
      hasMore: Math.min(pagination.page * pagination.limit, filteredExercises.length) < filteredExercises.length
    });
  }, [updatePaginationInfo]);

  // Effect para recalcular stats quando allExercises muda
  useEffect(() => {
    if (allExercises.length > 0) {
      calculateStats(allExercises);
    }
  }, [allExercises]);

  return {
    exercises: paginatedExercises,
    isLoading,
    isLoadingMore,
    stats,
    filters,
    pagination,
    viewMode,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    loadMore,
    deleteExercise,
    setViewMode,
    refetch: fetchInitialExercises
  };
}