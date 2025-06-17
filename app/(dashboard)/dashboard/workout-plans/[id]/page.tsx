'use client';

import { WorkoutPlanDetailPage } from '@/components/workout-plans/components/details/WorkoutPlanDetailPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return (
    <WorkoutPlanDetailPage 
      planId={params.id}
      userRole="trainer" // TODO: Obter do contexto de autenticação
    />
  );
}