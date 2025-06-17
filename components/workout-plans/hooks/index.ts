// hooks/index.ts - Hooks centralizados do módulo

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

import {
  WorkoutPlan,
  WorkoutPlanResponse,
  WorkoutPlanFilters,
  WorkoutPlanStats,
  PaginationData,
  CreateWorkoutPlanData,
  WorkoutPlanFormData,
  SelectedWorkout,
  Workout,
  Student,
} from '../types';

import {
  DEFAULT_PAGINATION,
  DEFAULT_FORM_DATA,
  DEFAULT_FILTERS,
  TOAST_MESSAGES,
  INFINITE_SCROLL_CONFIG,
} from '../constants';

// Hook principal para gerenciar planos de treino
export function useWorkoutPlans() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState<WorkoutPlanFilters>(DEFAULT_FILTERS);

  // Função para buscar planos
  const fetchPlans = useCallback(async (
    page = 1,
    limit = INFINITE_SCROLL_CONFIG.pageSize,
    append = false
  ) => {
    try {
      if (!append) setIsLoading(true);
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: filters.searchQuery,
        status: filters.statusFilter,
      });

      const response = await fetch(`/api/workout-plans?${searchParams}`);
      const data: WorkoutPlanResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar planos');
      }

      if (append) {
        setPlans(prev => [...prev, ...data.plans]);
      } else {
        setPlans(data.plans);
      }
      
      setPagination(data.pagination);

    } catch (error) {
      toast({
        variant: "destructive",
        title: TOAST_MESSAGES.plan.error.fetch,
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [filters, toast]);

  // Função para carregar mais planos (infinite scroll)
  const loadMorePlans = useCallback(() => {
    if (pagination.page < pagination.totalPages && !isLoading) {
      fetchPlans(pagination.page + 1, pagination.limit, true);
    }
  }, [pagination, isLoading, fetchPlans]);

  // Configurar infinite scroll
  const { triggerLoad } = useInfiniteScroll({
    hasMore: pagination.page < pagination.totalPages,
    isLoading,
    onLoadMore: loadMorePlans,
    threshold: INFINITE_SCROLL_CONFIG.threshold,
    enabled: true,
  });

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<WorkoutPlanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Função para deletar plano
  const deletePlan = useCallback(async (plan: WorkoutPlan) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/workout-plans/${plan.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar plano');
      }

      toast({
        title: TOAST_MESSAGES.plan.deleted,
        description: `${plan.name} foi removido`,
      });

      // Remover da lista local
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      
      // Atualizar contadores
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }));

    } catch (error) {
      toast({
        variant: "destructive",
        title: TOAST_MESSAGES.plan.error.delete,
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Calcular estatísticas
  const stats = useMemo((): WorkoutPlanStats => {
    const totalPlans = pagination.total;
    const activePlans = plans.filter(p => new Date(p.end_date) >= new Date()).length;
    const totalStudents = new Set(plans.map(p => p.student_id)).size;
    const avgDuration = plans.length > 0 
      ? Math.round(plans.reduce((sum, plan) => 
          sum + differenceInDays(new Date(plan.end_date), new Date(plan.start_date)), 0
        ) / plans.length)
      : 0;

    return {
      totalPlans,
      activePlans,
      totalStudents,
      avgDuration,
    };
  }, [plans, pagination.total]);

  // Filtrar planos localmente
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = !filters.searchQuery || (
        plan.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        plan.student?.full_name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );

      const matchesStatus = filters.statusFilter === 'all' ||
        (filters.statusFilter === 'active' && new Date(plan.end_date) >= new Date()) ||
        (filters.statusFilter === 'completed' && new Date(plan.end_date) < new Date());

      return matchesSearch && matchesStatus;
    });
  }, [plans, filters]);

  // Efeito para buscar planos quando filtros mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlans();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Buscar planos iniciais
  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans: filteredPlans,
    isLoading,
    isInitialLoading,
    pagination,
    filters,
    stats,
    updateFilters,
    deletePlan,
    refreshPlans: () => fetchPlans(),
    loadMorePlans: triggerLoad,
    hasMorePlans: pagination.page < pagination.totalPages,
  };
}

