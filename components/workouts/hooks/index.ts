// components/workouts/hooks/index.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  Exercise, 
  SelectedExercise,
  WorkoutFormData,
  ExerciseFilters,
  CreateWorkoutRequest,
  UseWorkoutFormReturn,
  UseExerciseLibraryReturn,
  Workout,
  WorkoutFilters,
  WorkoutStats,
  PaginationData,
  UseWorkoutListReturn,
  UseWorkoutOperationsReturn
} from '../types';

// Constantes movidas para cá para evitar importações circulares
const DEFAULT_FILTERS: WorkoutFilters = {
  search: "",
  level: "all",
  goal: "all",
  sortBy: "created_at",
  sortOrder: "desc"
};

const PAGINATION_DEFAULTS: PaginationData = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1
};

const DEFAULT_WORKOUT_FORM: WorkoutFormData = {
  name: "",
  description: "",
  level: "",
  goal: "",
  exercises: []
};

const DEFAULT_EXERCISE_PARAMS: Omit<SelectedExercise, keyof Exercise> = {
  sets: 3,
  reps: 12,
  rest: 60,
  notes: "",
  order: 1
};

const DEFAULT_EXERCISE_FILTERS: ExerciseFilters = {
  search: "",
  muscleGroup: "all",
  equipment: "all"
};

const API_ENDPOINTS = {
  workouts: "/api/workouts",
  exercises: "/api/exercises",
  workout: (id: string) => `/api/workouts/${id}`,
  workoutClone: (id: string) => `/api/workouts/${id}/clone`
} as const;

const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Este campo é obrigatório",
  INVALID_NAME: "Nome deve ter entre 3 e 100 caracteres",
  INVALID_DESCRIPTION: "Descrição deve ter no máximo 500 caracteres",
  NO_EXERCISES: "Adicione pelo menos um exercício",
  INVALID_SETS: "Séries deve estar entre 1 e 10",
  INVALID_REPS: "Repetições deve estar entre 1 e 100",
  INVALID_REST: "Descanso deve estar entre 0 e 600 segundos",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  UNKNOWN_ERROR: "Ocorreu um erro inesperado"
} as const;

const SUCCESS_MESSAGES = {
  WORKOUT_CREATED: "Treino criado com sucesso! 🎉",
  WORKOUT_UPDATED: "Treino atualizado com sucesso! ✅",
  WORKOUT_CLONED: "Treino clonado com sucesso! 📋",
  WORKOUT_DELETED: "Treino removido com sucesso! 🗑️"
} as const;

const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    maxLength: 500
  },
  level: {
    required: true
  },
  goal: {
    required: true
  },
  exercises: {
    minLength: 1
  },
  sets: {
    min: 1,
    max: 10
  },
  reps: {
    min: 1,
    max: 100
  },
  rest: {
    min: 0,
    max: 600
  }
} as const;

