// app/(dashboard)/dashboard/workouts/[id]/page.tsx
'use client';

import { WorkoutDetail } from '@/components/workouts/components/details/WorkoutDetail';

interface WorkoutDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  return (
    <WorkoutDetail 
      workoutId={params.id}
      userRole="trainer" // TODO: Get from context/session
    />
  );
}