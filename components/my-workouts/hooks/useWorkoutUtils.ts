// components/my-workouts/hooks/useWorkoutUtils.ts
import { useMemo } from 'react';
import { WorkoutPlan, Workout } from '../types';

export function useWorkoutUtils(workoutPlans: WorkoutPlan[]) {
  
  const getActivePlans = useMemo(() => {
    return () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      return workoutPlans.filter(plan => {
        // Usar start_date/end_date (estrutura original) ou startDate/endDate (estrutura nova)
        const startDate = plan.start_date || plan.startDate;
        const endDate = plan.end_date || plan.endDate;
        
        if (!startDate) return true; // Se não tem data de início, considera ativo
        
        const isAfterStart = startDate <= todayStr;
        const isBeforeEnd = !endDate || endDate >= todayStr;
        
        return isAfterStart && isBeforeEnd;
      });
    };
  }, [workoutPlans]);

  const getTodayWorkouts = useMemo(() => {
    return () => {
      const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc.
      const activePlans = getActivePlans();
      
      console.log('🗓️ Utils: Dia de hoje:', today);
      console.log('🗓️ Utils: Planos ativos:', activePlans.length);
      
      const todayWorkouts: Workout[] = [];
      
      activePlans.forEach(plan => {
        console.log(`🗓️ Utils: Verificando plano ${plan.name} com ${plan.workouts?.length || 0} workouts`);
        
        // Usar a estrutura nova (workouts) se disponível
        if (plan.workouts) {
          plan.workouts.forEach(workout => {
            console.log(`🗓️ Utils: Workout ${workout.name} é dia ${workout.dayOfWeek}, hoje é ${today}`);
            
            if (workout.dayOfWeek === today) {
              console.log(`✅ Utils: Workout ${workout.name} é para hoje!`);
              todayWorkouts.push(workout);
            }
          });
        }
        // Fallback para estrutura antiga (workout_plan_items) se necessário
        else if (plan.workout_plan_items) {
          plan.workout_plan_items.forEach(item => {
            if (item.day_of_week === today && item.workout) {
              // Converter estrutura antiga para nova
              const workout: Workout = {
                id: item.workout.id,
                name: item.workout.name,
                description: item.workout.description,
                level: item.workout.level,
                goal: item.workout.goal,
                planId: plan.id,
                planName: plan.name,
                dayOfWeek: item.day_of_week,
                exercises: [], // Seria necessário mapear workout_exercises se necessário
                duration: item.workout.workout_exercises?.length * 5 || 0
              };
              todayWorkouts.push(workout);
            }
          });
        }
      });
      
      console.log('🗓️ Utils: Treinos de hoje encontrados:', todayWorkouts.length);
      return todayWorkouts;
    };
  }, [getActivePlans]);

  const getUpcomingWorkouts = useMemo(() => {
    return () => {
      const today = new Date().getDay();
      const activePlans = getActivePlans();
      
      const upcomingWorkouts: (Workout & { scheduledDate: Date })[] = [];
      
      // Próximos 7 dias
      for (let i = 1; i <= 7; i++) {
        const targetDay = (today + i) % 7;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        
        activePlans.forEach(plan => {
          // Usar estrutura nova (workouts)
          if (plan.workouts) {
            plan.workouts.forEach(workout => {
              if (workout.dayOfWeek === targetDay) {
                upcomingWorkouts.push({
                  ...workout,
                  scheduledDate: targetDate
                });
              }
            });
          }
          // Fallback para estrutura antiga
          else if (plan.workout_plan_items) {
            plan.workout_plan_items.forEach(item => {
              if (item.day_of_week === targetDay && item.workout) {
                const workout: Workout & { scheduledDate: Date } = {
                  id: item.workout.id,
                  name: item.workout.name,
                  description: item.workout.description,
                  level: item.workout.level,
                  goal: item.workout.goal,
                  planId: plan.id,
                  planName: plan.name,
                  dayOfWeek: item.day_of_week,
                  exercises: [],
                  duration: item.workout.workout_exercises?.length * 5 || 0,
                  scheduledDate: targetDate
                };
                upcomingWorkouts.push(workout);
              }
            });
          }
        });
      }
      
      // Limitar a 6 workouts e ordenar por data
      return upcomingWorkouts
        .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
        .slice(0, 6);
    };
  }, [getActivePlans]);

  return {
    getActivePlans,
    getTodayWorkouts,
    getUpcomingWorkouts
  };
}