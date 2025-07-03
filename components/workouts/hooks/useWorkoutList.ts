// components/workouts/hooks/useWorkoutList.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Workout, 
  WorkoutFilters, 
  WorkoutStats, 
  PaginationData,
} from '../types';
import { PAGINATION_DEFAULTS, DEFAULT_FILTERS } from '../constants';


export function useWorkoutList() {
  const { toast } = useToast();
  
  // Estados principais
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationData & { hasMore: boolean }>({
    ...PAGINATION_DEFAULTS,
    hasMore: true
  });

  // Estatísticas calculadas
  const stats = useMemo((): WorkoutStats => {
    const totalExercises = workouts.reduce((sum, workout) => {
      return sum + (workout.workout_exercises?.length || 0);
    }, 0);

    const avgExercisesPerWorkout = workouts.length > 0 
      ? Math.round(totalExercises / workouts.length)
      : 0;

    const uniqueLevels = new Set(workouts.map(w => w.level)).size;
    const uniqueGoals = new Set(workouts.map(w => w.goal)).size;

    // Treinos criados nos últimos 7 dias
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentWorkouts = workouts.filter(w => 
      new Date(w.created_at) > weekAgo
    ).length;

    return {
      total: pagination.total,
      totalExercises,
      avgExercisesPerWorkout,
      uniqueLevels,
      uniqueGoals,
      recentWorkouts
    };
  }, [workouts, pagination.total]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' || 
           filters.level !== 'all' || 
           filters.goal !== 'all' ||
           filters.sortBy !== 'created_at' ||
           filters.sortOrder !== 'desc';
  }, [filters]);

  // Função para buscar treinos
  const fetchWorkouts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      // Construir URL com parâmetros
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.level !== 'all' && { level: filters.level }),
        ...(filters.goal !== 'all' && { goal: filters.goal }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`/api/workouts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar treinos');
      }

      if (append) {
        setWorkouts(prev => [...prev, ...data.workouts]);
      } else {
        setWorkouts(data.workouts);
      }

      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasMore: data.pagination.hasMore
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, pagination.limit, toast]);

  // Carregar treinos quando filtros mudarem
  useEffect(() => {
    fetchWorkouts(1, false);
  }, [filters]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Recarregar treinos
  const refreshWorkouts = useCallback(() => {
    return fetchWorkouts(1, false);
  }, [fetchWorkouts]);

  // Carregar mais treinos (para paginação/infinite scroll)
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingMore) return;
    
    const nextPage = pagination.page + 1;
    await fetchWorkouts(nextPage, true);
  }, [fetchWorkouts, pagination.hasMore, pagination.page, isLoadingMore]);

  // Mudança de página
  const handlePageChange = useCallback((page: number) => {
    fetchWorkouts(page, false);
  }, [fetchWorkouts]);

  // Mudança de tamanho da página
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, limit: pageSize }));
  }, []);

  return {
    // Estados
    workouts,
    isLoading,
    isLoadingMore,
    stats,
    filters,
    pagination,
    viewMode,
    hasActiveFilters,
    
    // Ações
    updateFilters,
    clearFilters,
    refreshWorkouts,
    handlePageChange,
    handlePageSizeChange,
    setViewMode,
    loadMore
  };
}