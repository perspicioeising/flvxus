'use client';

import { use } from 'react';
import { WorkoutPlanDetailPage } from '@/components/workout-plans/components/details/WorkoutPlanDetailPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  return (
    <WorkoutPlanDetailPage 
      planId={id}
      userRole="trainer" // TODO: Obter do contexto de autenticação
    />
  );
}