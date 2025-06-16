// app/(dashboard)/dashboard/workouts/[id]/edit/page.tsx
'use client';

import { WorkoutForm } from '@/components/workouts/components/create/WorkoutForm';

interface EditWorkoutPageProps {
  params: {
    id: string;
  };
}

export default function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  return (
    <WorkoutForm 
      mode="edit"
      workoutId={params.id}
      onSuccess={() => {
        // Callback opcional para quando o treino for atualizado com sucesso
        console.log('Treino atualizado com sucesso!');
      }}
    />
  );
}