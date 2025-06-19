// app/dashboard/exercises/new/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { ExerciseFormCarousel } from '@/components/exercices/components/create/ExerciseFormCarousel';

export default function NewExercisePage() {
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('clone');

  return (
    <ExerciseFormCarousel 
      mode="create" 
      cloneId={cloneId || undefined}
    />
  );
}