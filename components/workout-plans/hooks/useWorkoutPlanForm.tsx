// /components/workout-plans/hooks/useWorkoutPlanForm.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/app/providers';
import { format, addDays } from 'date-fns';
import { WORKOUT_PLAN_ERRORS, VALIDATION_RULES } from '../constants';
import { FormWorkout, FormSelectedWorkout, FormData } from '../../workout-plans/hooks/form-types';

interface UseWorkoutPlanFormReturn {
  // Estados
  formData: FormData;
  selectedWorkouts: FormSelectedWorkout[];
  activeStep: string;
  errors: Record<string, string>;
  isLoading: boolean;
  isSaving: boolean;
  availableWorkouts: FormWorkout[];
  
  // Ações
  setActiveStep: (step: string) => void;
  updateFormField: (field: string, value: any) => void;
  handleWorkoutSelect: (workout: FormWorkout, day: number) => void;
  handleWorkoutRemove: (workoutId: string, day: number) => void;
  handleScheduleUpdate: (days: number[]) => void;
  saveWorkoutPlan: () => Promise<void>;
  
  // Validações
  canAdvanceStep: () => boolean;
  validateStep: (step: string) => boolean;
}

export function useCreateWorkoutPlan(
  mode: 'create' | 'edit' = 'create',
  workoutPlanId?: string,
  studentId?: string
): UseWorkoutPlanFormReturn {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();

  // Estados
  const [activeStep, setActiveStep] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableWorkouts, setAvailableWorkouts] = useState<FormWorkout[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    student_id: studentId || '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    schedule: []
  });

  const [selectedWorkouts, setSelectedWorkouts] = useState<FormSelectedWorkout[]>([]);

  // Carregar dados do plano para edição
  useEffect(() => {
    if (mode === 'edit' && workoutPlanId) {
      const fetchPlanData = async () => {
        try {
          setIsLoading(true);
          console.log('🔍 Carregando dados do plano para edição:', workoutPlanId);

          const response = await fetch(`/api/workout-plans/${workoutPlanId}`);
          
          if (!response.ok) {
            throw new Error('Plano não encontrado');
          }

          const planData = await response.json();
          console.log('✅ Dados do plano carregados:', planData);

          // Extrair e validar o schedule com tipagem explícita
          const workoutDays = planData.workouts?.map((w: any) => w.day_of_week) || [];
          const validDays: number[] = [];
          
          workoutDays.forEach((day: any) => {
            if (typeof day === 'number' && !isNaN(day) && day >= 1 && day <= 7) {
              validDays.push(day);
            }
          });
          
          const uniqueSchedule: number[] = [...new Set(validDays)];

          // Preencher dados básicos
          setFormData({
            name: planData.name || '',
            description: planData.description || '',
            student_id: planData.student_id || '',
            start_date: planData.start_date || '',
            end_date: planData.end_date || '',
            schedule: uniqueSchedule
          });

          // Preencher workouts selecionados
          const workouts = planData.workouts || [];
          const formattedWorkouts: FormSelectedWorkout[] = workouts
            .filter((item: any) => item.workout && item.workout.id) // Filtrar items válidos
            .map((item: any) => ({
              workout: {
                id: item.workout.id,
                name: item.workout.name || 'Treino sem nome',
                description: item.workout.description || 'Sem descrição',
                level: item.workout.level || 'intermediate',
                goal: item.workout.goal || 'general_fitness'
              },
              day_of_week: item.day_of_week
            }));

          setSelectedWorkouts(formattedWorkouts);
          console.log('✅ Workouts formatados:', formattedWorkouts);

        } catch (error) {
          console.error('❌ Erro ao carregar dados do plano:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar plano",
            description: "Não foi possível carregar os dados do plano para edição."
          });
          router.push('/dashboard/workout-plans');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPlanData();
    }
  }, [mode, workoutPlanId, toast, router]);

  // Carregar workouts disponíveis
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        // Só mostrar loading se não estiver carregando dados do plano
        if (mode !== 'edit') {
          setIsLoading(true);
        }

        const { data, error } = await supabase
          .from('workouts')
          .select('id, name, description, level, goal')
          .order('name');

        if (error) {
          throw error;
        }

        // Garantir que os campos obrigatórios estão preenchidos
        const workouts: FormWorkout[] = (data || []).map(workout => ({
          id: workout.id,
          name: workout.name,
          description: workout.description || 'Sem descrição',
          level: workout.level || 'intermediate',
          goal: workout.goal || 'general_fitness'
        }));

        // Se não há workouts no banco, criar alguns exemplos
        if (workouts.length === 0) {
          const fallbackWorkouts: FormWorkout[] = [
            {
              id: 'fallback-1',
              name: 'Treino de Peito e Tríceps',
              description: 'Exercícios para desenvolvimento do peitoral e tríceps',
              level: 'intermediate',
              goal: 'hypertrophy'
            },
            {
              id: 'fallback-2',
              name: 'Treino de Costas e Bíceps',
              description: 'Fortalecimento das costas e desenvolvimento dos bíceps',
              level: 'beginner',
              goal: 'strength'
            },
            {
              id: 'fallback-3',
              name: 'Treino de Pernas',
              description: 'Treino completo para membros inferiores',
              level: 'advanced',
              goal: 'hypertrophy'
            }
          ];
          setAvailableWorkouts(fallbackWorkouts);
        } else {
          setAvailableWorkouts(workouts);
        }

      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar treinos",
          description: "Não foi possível carregar a lista de treinos.",
        });
      } finally {
        if (mode !== 'edit') {
          setIsLoading(false);
        }
      }
    };

    fetchWorkouts();
  }, [supabase, toast, mode]);

  // Função para atualizar campo do formulário
  const updateFormField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Função para atualizar agendamento
  const handleScheduleUpdate = useCallback((days: number[]) => {
    setFormData(prev => ({ ...prev, schedule: days }));
    
    // Remover workouts de dias que não estão mais selecionados
    setSelectedWorkouts(prev => 
      prev.filter(sw => days.includes(sw.day_of_week))
    );
    
    if (errors.schedule) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.schedule;
        return newErrors;
      });
    }
  }, [errors]);

  // Função para selecionar workout
  const handleWorkoutSelect = useCallback((workout: FormWorkout, day: number) => {
    const newSelectedWorkout: FormSelectedWorkout = {
      workout,
      day_of_week: day
    };

    setSelectedWorkouts(prev => [...prev, newSelectedWorkout]);
  }, []);

  // Função para remover workout
  const handleWorkoutRemove = useCallback((workoutId: string, day: number) => {
    setSelectedWorkouts(prev => 
      prev.filter(sw => !(sw.workout.id === workoutId && sw.day_of_week === day))
    );
  }, []);

  // Validação por step
  const validateStep = useCallback((step: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic':
        if (!formData.name.trim()) {
          newErrors.name = WORKOUT_PLAN_ERRORS.NAME_REQUIRED;
        } else if (formData.name.length < VALIDATION_RULES.name.minLength) {
          newErrors.name = `Nome deve ter pelo menos ${VALIDATION_RULES.name.minLength} caracteres`;
        }

        if (!formData.description.trim()) {
          newErrors.description = WORKOUT_PLAN_ERRORS.DESCRIPTION_REQUIRED;
        }

        if (!formData.student_id) {
          newErrors.student_id = WORKOUT_PLAN_ERRORS.STUDENT_REQUIRED;
        }

        if (!formData.start_date) {
          newErrors.start_date = WORKOUT_PLAN_ERRORS.START_DATE_REQUIRED;
        }

        if (!formData.end_date) {
          newErrors.end_date = WORKOUT_PLAN_ERRORS.END_DATE_REQUIRED;
        }

        if (formData.start_date && formData.end_date) {
          const startDate = new Date(formData.start_date);
          const endDate = new Date(formData.end_date);
          if (endDate <= startDate) {
            newErrors.date_range = WORKOUT_PLAN_ERRORS.INVALID_DATE_RANGE;
          }
        }
        break;

      case 'schedule':
        if (formData.schedule.length === 0) {
          newErrors.schedule = WORKOUT_PLAN_ERRORS.NO_SCHEDULE_SELECTED;
        }
        break;

      case 'workouts':
        // Workouts são opcionais, então não validamos aqui
        break;

      case 'review':
        // Revisão final - pode não ter workouts
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Verificar se pode avançar para próximo step
  const canAdvanceStep = useCallback((): boolean => {
    switch (activeStep) {
      case 'basic':
        return formData.name.trim() !== '' && 
               formData.description.trim() !== '' &&
               formData.student_id !== '' &&
               formData.start_date !== '' &&
               formData.end_date !== '';
      
      case 'schedule':
        return formData.schedule.length > 0;
      
      case 'workouts':
        return true; // Workouts são opcionais
      
      case 'review':
        return true;
      
      default:
        return false;
    }
  }, [activeStep, formData, selectedWorkouts]);

  // Função para salvar o plano
  const saveWorkoutPlan = useCallback(async () => {
    try {
      setIsSaving(true);

      // Validar todos os steps antes de salvar
      const isBasicValid = validateStep('basic');
      const isScheduleValid = validateStep('schedule');

      if (!isBasicValid || !isScheduleValid) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: "Por favor, corrija os erros antes de continuar.",
        });
        return;
      }

      const planData = {
        name: formData.name,
        description: formData.description,
        student_id: formData.student_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        workouts: selectedWorkouts.map(sw => ({
          workout_id: sw.workout.id,
          day_of_week: sw.day_of_week
        }))
      };

      console.log('💾 Salvando plano:', { mode, workoutPlanId, planData });

      const url = mode === 'edit' && workoutPlanId 
        ? `/api/workout-plans/${workoutPlanId}`
        : '/api/workout-plans';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar plano');
      }

      const result = await response.json();
      console.log('✅ Plano salvo:', result);

      toast({
        title: mode === 'edit' ? "Plano atualizado!" : "Plano criado!",
        description: mode === 'edit' 
          ? "O plano foi atualizado com sucesso."
          : "O plano de treino foi criado com sucesso.",
      });

      // Redirecionar para lista
      router.push('/dashboard/workout-plans');

    } catch (error) {
      console.error('Error saving workout plan:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o plano de treino.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, selectedWorkouts, mode, workoutPlanId, validateStep, toast, router]);

  return {
    // Estados
    formData,
    selectedWorkouts,
    activeStep,
    errors,
    isLoading,
    isSaving,
    availableWorkouts,
    
    // Ações
    setActiveStep,
    updateFormField,
    handleWorkoutSelect,
    handleWorkoutRemove,
    handleScheduleUpdate,
    saveWorkoutPlan,
    
    // Validações
    canAdvanceStep,
    validateStep
  };
}