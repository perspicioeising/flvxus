// app/(dashboard)/dashboard/diets/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { DietForm } from '@/components/diets';

export default function NewDietPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/diets');
  };

  return (
    <DietForm 
      mode="create"
      onSuccess={handleSuccess}
    />
  );
}