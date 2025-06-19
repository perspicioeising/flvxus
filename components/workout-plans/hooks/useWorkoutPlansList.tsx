// /components/workout-plans/hooks/useWorkoutPlansList.tsx

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  WorkoutPlan, 
  WorkoutPlanFilters, 
  PaginationData,
  WorkoutPlanStats 
} from '../types';

interface UseWorkoutPlansListReturn {
  plans: WorkoutPlan[];
  isLoading: boolean;
  isInitialLoading: boolean;
  pagination: PaginationData;
  filters: WorkoutPlanFilters;
  stats: WorkoutPlanStats;
  updateFilters: (newFilters: Partial<WorkoutPlanFilters>) => void;
  deletePlan: (plan: WorkoutPlan) => Promise<void>;
  refreshPlans: () => void;
  loadMorePlans: () => void;
  hasMorePlans: boolean;
}

export function useWorkoutPlansList(): UseWorkoutPlansListReturn {
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: true
  });
  
  const [filters, setFilters] = useState<WorkoutPlanFilters>({
    searchQuery: '',
    statusFilter: 'all'
  });

  // Estatísticas simples
  const stats: WorkoutPlanStats = {
    totalPlans: pagination.total,
    activePlans: plans.filter(p => new Date(p.end_date) >= new Date()).length,
    totalStudents: new Set(plans.map(p => p.student_id)).size,
    avgDuration: plans.length > 0 
      ? Math.round(plans.reduce((sum, plan) => {
          const start = new Date(plan.start_date);
          const end = new Date(plan.end_date);
          return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / plans.length)
      : 0
  };

  // Função para buscar planos
  const fetchPlans = useCallback(async (
    page = 1,
    append = false
  ) => {
    try {
      if (!append) setIsLoading(true);
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: filters.searchQuery,
        status: filters.statusFilter,
      });

      const response = await fetch(`/api/workout-plans?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar planos');
      }

      const data = await response.json();

      if (append) {
        setPlans(prev => [...prev, ...data.plans]);
      } else {
        setPlans(data.plans || []);
      }
      
      setPagination(prev => ({
        ...prev,
        page: data.pagination.page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasMore: data.pagination.page < data.pagination.totalPages
      }));

    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar planos",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [filters, pagination.limit, toast]);

  // Função para carregar mais planos
  const loadMorePlans = useCallback(() => {
    if (pagination.hasMore && !isLoading) {
      fetchPlans(pagination.page + 1, true);
    }
  }, [pagination.hasMore, pagination.page, isLoading, fetchPlans]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<WorkoutPlanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
  }, []);

  // Função para deletar plano
  const deletePlan = useCallback(async (plan: WorkoutPlan) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/workout-plans/${plan.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar plano');
      }

      toast({
        title: "Plano deletado",
        description: `${plan.name} foi removido com sucesso`,
      });

      // Remover da lista local
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      
      // Atualizar contadores
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));

    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        variant: "destructive",
        title: "Erro ao deletar plano",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Função para refresh
  const refreshPlans = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPlans(1, false);
  }, [fetchPlans]);

  // Efeito para buscar planos quando filtros mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlans(1, false);
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Buscar planos iniciais
  useEffect(() => {
    fetchPlans(1, false);
  }, []);

  return {
    plans,
    isLoading,
    isInitialLoading,
    pagination,
    filters,
    stats,
    updateFilters,
    deletePlan,
    refreshPlans,
    loadMorePlans,
    hasMorePlans: pagination.hasMore,
  };
}