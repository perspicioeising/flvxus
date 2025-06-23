// /components/diets/hooks/useDietsFilters.ts

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/components/diets/hooks/use-debounce';
import type { DietFilters } from '../types';

interface UseDietsFiltersReturn {
  filters: DietFilters;
  debouncedSearchQuery: string;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: DietFilters['statusFilter']) => void;
  setGoalFilter: (goal: DietFilters['goalFilter']) => void;
  updateFilter: <K extends keyof DietFilters>(key: K, value: DietFilters[K]) => void;
  clearFilters: () => void;
  clearFilter: (filterKey: keyof DietFilters) => void;
}

const initialFilters: DietFilters = {
  searchQuery: '',
  statusFilter: 'all',
  goalFilter: 'all'
};

export function useDietsFilters(): UseDietsFiltersReturn {
  const [filters, setFilters] = useState<DietFilters>(initialFilters);
  
  // Debounce da busca para evitar chamadas excessivas
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    filters.searchQuery !== '' || 
    filters.statusFilter !== 'all' || 
    filters.goalFilter !== 'all'
  , [filters]);

  const activeFiltersCount = useMemo(() => [
    filters.searchQuery !== '',
    filters.statusFilter !== 'all',
    filters.goalFilter !== 'all'
  ].filter(Boolean).length, [filters]);

  // Actions
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatusFilter = useCallback((status: DietFilters['statusFilter']) => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  }, []);

  const setGoalFilter = useCallback((goal: DietFilters['goalFilter']) => {
    setFilters(prev => ({ ...prev, goalFilter: goal }));
  }, []);

  const updateFilter = useCallback(<K extends keyof DietFilters>(
    key: K, 
    value: DietFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const clearFilter = useCallback((filterKey: keyof DietFilters) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterKey]: initialFilters[filterKey] 
    }));
  }, []);

  return {
    filters,
    debouncedSearchQuery,
    hasActiveFilters,
    activeFiltersCount,
    setSearchQuery,
    setStatusFilter,
    setGoalFilter,
    updateFilter,
    clearFilters,
    clearFilter
  };
}