// Hook para lista de treinos com paginação
export const useWorkoutList = (): UseWorkoutListReturn => {
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

// Hook para operações de treinos (CRUD)
export const useWorkoutOperations = (): UseWorkoutOperationsReturn => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createWorkout = useCallback(async (data: CreateWorkoutRequest): Promise<Workout> => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.workouts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_CREATED,
        description: `${data.name} foi adicionado à sua biblioteca`,
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao criar treino",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateWorkout = useCallback(async (id: string, data: Partial<CreateWorkoutRequest>): Promise<Workout> => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.workout(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_UPDATED,
        description: "As alterações foram salvas",
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao atualizar treino",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteWorkout = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.workout(id), {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_DELETED,
        description: `${name} foi removido`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao remover treino",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const cloneWorkout = useCallback(async (workout: Workout): Promise<Workout> => {
    try {
      setIsLoading(true);
      
      // First fetch the complete workout details
      const detailsResponse = await fetch(API_ENDPOINTS.workout(workout.id));
      const workoutDetails = await detailsResponse.json();

      if (!detailsResponse.ok) {
        throw new Error(workoutDetails.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      // Create the clone data
      const cloneData: CreateWorkoutRequest = {
        name: `${workout.name} (Cópia)`,
        description: workout.description || "",
        level: workout.level,
        goal: workout.goal,
        exercises: workoutDetails.workout_exercises?.map((we: any, index: number) => ({
          exercise_id: we.exercise_id,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          notes: we.notes || "",
          order: index + 1
        })) || []
      };

      const response = await fetch(API_ENDPOINTS.workouts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloneData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      toast({
        title: SUCCESS_MESSAGES.WORKOUT_CLONED,
        description: `${cloneData.name} foi criado`,
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao clonar treino",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getWorkout = useCallback(async (id: string): Promise<Workout> => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.workout(id));
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao carregar treino",
        description: message,
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
};

// Hook principal para o formulário de criação de treino
export const useWorkoutForm = (
  mode: 'create' | 'edit' = 'create',
  workoutId?: string
): UseWorkoutFormReturn => {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados do formulário
  const [formData, setFormData] = useState<WorkoutFormData>(DEFAULT_WORKOUT_FORM);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [activeStep, setActiveStep] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados para edição
  useEffect(() => {
    if (mode === 'edit' && workoutId) {
      loadWorkoutData(workoutId);
    }
  }, [mode, workoutId]);

  const loadWorkoutData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.workout(id));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      setFormData({
        name: data.name,
        description: data.description || '',
        level: data.level,
        goal: data.goal,
        exercises: []
      });
      
      if (data.workout_exercises) {
        const exercises = data.workout_exercises.map((we: any, index: number) => ({
          ...we.exercise,
          sets: we.sets,
          reps: we.reps,
          rest: we.rest,
          notes: we.notes || '',
          order: index + 1
        }));
        setSelectedExercises(exercises);
        setFormData(prev => ({ ...prev, exercises }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao carregar treino",
        description: message,
      });
      router.push('/dashboard/workouts');
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  // Atualizar campos do formulário
  const updateFormField = useCallback((field: keyof WorkoutFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro relacionado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Selecionar exercício
  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      const newExercise: SelectedExercise = {
        ...exercise,
        ...DEFAULT_EXERCISE_PARAMS,
        order: selectedExercises.length + 1
      };
      
      setSelectedExercises(prev => [...prev, newExercise]);
      setFormData(prev => ({ 
        ...prev, 
        exercises: [...prev.exercises, newExercise] 
      }));
    }
  }, [selectedExercises]);

  // Remover exercício
  const handleExerciseRemove = useCallback((exerciseId: string) => {
    setSelectedExercises(prev => {
      const filtered = prev.filter(e => e.id !== exerciseId);
      // Reordenar exercícios
      return filtered.map((exercise, index) => ({
        ...exercise,
        order: index + 1
      }));
    });
    
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId).map((exercise, index) => ({
        ...exercise,
        order: index + 1
      }))
    }));
  }, []);

  // Atualizar exercício
  const handleExerciseUpdate = useCallback((
    exerciseId: string, 
    field: keyof SelectedExercise, 
    value: any
  ) => {
    setSelectedExercises(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId 
          ? { ...exercise, [field]: value }
          : exercise
      )
    );
    
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId 
          ? { ...exercise, [field]: value }
          : exercise
      )
    }));
  }, []);

  // Validação por step
  const validateStep = useCallback((step: string): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (
          formData.name.length < VALIDATION_RULES.name.minLength ||
          formData.name.length > VALIDATION_RULES.name.maxLength
        ) {
          newErrors.name = ERROR_MESSAGES.INVALID_NAME;
        }
        
        if (formData.description.length > VALIDATION_RULES.description.maxLength) {
          newErrors.description = ERROR_MESSAGES.INVALID_DESCRIPTION;
        }
        break;
        
      case 'goal':
        if (!formData.level) {
          newErrors.level = ERROR_MESSAGES.REQUIRED_FIELD;
        }
        if (!formData.goal) {
          newErrors.goal = ERROR_MESSAGES.REQUIRED_FIELD;
        }
        break;
        
      case 'exercises':
        if (selectedExercises.length === 0) {
          newErrors.exercises = ERROR_MESSAGES.NO_EXERCISES;
        }
        
        // Validar parâmetros dos exercícios
        selectedExercises.forEach((exercise, index) => {
          if (exercise.sets < VALIDATION_RULES.sets.min || exercise.sets > VALIDATION_RULES.sets.max) {
            newErrors[`exercise_${index}_sets`] = ERROR_MESSAGES.INVALID_SETS;
          }
          if (exercise.reps < VALIDATION_RULES.reps.min || exercise.reps > VALIDATION_RULES.reps.max) {
            newErrors[`exercise_${index}_reps`] = ERROR_MESSAGES.INVALID_REPS;
          }
          if (exercise.rest < VALIDATION_RULES.rest.min || exercise.rest > VALIDATION_RULES.rest.max) {
            newErrors[`exercise_${index}_rest`] = ERROR_MESSAGES.INVALID_REST;
          }
        });
        break;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedExercises]);

  // Verificar se pode avançar para o próximo step
  const canAdvanceStep = useCallback((): boolean => {
    switch (activeStep) {
      case 'basic':
        return Boolean(formData.name.trim() && formData.name.length >= 3);
      case 'goal':
        return Boolean(formData.level && formData.goal);
      case 'exercises':
        return selectedExercises.length > 0;
      default:
        return true;
    }
  }, [activeStep, formData, selectedExercises]);

  // Salvar treino
  const saveWorkout = useCallback(async () => {
    // Validar todos os steps
    const isValidBasic = validateStep('basic');
    const isValidGoal = validateStep('goal');
    const isValidExercises = validateStep('exercises');
    
    if (!isValidBasic || !isValidGoal || !isValidExercises) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Verifique os campos obrigatórios",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const workoutData: CreateWorkoutRequest = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        goal: formData.goal,
        exercises: selectedExercises.map((exercise, index) => ({
          exercise_id: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes || '',
          order: index + 1
        }))
      };

      const url = mode === 'edit' ? API_ENDPOINTS.workout(workoutId!) : API_ENDPOINTS.workouts;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      toast({
        title: mode === 'edit' ? SUCCESS_MESSAGES.WORKOUT_UPDATED : SUCCESS_MESSAGES.WORKOUT_CREATED,
        description: `${formData.name} foi ${mode === 'edit' ? 'atualizado' : 'criado'} com sucesso`,
      });

      router.push('/dashboard/workouts');
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} treino`,
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, selectedExercises, validateStep, mode, workoutId, toast, router]);

  return {
    // Form state
    formData,
    selectedExercises,
    activeStep,
    errors,
    
    // Loading states
    isLoading,
    isSaving,
    
    // Actions
    setActiveStep,
    updateFormField,
    handleExerciseSelect,
    handleExerciseRemove,
    handleExerciseUpdate,
    saveWorkout,
    
    // Validations
    canAdvanceStep,
    validateStep
  };
};

// Hook para biblioteca de exercícios
export const useExerciseLibrary = (): UseExerciseLibraryReturn => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ExerciseFilters>(DEFAULT_EXERCISE_FILTERS);

  // Exercícios filtrados
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = filters.search === '' ||
        exercise.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        exercise.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesMuscleGroup = filters.muscleGroup === 'all' ||
        exercise.muscle_group.some(group => 
          group.toLowerCase().includes(filters.muscleGroup.toLowerCase())
        );

      const matchesEquipment = filters.equipment === 'all' ||
        (exercise.equipment && exercise.equipment.some(eq => 
          eq.toLowerCase().includes(filters.equipment.toLowerCase())
        ));

      return matchesSearch && matchesMuscleGroup && matchesEquipment;
    });
  }, [exercises, filters]);

  // Buscar exercícios - CORRIGIDO para usar sua API
  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 useExerciseLibrary: Iniciando busca de exercícios...');
      
      // Chamada para sua API com o parâmetro ?all=true para buscar todos
      const response = await fetch('/api/exercises?all=true');
      console.log('📡 useExerciseLibrary: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 useExerciseLibrary: Dados recebidos:', data);
      console.log('📊 useExerciseLibrary: Tipo dos dados:', typeof data, Array.isArray(data));
      
      // Sua API retorna um array direto quando usa ?all=true
      const exercisesList = Array.isArray(data) ? data : [];
      console.log(`✅ useExerciseLibrary: ${exercisesList.length} exercícios carregados`);
      
      setExercises(exercisesList);
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      console.error('❌ useExerciseLibrary: Erro ao carregar exercícios:', error);
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar exercícios",
        description: message,
      });
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    console.log('🔍 useExerciseLibrary: Atualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh exercícios
  const refreshExercises = useCallback(() => {
    console.log('🔄 useExerciseLibrary: Refresh solicitado');
    return fetchExercises();
  }, [fetchExercises]);

  // Carregar exercícios no mount
  useEffect(() => {
    console.log('🚀 useExerciseLibrary: Componente montado, carregando exercícios...');
    fetchExercises();
  }, [fetchExercises]);

  // Log sempre que os dados mudarem para debug
  useEffect(() => {
    console.log('📈 useExerciseLibrary: Estado atualizado:', {
      exercisesCount: exercises.length,
      filteredCount: filteredExercises.length,
      isLoading,
      filters
    });
  }, [exercises, filteredExercises, isLoading, filters]);

  return {
    exercises,
    filteredExercises,
    filters,
    isLoading,
    updateFilters,
    refreshExercises
  };
};