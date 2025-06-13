// app/(dashboard)/dashboard/physical-assessments/new/page.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PhysicalAssessmentFormCarousel } from '@/components/physical-assessments/components/physicalAssessmentForm';

export default function NewPhysicalAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (response.ok) {
        if (data.role !== 'trainer') {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Apenas treinadores podem criar avaliações físicas.",
          });
          router.push('/dashboard/physical-assessments');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const handleSuccess = () => {
    router.push('/dashboard/physical-assessments');
  };

  return (
    <PhysicalAssessmentFormCarousel
      mode="create"
      onSuccess={handleSuccess}
    />
  );
}