// app/(dashboard)/dashboard/physical-assessments/[id]/edit/page.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PhysicalAssessmentFormCarousel } from '@/components/physical-assessments/components/physicalAssessmentForm';

export default function EditPhysicalAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const assessmentId = params.id as string;

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (response.ok) {
        if (data.role !== 'trainer') {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Apenas treinadores podem editar avaliações físicas.",
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

  if (!assessmentId) {
    return null;
  }

  return (
    <PhysicalAssessmentFormCarousel
      mode="edit"
      assessmentId={assessmentId}
      onSuccess={handleSuccess}
    />
  );
}