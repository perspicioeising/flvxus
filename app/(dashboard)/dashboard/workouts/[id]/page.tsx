// app/(dashboard)/dashboard/workouts/[id]/page.tsx
'use client';

import { use } from 'react';
import { WorkoutDetail } from '@/components/workouts/components/details/WorkoutDetail';

interface WorkoutDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const { id } = use(params);
  return (
    <WorkoutDetail 
      workoutId={id}
      userRole="trainer" // TODO: Get from context/session
    />
  );
}