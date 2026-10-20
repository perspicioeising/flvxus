// app/(dashboard)/dashboard/workouts/[id]/edit/page.tsx
'use client';

import { use } from 'react';
import { WorkoutForm } from '@/components/workouts/components/create/WorkoutForm';

interface EditWorkoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { id } = use(params);
  return (
    <WorkoutForm 
      mode="edit"
      workoutId={id}
      onSuccess={() => {
        // Callback opcional para quando o treino for atualizado com sucesso
        console.log('Treino atualizado com sucesso!');
      }}
    />
  );
}