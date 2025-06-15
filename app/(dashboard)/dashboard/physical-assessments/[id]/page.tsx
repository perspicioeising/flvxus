'use client';

import React from 'react';
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity, Sparkles } from "lucide-react";
import { usePhysicalAssessmentDetails } from '@/components/physical-assessments/hooks/usePhysicalAssessmentDetails';
import { AssessmentDetailsSkeleton } from '@/components/physical-assessments/components/details/assessmentDetailsSkeleton';
import { AssessmentDetailsHeader } from '@/components/physical-assessments/components/details/assessmentDetailsHeader';
import { AssessmentTabs } from '@/components/physical-assessments/components/assessmentTabs';
import { FloatingActionButton } from '@/components/physical-assessments/components/details/loatingActionButton';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        
        {/* Header com design melhorado */}
        <AssessmentDetailsHeader
          assessment={assessment}
          userRole={userRole}
          onEdit={editAssessment}
          onDelete={deleteAssessment}
          onShare={shareAssessment}
          onDownload={downloadReport}
        />

        {/* Tabs Content com animações e transições suaves */}
        <div className="animate-fadeIn">
          <AssessmentTabs
            assessment={assessment}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            classification={classification}
          />
        </div>

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

// Componente para assessment não encontrada - Design melhorado
function AssessmentNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
      <div className="relative max-w-md mx-auto">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-500/20 to-indigo-600/20 rounded-3xl blur-3xl animate-pulse"></div>
        
        {/* Card Principal */}
        <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,100,240,0.1)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,100,240,0.1)_0%,transparent_50%)]"></div>
          </div>
          
          <CardContent className="relative text-center py-16 px-8 sm:py-24 sm:px-12">
            {/* Icon Container */}
            <div className="relative mb-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center shadow-2xl">
                  <Activity className="h-12 w-12 sm:h-16 sm:w-16 text-indigo-600 dark:text-indigo-400" />
                </div>
                {/* Alert Icon */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              {/* Animated Rings */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
            </div>

            {/* Content */}
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent mb-4">
              Avaliação não encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
              A avaliação solicitada não existe ou você não tem permissão para acessá-la.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.href = '/dashboard/physical-assessments'}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Voltar às Avaliações
                  <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                </span>
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      </div>
    </div>
  );
}

// Adicione estas classes CSS ao seu arquivo de estilos globais
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
`;