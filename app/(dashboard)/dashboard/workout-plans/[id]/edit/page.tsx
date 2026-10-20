'use client';

import { use } from 'react';
import { WorkoutPlanForm } from '@/components/workout-plans/components/create/WorkoutPlanForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditWorkoutPlanPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <WorkoutPlanForm 
      mode="edit"
      workoutPlanId={id}
    />
  );
}