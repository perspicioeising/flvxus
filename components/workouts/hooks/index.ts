// components/workouts/hooks/useWorkoutForm.ts - HOOK ATUALIZADO
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  WorkoutFormData, 
  SelectedExercise, 
  Exercise, 
  SetConfig,
} from '../types';
import {   DEFAULT_WORKOUT_FORM, 
  DEFAULT_EXERCISE_PARAMS,
  DEFAULT_SET_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES} from '../constants'

export function useWorkoutForm(mode: 'create' | 'edit' = 'create', workoutId?: string) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados principais
  const [formData, setFormData] = useState<WorkoutFormData>(DEFAULT_WORKOUT_FORM);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [activeStep, setActiveStep] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados para edição
  useEffect(() => {
    if (mode === 'edit' && workoutId) {
      loadWorkoutData(workoutId);
    }
  }, [mode, workoutId]);

  const loadWorkoutData = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workouts/${id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setFormData({
        name: data.name,
        description: data.description || '',
        level: data.level,
        goal: data.goal,
        exercises: []
      });
      
      // Converter workout_exercises para selectedExercises
      const exercises: SelectedExercise[] = data.workout_exercises.map((we: any) => ({
        ...we.exercise,
        sets: we.sets,
        reps: we.reps,
        rest: we.rest,
        sets_config: we.sets_config || generateDefaultSetsConfig(we.sets, we.reps),
        general_notes: we.general_notes || '',
        order: we.order
      }));
      
      setSelectedExercises(exercises);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar treino",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar configuração padrão de séries
  const generateDefaultSetsConfig = (sets: number, reps: number): SetConfig[] => {
    return Array.from({ length: sets }, (_, index) => ({
      set_number: index + 1,
      target_reps: reps,
      suggested_weight: 0,
      notes: ''
    }));
  };

  // Atualizar campo do formulário
  const updateFormField = useCallback((field: keyof WorkoutFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo se existir
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
    const exerciseWithDefaults: SelectedExercise = {
      ...exercise,
      ...DEFAULT_EXERCISE_PARAMS,
      sets_config: generateDefaultSetsConfig(DEFAULT_EXERCISE_PARAMS.sets, DEFAULT_EXERCISE_PARAMS.reps),
      order: selectedExercises.length + 1
    };
    
    setSelectedExercises(prev => [...prev, exerciseWithDefaults]);
  }, [selectedExercises.length]);

  // Remover exercício
  const handleExerciseRemove = useCallback((exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.filter(ex => ex.id !== exerciseId)
        .map((ex, index) => ({ ...ex, order: index + 1 }))
    );
  }, []);

  // Atualizar exercício
  const handleExerciseUpdate = useCallback((exerciseId: string, field: keyof SelectedExercise, value: any) => {
    setSelectedExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? { 
              ...ex, 
              [field]: value,
              // Atualizar sets_config se o número de séries mudou
              ...(field === 'sets' && typeof value === 'number' ? {
                sets_config: value > ex.sets_config.length 
                  ? [
                      ...ex.sets_config,
                      ...Array.from({ length: value - ex.sets_config.length }, (_, i) => ({
                        set_number: ex.sets_config.length + i + 1,
                        target_reps: ex.reps,
                        suggested_weight: 0,
                        notes: ''
                      }))
                    ]
                  : ex.sets_config.slice(0, value)
              } : {})
            }
          : ex
      )
    );
  }, []);

  // Atualizar configuração de série específica
  const handleSetConfigUpdate = useCallback((exerciseId: string, setIndex: number, field: keyof SetConfig, value: any) => {
    setSelectedExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets_config: ex.sets_config.map((config, index) => 
                index === setIndex 
                  ? { ...config, [field]: value }
                  : config
              )
            }
          : ex
      )
    );
  }, []);

  // Adicionar série
  const handleAddSet = useCallback((exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: ex.sets + 1,
              sets_config: [
                ...ex.sets_config,
                {
                  set_number: ex.sets_config.length + 1,
                  target_reps: ex.reps,
                  suggested_weight: 0,
                  notes: ''
                }
              ]
            }
          : ex
      )
    );
  }, []);

  // Remover série
  const handleRemoveSet = useCallback((exerciseId: string, setIndex: number) => {
    setSelectedExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId && ex.sets_config.length > 1
          ? {
              ...ex,
              sets: ex.sets - 1,
              sets_config: ex.sets_config
                .filter((_, index) => index !== setIndex)
                .map((config, index) => ({ ...config, set_number: index + 1 }))
            }
          : ex
      )
    );
  }, []);

  // Validações
  const validateStep = useCallback((step: string): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (formData.name.length < VALIDATION_RULES.name.minLength || 
                   formData.name.length > VALIDATION_RULES.name.maxLength) {
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
        
        // Validar configurações das séries
        selectedExercises.forEach((exercise, exerciseIndex) => {
          exercise.sets_config.forEach((setConfig, setIndex) => {
            if (setConfig.target_reps < VALIDATION_RULES.reps.min || 
                setConfig.target_reps > VALIDATION_RULES.reps.max) {
              newErrors[`exercise_${exerciseIndex}_set_${setIndex}_reps`] = ERROR_MESSAGES.INVALID_REPS;
            }
          });
          
          if (exercise.rest < VALIDATION_RULES.rest.min || 
              exercise.rest > VALIDATION_RULES.rest.max) {
            newErrors[`exercise_${exerciseIndex}_rest`] = ERROR_MESSAGES.INVALID_REST;
          }
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedExercises]);

  const canAdvanceStep = useCallback((): boolean => {
    switch (activeStep) {
      case 'basic':
        return !!formData.name.trim() && formData.name.length >= VALIDATION_RULES.name.minLength;
      case 'goal':
        return !!formData.level && !!formData.goal;
      case 'exercises':
        return selectedExercises.length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [activeStep, formData, selectedExercises]);

  // Salvar treino
  const saveWorkout = async () => {
    if (!validateStep('review')) return;
    
    try {
      setIsSaving(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        goal: formData.goal,
        exercises: selectedExercises.map(ex => ({
          exercise_id: ex.id,
          sets: ex.sets,
          reps: ex.reps, // Mantido para compatibilidade
          rest: ex.rest,
          sets_config: ex.sets_config,
          general_notes: ex.general_notes,
          order: ex.order
        }))
      };
      
      const url = mode === 'edit' ? `/api/workouts/${workoutId}` : '/api/workouts';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      toast({
        title: mode === 'edit' ? SUCCESS_MESSAGES.WORKOUT_UPDATED : SUCCESS_MESSAGES.WORKOUT_CREATED,
        description: `Treino "${formData.name}" ${mode === 'edit' ? 'atualizado' : 'criado'} com sucesso!`,
      });
      
      router.push('/dashboard/workouts');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} treino`,
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // Estados
    formData,
    selectedExercises,
    activeStep,
    errors,
    isLoading,
    isSaving,
    
    // Ações
    setActiveStep,
    updateFormField,
    handleExerciseSelect,
    handleExerciseRemove,
    handleExerciseUpdate,
    handleSetConfigUpdate,
    handleAddSet,
    handleRemoveSet,
    saveWorkout,
    
    // Validações
    canAdvanceStep,
    validateStep
  };
}