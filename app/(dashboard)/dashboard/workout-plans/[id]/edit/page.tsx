'use client';

import { WorkoutPlanForm } from '@/components/workout-plans/components/create/WorkoutPlanForm';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditWorkoutPlanPage({ params }: PageProps) {
  return (
    <WorkoutPlanForm 
      mode="edit"
      workoutPlanId={params.id}
    />
  );
}