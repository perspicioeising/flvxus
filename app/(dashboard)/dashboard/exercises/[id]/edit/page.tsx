// app/(dashboard)/dashboard/exercises/[id]/edit/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { ExerciseFormCarousel } from '@/components/exercices/components/create/ExerciseFormCarousel';

export default function EditExercisePageRoute() {
  const params = useParams();
  const exerciseId = params.id as string;

  return (
    <ExerciseFormCarousel 
      mode="edit" 
      exerciseId={exerciseId} 
    />
  );
}