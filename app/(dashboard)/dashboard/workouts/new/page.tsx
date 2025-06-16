// app/(dashboard)/dashboard/workouts/new/page.tsx
'use client';

import { WorkoutForm } from '@/components/workouts/components/create/WorkoutForm';

export default function NewWorkoutPage() {
  return (
    <WorkoutForm 
      mode="create"
      onSuccess={() => {
        // Callback opcional para quando o treino for criado com sucesso
        console.log('Treino criado com sucesso!');
      }}
    />
  );
}