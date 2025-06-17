// components/workout-plans/components/details/WorkoutPlanDetailPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlanDetailHeader } from './WorkoutPlanDetailHeader';
import { WorkoutPlanSchedule } from './WorkoutPlanSchedule';
import { WorkoutPlanDetailSkeleton } from './WorkoutPlanDetailSkeleton';
import { WorkoutPlan } from '../../types';

interface WorkoutPlanDetailPageProps {
  planId: string;
  userRole?: 'trainer' | 'student';
}

export function WorkoutPlanDetailPage({ 
  planId, 
  userRole = 'trainer' 
}: WorkoutPlanDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/workout-plans/${planId}`);
        
        if (!response.ok) {
          throw new Error('Plano não encontrado');
        }
        
        const data = await response.json();
        
        // DEBUG: Log da estrutura dos dados retornados
        console.log('🔍 DEBUG - Dados recebidos da API:', data);
        console.log('🔍 DEBUG - Estrutura dos workouts:', data.workouts);
        
        // Verificar se workouts é um array
        if (data.workouts && Array.isArray(data.workouts)) {
          console.log('✅ DEBUG - Workouts é um array com', data.workouts.length, 'itens');
          data.workouts.forEach((item: any, index: number) => {
            console.log(`🔍 DEBUG - Workout ${index}:`, {
              id: item.id,
              workout_id: item.workout_id,
              day_of_week: item.day_of_week,
              workout: item.workout
            });
          });
        } else {
          console.log('❌ DEBUG - Workouts não é um array ou está vazio');
        }
        
        setPlan(data);
        
      } catch (error) {
        console.error('❌ Error fetching plan:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar plano",
          description: error instanceof Error ? error.message : "Não foi possível carregar os detalhes do plano.",
        });
        router.push('/dashboard/workout-plans');
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, toast, router]);

  // Calculate stats
  const getStats = (plan: WorkoutPlan) => {
    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const now = new Date();
    
    // Determinar status
    let status: 'active' | 'completed' | 'paused' = 'active';
    if (endDate < now) {
      status = 'completed';
    } else if (startDate > now) {
      status = 'paused'; // Futuro = pausado
    }

    // Verificar se workouts existe e é um array
    const workouts = plan.workouts || [];
    
    console.log('🔍 DEBUG - getStats - workouts recebidos:', workouts);
    
    // Agrupar por dias únicos
    const scheduledDays = [...new Set(workouts.map(w => {
      console.log('🔍 DEBUG - Processando workout item:', w);
      return w.day_of_week;
    }))];
    
    // Obter IDs únicos de treinos
    const uniqueWorkoutIds = [...new Set(workouts.map(w => {
      const workoutId = w.workout?.id || w.workout_id;
      console.log('🔍 DEBUG - Workout ID encontrado:', workoutId);
      return workoutId;
    }).filter(Boolean))];
    
    const stats = {
      totalWorkouts: workouts.length,
      totalDays: scheduledDays.length,
      uniqueWorkouts: uniqueWorkoutIds.length,
      duration,
      frequency: scheduledDays.length,
      status
    };
    
    console.log('🔍 DEBUG - Stats calculadas:', stats);
    
    return stats;
  };

  // Handlers
  const handleEdit = () => {
    router.push(`/dashboard/workout-plans/${planId}/edit`);
  };

  const handleClone = async () => {
    if (!plan) return;
    
    try {
      // Verificar se workouts existe
      const workouts = plan.workouts || [];
      
      const cloneData = {
        name: `${plan.name} (Cópia)`,
        description: plan.description,
        student_id: plan.student_id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        workouts: workouts.map(w => ({
          workout_id: w.workout?.id || w.workout_id,
          day_of_week: w.day_of_week
        })).filter(w => w.workout_id) // Filtrar treinos sem ID válido
      };

      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloneData),
      });

      if (!response.ok) {
        throw new Error('Erro ao clonar plano');
      }

      toast({
        title: "Plano clonado!",
        description: "Uma cópia do plano foi criada com sucesso.",
      });

      router.push('/dashboard/workout-plans');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao clonar plano",
        description: error instanceof Error ? error.message : "Não foi possível clonar o plano.",
      });
    }
  };

  const handleDelete = async () => {
    if (!plan || isDeleting) return;
    
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o plano "${plan.name}"? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/workout-plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar plano');
      }

      toast({
        title: "Plano deletado!",
        description: "O plano foi removido com sucesso.",
      });

      router.push('/dashboard/workout-plans');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar plano",
        description: error instanceof Error ? error.message : "Não foi possível deletar o plano.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!plan) return;
    
    try {
      // Aqui você implementaria a lógica para pausar/ativar o plano
      // Por enquanto, apenas mostrar um toast
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A alteração de status do plano será implementada em breve.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do plano.",
      });
    }
  };

  const handleStartWorkout = (workoutId: string) => {
    // Navegar para página de execução do treino
    router.push(`/dashboard/workouts/${workoutId}/execute`);
  };

  const handleStartPlan = () => {
    // Navegar para primeira sessão do plano
    if (plan && plan.workouts && plan.workouts.length > 0) {
      const firstWorkout = plan.workouts[0];
      console.log('🔍 DEBUG - Primeiro workout:', firstWorkout);
      
      const workoutId = firstWorkout?.workout?.id || firstWorkout?.workout_id;
      console.log('🔍 DEBUG - ID do primeiro workout:', workoutId);
      
      if (workoutId) {
        router.push(`/dashboard/workouts/${workoutId}/execute?planId=${planId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao iniciar plano",
          description: "Não foi possível encontrar treinos válidos neste plano.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Plano vazio",
        description: "Este plano não possui treinos configurados.",
      });
    }
  };

  // Loading state
  if (isLoading || !plan) {
    return <WorkoutPlanDetailSkeleton />;
  }

  const stats = getStats(plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        
        {/* Header */}
        <WorkoutPlanDetailHeader
          plan={plan}
          stats={stats}
          userRole={userRole}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onStartPlan={userRole === 'student' ? handleStartPlan : undefined}
          isLoading={isDeleting}
        />

        {/* Schedule */}
        <WorkoutPlanSchedule
          plan={plan}
          onStartWorkout={userRole === 'student' ? handleStartWorkout : undefined}
          userRole={userRole}
        />
      </div>
    </div>
  );
}