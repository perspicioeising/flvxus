'use client';

import React from 'react';
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { usePhysicalAssessmentDetails } from '@/components/physical-assessments/hooks/usePhysicalAssessmentDetails';
import { AssessmentDetailsSkeleton } from '@/components/physical-assessments/components/details/assessmentDetailsSkeleton';
import { AssessmentDetailsHeader } from '@/components/physical-assessments/components/details/assessmentDetailsHeader';
import { AssessmentTabs } from '@/components/physical-assessments/components/assessmentTabs';
import { FloatingActionButton } from '@/components/physical-assessments/components/details/loatingActionButton';
import { AssessmentComparison } from '@/components/physical-assessments/components/comparacao/assessmentComparison';

export default function AssessmentDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const {
    // Estados
    assessment,
    isLoading,
    userRole,
    activeTab,
    isDeleting,
    
    // Ações
    setActiveTab,
    deleteAssessment,
    editAssessment,
    shareAssessment,
    downloadReport,
    
    // Utilitários
    getClassificationColor
  } = usePhysicalAssessmentDetails(params.id as string);

  // Inicializar tab ativa baseada nos searchParams
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'measurements', 'analysis', 'comparison'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, setActiveTab]);

  // Loading state
  if (isLoading) {
    return <AssessmentDetailsSkeleton />;
  }

  // Assessment not found
  if (!assessment) {
    return <AssessmentNotFound />;
  }

  // Obter classificação
  const classification = getClassificationColor(assessment.fat_percentage, assessment.gender);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        
        {/* Header */}
        <AssessmentDetailsHeader
          assessment={assessment}
          userRole={userRole}
          onEdit={editAssessment}
          onDelete={deleteAssessment}
          onShare={shareAssessment}
          onDownload={downloadReport}
        />

        {/* Tabs Content */}
        <AssessmentTabs
          assessment={assessment}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          classification={classification}
        />

        {/* Floating Action Button - Mobile Only */}
        <FloatingActionButton
          userRole={userRole}
          onEdit={editAssessment}
          onShare={shareAssessment}
          onDownload={downloadReport}
          onDelete={deleteAssessment}
        />
      </div>
    </div>
  );
}

// Componente para assessment não encontrada
function AssessmentNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-red-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
          <CardContent className="text-center py-12 sm:py-24 px-6 sm:px-12">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-red-100 via-orange-100 to-red-100 dark:from-red-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-2xl">
                <AlertCircle className="h-10 w-10 sm:h-16 sm:w-16 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <h2 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
              Avaliação não encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 text-sm sm:text-lg leading-relaxed">
              A avaliação solicitada não existe ou você não tem permissão para acessá-la.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 border-0"
            >
              Voltar às Avaliações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}