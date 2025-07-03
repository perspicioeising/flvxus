// app/(dashboard)/dashboard/my-workouts/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { MyWorkoutsHeader } from '@/components/my-workouts/components/header/MyWorkoutsHeader';
import { StatsCards } from '@/components/my-workouts/components/stats/StatsCards';
import { TodayWorkoutsList } from '@/components/my-workouts/components/lists/TodayWorkoutsList';
import { WorkoutPlansList } from '@/components/my-workouts/components/lists/WorkoutPlansList';
import { RecentHistoryList } from '@/components/my-workouts/components/lists/RecentHistoryList';
import { LoadingScreen } from '@/components/my-workouts/components/LoadingScreen';
import { useMyWorkouts } from '@/components/my-workouts/hooks/useMyWorkouts';
import { useWorkoutUtils } from '@/components/my-workouts/hooks/useWorkoutUtils';

export default function MyWorkoutsPage() {
  const router = useRouter();
  const { workoutPlans, recentHistory, stats, isLoading } = useMyWorkouts();
  const { getActivePlans, getTodayWorkouts } = useWorkoutUtils(workoutPlans);

  const handleStartWorkout = (workoutId: string, planId: string) => {
    router.push(`/dashboard/my-workouts/${planId}/${workoutId}/execute`);
  };

  const handleViewPlan = (planId: string) => {
    router.push(`/dashboard/my-workouts/${planId}`);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const activePlans = getActivePlans();
  const todayWorkouts = getTodayWorkouts();

  console.log('🏠 Página: Dados carregados:', {
    workoutPlans: workoutPlans.length,
    activePlans: activePlans.length,
    todayWorkouts: todayWorkouts.length
  });

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        
        {/* Header */}
        <MyWorkoutsHeader />

        {/* Stats Cards */}
        <StatsCards stats={stats} className="mb-6" />

        <div className="space-y-6">
          {/* Layout responsivo */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Coluna Principal */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Treinos de Hoje - Sempre primeiro */}
              <TodayWorkoutsList 
                workouts={todayWorkouts} 
                onStartWorkout={handleStartWorkout} 
              />

              {/* Suas Rotinas Ativas - Mobile/Tablet */}
              <div className="xl:hidden">
                <WorkoutPlansList 
                  workoutPlans={activePlans} 
                  onViewPlan={handleViewPlan}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Histórico Recente */}
              <RecentHistoryList history={recentHistory} />
              
              {/* Suas Rotinas Ativas - Desktop */}
              <div className="hidden xl:block">
                <WorkoutPlansList 
                  workoutPlans={activePlans} 
                  onViewPlan={handleViewPlan}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}