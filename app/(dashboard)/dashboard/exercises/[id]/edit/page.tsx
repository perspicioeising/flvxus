// app/(dashboard)/dashboard/exercises/[id]/edit/page.tsx
'use client';

import { ExerciseFormCarousel } from '@/components/exercices/components/create/ExerciseFormCarousel';
import { useParams } from 'next/navigation';

export default function EditExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;
  
  return <ExerciseFormCarousel mode="edit" exerciseId={exerciseId} />;
}