// Hook para criar/editar planos
export function useCreateWorkoutPlan(mode: string, workoutPlanId: string | undefined, studentId: string | undefined) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WorkoutPlanFormData>({
    ...DEFAULT_FORM_DATA,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  });
  const [selectedWorkouts, setSelectedWorkouts] = useState<SelectedWorkout[]>([]);

  // Função para atualizar dados do formulário
  const updateFormData = useCallback((data: Partial<WorkoutPlanFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Função para selecionar workout
  const selectWorkout = useCallback((workout: Workout) => {
    if (!selectedWorkouts.find(w => w.id === workout.id)) {
      setSelectedWorkouts(prev => [...prev, {
        ...workout,
        day_of_week: 1,
      }]);
    }
  }, [selectedWorkouts]);

  // Função para atualizar workout
  const updateWorkout = useCallback((
    index: number,
    field: 'day_of_week',
    value: number
  ) => {
    setSelectedWorkouts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Função para remover workout
  const removeWorkout = useCallback((index: number) => {
    setSelectedWorkouts(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Função para criar plano
  const createPlan = useCallback(async () => {
    try {
      setIsLoading(true);

      const planData: CreateWorkoutPlanData = {
        ...formData,
        workouts: selectedWorkouts.map(workout => ({
          workout_id: workout.id,
          day_of_week: workout.day_of_week,
        })),
      };

      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar plano');
      }

      toast({
        title: isCloning ? TOAST_MESSAGES.plan.cloned : TOAST_MESSAGES.plan.created,
        description: `${formData.name} foi ${isCloning ? 'clonado' : 'criado'} com sucesso`,
      });

      // Reset e fechar modal
      handleCancel();
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: isCloning ? TOAST_MESSAGES.plan.error.clone : TOAST_MESSAGES.plan.error.create,
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedWorkouts, isCloning, toast]);

  // Função para clonar plano
  const startCloning = useCallback((plan: WorkoutPlan) => {
    setFormData({
      name: `${plan.name} (Cópia)`,
      description: plan.description || '',
      student_id: plan.student_id,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    });
    
    // Mapear workouts do plano
    setSelectedWorkouts(plan.workouts.map(w => ({
      ...w.workout,
      day_of_week: w.day_of_week,
    })));
    
    setIsCloning(true);
    setIsOpen(true);
  }, []);

  // Função para cancelar/resetar
  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setIsCloning(false);
    setFormData({
      ...DEFAULT_FORM_DATA,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    });
    setSelectedWorkouts([]);
  }, []);

  // Validação do formulário
  const isFormValid = useMemo(() => {
    return formData.name.trim() !== '' &&
           formData.student_id !== '' &&
           formData.start_date !== '' &&
           formData.end_date !== '' &&
           selectedWorkouts.length > 0;
  }, [formData, selectedWorkouts]);

  return {
    isOpen,
    isCloning,
    isLoading,
    formData,
    selectedWorkouts,
    isFormValid,
    updateFormData,
    selectWorkout,
    updateWorkout,
    removeWorkout,
    createPlan,
    startCloning,
    openModal: () => setIsOpen(true),
    handleCancel,
  };
}

// Hook para buscar dados auxiliares
export function useWorkoutPlanData() {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar workouts
  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await fetch('/api/workouts');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar treinos');
      }

      setWorkouts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: TOAST_MESSAGES.workouts.error.fetch,
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }, [toast]);

  // Buscar students
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar alunos');
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: TOAST_MESSAGES.students.error.fetch,
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }, [toast]);

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchWorkouts(), fetchStudents()]);
      setIsLoading(false);
    };

    fetchData();
  }, [fetchWorkouts, fetchStudents]);

  return {
    workouts,
    students,
    isLoading,
    refetchWorkouts: fetchWorkouts,
    refetchStudents: fetchStudents,
  };
}

// Hook para navegação
export function useWorkoutPlanNavigation() {
  const router = useRouter();

  const goToDetails = useCallback((planId: string) => {
    router.push(`/dashboard/workout-plans/${planId}`);
  }, [router]);

  const goToEdit = useCallback((planId: string) => {
    router.push(`/dashboard/workout-plans/${planId}/edit`);
  }, [router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const goToWorkouts = useCallback(() => {
    router.push('/dashboard/workouts');
  }, [router]);

  return {
    goToDetails,
    goToEdit,
    goBack,
    goToWorkouts,
  };
}