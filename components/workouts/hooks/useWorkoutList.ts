// components/workouts/hooks/useWorkoutList.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Workout, 
  WorkoutFilters, 
  WorkoutStats, 
  PaginationData,
  UseWorkoutListReturn
} from '../types';
import { 
  DEFAULT_FILTERS, 
  PAGINATION_DEFAULTS, 
  API_ENDPOINTS,
  ERROR_MESSAGES
} from '../constants';

// Hook for workout list with async pagination
export const useWorkoutList = (): UseWorkoutListReturn & {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
} => {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationData & { hasMore: boolean }>({
    ...PAGINATION_DEFAULTS,
    hasMore: true
  });

  // Calculate stats
  const stats = useMemo((): WorkoutStats => {
    const totalExercises = workouts.reduce(
      (sum, workout) => sum + (workout.workout_exercises?.length || 0), 
      0
    );
    
    return {
      total: pagination.total,
      totalExercises,
      avgExercisesPerWorkout: workouts.length > 0 ? Math.round(totalExercises / workouts.length) : 0,
      uniqueLevels: new Set(workouts.map(w => w.level)).size,
      uniqueGoals: new Set(workouts.map(w => w.goal)).size,
      recentWorkouts: workouts.filter(w => {
        const created = new Date(w.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length
    };
  }, [workouts, pagination.total]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' || 
           filters.level !== 'all' || 
           filters.goal !== 'all';
  }, [filters]);

  // Fetch workouts from API
  const fetchWorkouts = useCallback(async (
    page = 1, 
    limit = pagination.limit, 
    append = false
  ) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.level !== 'all' && { level: filters.level }),
        ...(filters.goal !== 'all' && { goal: filters.goal }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`${API_ENDPOINTS.workouts}?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      if (data.workouts && data.pagination) {
        const newWorkouts = data.workouts;
        const newPagination = {
          ...data.pagination,
          hasMore: data.pagination.page < data.pagination.totalPages
        };

        if (append) {
          setWorkouts(prev => [...prev, ...newWorkouts]);
        } else {
          setWorkouts(newWorkouts);
        }
        
        setPagination(newPagination);
      } else {
        // Fallback for non-paginated response
        const fallbackData = Array.isArray(data) ? data : [];
        setWorkouts(fallbackData);
        setPagination({
          page: 1,
          limit: fallbackData.length,
          total: fallbackData.length,
          totalPages: 1,
          hasMore: false
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinos",
        description: message,
      });
      
      if (!append) {
        setWorkouts([]);
        setPagination({ ...PAGINATION_DEFAULTS, hasMore: false });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, pagination.limit, toast]);

  // Load more workouts (for pagination)
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingMore) return;
    
    const nextPage = Math.floor(workouts.length / pagination.limit) + 1;
    await fetchWorkouts(nextPage, pagination.limit, true);
  }, [pagination.hasMore, pagination.limit, isLoadingMore, workouts.length, fetchWorkouts]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setWorkouts([]); // Clear existing workouts
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setWorkouts([]);
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
  }, []);

  // Handle page change (for traditional pagination if needed)
  const handlePageChange = useCallback((page: number) => {
    if (page !== pagination.page) {
      setPagination(prev => ({ ...prev, page }));
      fetchWorkouts(page, pagination.limit, false);
    }
  }, [pagination.page, pagination.limit, fetchWorkouts]);

  // Handle page size change
  const handlePageSizeChange = useCallback((pageSize: number) => {
    if (pageSize !== pagination.limit) {
      setPagination(prev => ({ ...prev, limit: pageSize, page: 1, hasMore: true }));
      setWorkouts([]);
    }
  }, [pagination.limit]);

  // Refresh workouts
  const refreshWorkouts = useCallback(() => {
    setWorkouts([]);
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
    return fetchWorkouts(1, pagination.limit, false);
  }, [fetchWorkouts, pagination.limit]);

  // Initial load and filter changes
  useEffect(() => {
    fetchWorkouts(1, pagination.limit, false);
  }, [filters]); // Re-fetch when filters change

  return {
    workouts,
    isLoading,
    isLoadingMore,
    stats,
    filters,
    pagination,
    viewMode,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    refreshWorkouts,
    handlePageChange,
    handlePageSizeChange,
    setViewMode,
    loadMore
  };
};

// Hook personalizado para infinite scroll
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  enabled = true
}: {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  enabled?: boolean;
}) => {
  useEffect(() => {
    if (!enabled || !hasMore || isLoading) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore, threshold, enabled]);
};