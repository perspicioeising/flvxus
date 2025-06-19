// app/(dashboard)/dashboard/physical-assessments/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { PhysicalAssessmentFormCarousel } from '@/components/physical-assessments/components/create/physicalAssessmentForm';

export default function EditAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  
  const handleSuccess = () => {
    // Redirecionar para a página de detalhes após sucesso
    router.push(`/dashboard/physical-assessments/${params.id}`);
  };

  return (
    <PhysicalAssessmentFormCarousel
      mode="edit"
      assessmentId={params.id as string}
      onSuccess={handleSuccess}
    />
  );
}