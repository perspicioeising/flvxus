// app/(dashboard)/dashboard/my-workouts/[planId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlanDetailStudent } from '@/components/my-workouts/components/details/WorkoutPlanDetailStudent';
import { LoadingScreen } from '@/components/my-workouts/components/LoadingScreen';
import { WorkoutPlan } from '@/components/my-workouts/types';

export default function WorkoutPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const planId = params.planId as string;

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workout-plans/${planId}`);
        
        if (!response.ok) {
          throw new Error('Plano não encontrado');
        }
        
        const data = await response.json();
        setPlan(data);
        
      } catch (error) {
        console.error('Error fetching plan:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar plano",
          description: error instanceof Error ? error.message : "Não foi possível carregar os detalhes do plano.",
        });
        router.push('/dashboard/my-workouts');
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, toast, router]);

  const handleStartWorkout = (workoutId: string) => {
    router.push(`/dashboard/my-workouts/${planId}/${workoutId}/execute`);
  };

  if (isLoading || !plan) {
    return <LoadingScreen />;
  }

  return (
    <WorkoutPlanDetailStudent 
      plan={plan}
      onStartWorkout={handleStartWorkout}
    />
  );
}


