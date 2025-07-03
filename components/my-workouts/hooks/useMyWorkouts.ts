// components/my-workouts/hooks/useMyWorkouts.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlan, WorkoutHistory, StudentStats } from '../types';

export function useMyWorkouts() {
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [recentHistory, setRecentHistory] = useState<WorkoutHistory[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalWorkouts: 0,
    totalWeight: 0,
    totalExercises: 0,
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyWorkouts = async () => {
    try {
      console.log('🎯 Hook: Iniciando busca de treinos...');
      setIsLoading(true);
      
      // Buscar planos de treino
      const workoutsResponse = await fetch('/api/my-workouts');
      
      if (!workoutsResponse.ok) {
        const errorData = await workoutsResponse.json();
        throw new Error(errorData.error || 'Erro ao carregar treinos');
      }
      
      const workoutsData = await workoutsResponse.json();
      console.log('🎯 Hook: Planos recebidos:', workoutsData.length);
      
      // Mapear dados da API para a estrutura esperada pelos componentes
      const mappedPlans: WorkoutPlan[] = workoutsData.map((plan: any) => ({
        ...plan,
        // Mapear para estrutura antiga (compatibilidade)
        start_date: plan.startDate,
        end_date: plan.endDate,
        // Manter estrutura nova também
        startDate: plan.startDate,
        endDate: plan.endDate,
        workouts: plan.workouts || []
      }));
      
      setWorkoutPlans(mappedPlans);

      // Buscar histórico
      try {
        const historyResponse = await fetch('/api/workout-history');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          console.log('🎯 Hook: Histórico recebido:', historyData?.length || 0);
          
          // Mapear histórico para estrutura esperada
          const mappedHistory: WorkoutHistory[] = (historyData || []).map((item: any) => ({
            ...item,
            notes: item.notes || undefined // Converter null para undefined se necessário
          }));
          
          setRecentHistory(mappedHistory.slice(0, 10));
          
          // Calcular estatísticas baseadas no histórico
          if (historyData && historyData.length > 0) {
            const totalWorkouts = historyData.length;
            const totalWeight = historyData.reduce((sum: number, h: any) => sum + (h.total_weight || 0), 0);
            const totalExercises = historyData.reduce((sum: number, h: any) => sum + (h.exercises_completed || 0), 0);
            
            // Calcular treinos desta semana
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const weeklyWorkouts = historyData.filter((h: any) => 
              new Date(h.completed_at) >= oneWeekAgo
            ).length;

            // Duração média
            const averageDuration = historyData.length > 0 
              ? historyData.reduce((sum: number, h: any) => sum + h.duration, 0) / historyData.length 
              : 0;
            
            setStats({
              totalWorkouts,
              totalWeight,
              totalExercises,
              weeklyWorkouts,
              averageDuration,
              streak: 0, // Implementar cálculo de streak depois se necessário
              thisWeekProgress: weeklyWorkouts
            });
          }
        }
      } catch (historyError) {
        console.log('🎯 Hook: Erro ao buscar histórico (não crítico):', historyError);
        // Não falhar por causa do histórico
      }
      
    } catch (error) {
      console.error('🎯 Hook: Erro ao buscar treinos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar treinos",
        description: error instanceof Error ? error.message : "Não foi possível carregar seus treinos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWorkouts();
  }, []);

  return {
    workoutPlans,
    recentHistory,
    stats,
    isLoading,
    refetch: fetchMyWorkouts
  };
}