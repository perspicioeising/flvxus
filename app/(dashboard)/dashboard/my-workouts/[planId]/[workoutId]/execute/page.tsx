'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WorkoutExecutionInterface } from '@/components/my-workouts/components/execution/WorkoutExecutionInterface';

export default function WorkoutExecutePage() {
  const params = useParams();
  
  const planId = params.planId as string;
  const workoutId = params.workoutId as string;

  return (
    <WorkoutExecutionInterface 
      planId={planId}
      workoutId={workoutId}
    />
  );
}