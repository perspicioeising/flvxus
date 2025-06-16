// components/workouts/hooks/index.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Workout, 
  WorkoutFilters, 
  WorkoutStats, 
  PaginationData, 
  WorkoutFormData,
  SelectedExercise,
  Exercise,
  ExerciseFilters,
  UseWorkoutListReturn,
  UseWorkoutFormReturn,
  UseExerciseSelectionReturn,
  CreateWorkoutRequest,
  ApiError
} from '../types';
import { 
  DEFAULT_FILTERS, 
  DEFAULT_EXERCISE_FILTERS, 
  PAGINATION_DEFAULTS, 
  DEFAULT_WORKOUT_FORM,
  DEFAULT_EXERCISE_PARAMS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES
} from '../constants';

// Hook for workout list management
export const useWorkoutList = (): UseWorkoutListReturn => {
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState<PaginationData>(PAGINATION_DEFAULTS);

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
  const fetchWorkouts = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    try {
      setIsLoading(true);
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
        setWorkouts(data.workouts);
        setPagination(data.pagination);
      } else {
        // Fallback for non-paginated response
        setWorkouts(Array.isArray(data) ? data : []);
        setPagination({
          page: 1,
          limit: Array.isArray(data) ? data.length : 0,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: 1
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinos",
        description: message,
      });
      setWorkouts([]);
      setPagination(PAGINATION_DEFAULTS);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page !== pagination.page) {
      setPagination(prev => ({ ...prev, page }));
    }
  }, [pagination.page]);

  // Handle page size change
  const handlePageSizeChange = useCallback((pageSize: number) => {
    if (pageSize !== pagination.limit) {
      setPagination(prev => ({ ...prev, limit: pageSize, page: 1 }));
    }
  }, [pagination.limit]);

  // Refresh workouts
  const refreshWorkouts = useCallback(() => {
    return fetchWorkouts();
  }, [fetchWorkouts]);

  // Initial load and filter changes
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    isLoading,
    stats,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    refreshWorkouts,
    handlePageChange,
    handlePageSizeChange
  };
};

// Hook for workout form management
export const useWorkoutForm = (
  onSubmit: (data: WorkoutFormData) => Promise<void>,
  initialData?: Partial<WorkoutFormData>
): UseWorkoutFormReturn => {
  const [formData, setFormData] = useState<WorkoutFormData>(() => ({
    ...DEFAULT_WORKOUT_FORM,
    ...initialData
  }));
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data
  const updateFormData = useCallback((data: Partial<WorkoutFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  }, [errors]);

  // Handle exercise selection
  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      const newExercise: SelectedExercise = {
        ...exercise,
        ...DEFAULT_EXERCISE_PARAMS
      };
      setSelectedExercises(prev => [...prev, newExercise]);
      setFormData(prev => ({ 
        ...prev, 
        exercises: [...prev.exercises, newExercise] 
      }));
    }
  }, [selectedExercises]);

  // Handle exercise removal
  const handleExerciseRemove = useCallback((exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId)
    }));
  }, []);

  // Handle exercise update
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

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (
      formData.name.length < VALIDATION_RULES.name.minLength ||
      formData.name.length > VALIDATION_RULES.name.maxLength
    ) {
      newErrors.name = ERROR_MESSAGES.INVALID_NAME;
    }

    // Validate description
    if (formData.description.length > VALIDATION_RULES.description.maxLength) {
      newErrors.description = ERROR_MESSAGES.INVALID_DESCRIPTION;
    }

    // Validate level
    if (!formData.level) {
      newErrors.level = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    // Validate goal
    if (!formData.goal) {
      newErrors.goal = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    // Validate exercises
    if (selectedExercises.length === 0) {
      newErrors.exercises = ERROR_MESSAGES.NO_EXERCISES;
    }

    // Validate exercise parameters
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedExercises]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ ...formData, exercises: selectedExercises });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedExercises, validateForm, onSubmit]);

  // Reset form
  const reset = useCallback(() => {
    setFormData(DEFAULT_WORKOUT_FORM);
    setSelectedExercises([]);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Update selected exercises when initial data changes
  useEffect(() => {
    if (initialData?.exercises) {
      setSelectedExercises(initialData.exercises);
    }
  }, [initialData?.exercises]);

  return {
    formData,
    selectedExercises,
    isSubmitting,
    errors,
    updateFormData,
    handleExerciseSelect,
    handleExerciseRemove,
    handleExerciseUpdate,
    handleSubmit,
    reset,
    validateForm
  };
};

// Hook for exercise selection
export const useExerciseSelection = (): UseExerciseSelectionReturn => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ExerciseFilters>(DEFAULT_EXERCISE_FILTERS);

  // Filter exercises
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

  // Fetch exercises
  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.exercises);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      setExercises(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
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

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh exercises
  const refreshExercises = useCallback(() => {
    return fetchExercises();
  }, [fetchExercises]);

  // Initial load
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    filteredExercises,
    filters,
    isLoading,
    updateFilters,
    refreshExercises
  };
};

// Hook for workout operations (CRUD)
export const useWorkoutOperations = () => {
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

// Hook for user role management
export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string>('trainer');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual user role fetching
      // This would typically come from your auth context or API
      setUserRole('trainer');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('student'); // Default fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  return {
    userRole,
    isLoading,
    refreshUserRole: fetchUserRole
  };
};

// Hook for workout analytics
export const useWorkoutAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    averageWorkoutTime: 0,
    mostUsedExercises: [],
    workoutTrends: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workouts/analytics');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.NETWORK_ERROR);
      }

      setAnalytics(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      toast({
        variant: "destructive",
        title: "Erro ao carregar analytics",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    refreshAnalytics: fetchAnalytics
  };
};

