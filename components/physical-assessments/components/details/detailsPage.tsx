// app/(dashboard)/dashboard/physical-assessments/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity, Sparkles, ArrowLeft } from "lucide-react";
import { usePhysicalAssessmentDetails } from '@/components/physical-assessments/hooks/usePhysicalAssessmentDetails';
import { AssessmentDetailsSkeleton } from '@/components/physical-assessments/components/details/assessmentDetailsSkeleton';
import { AssessmentDetailsHeader } from '@/components/physical-assessments/components/details/assessmentDetailsHeader';
import { AssessmentDetailsContent } from '@/components/physical-assessments/components/details/AssessmentDetailsContent';
import { AssessmentDetailsActions } from '@/components/physical-assessments/components/details/AssessmentDetailsActions';
import { FloatingActionButton } from '@/components/physical-assessments/components/details/loatingActionButton';

export function AssessmentDetailsPage() {
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
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-6xl">
        
        {/* Header com design melhorado */}
        <AssessmentDetailsHeader
          assessment={assessment}
          userRole={userRole}
          onEdit={editAssessment}
          onDelete={deleteAssessment}
          onShare={shareAssessment}
          onDownload={downloadReport}
        />

        {/* Content com animações e transições suaves */}
        <div className="animate-fadeIn">
          <AssessmentDetailsContent
            assessment={assessment}
            classification={classification}
          />
        </div>

        {/* Ações secundárias (mobile) */}
        <AssessmentDetailsActions
          assessment={assessment}
          onEdit={editAssessment}
          onShare={shareAssessment}
          onDownload={downloadReport}
          onDelete={deleteAssessment}
          isDeleting={isDeleting}
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

// Componente para assessment não encontrada - Design melhorado com cores do módulo
function AssessmentNotFound() {
  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4">
      <div className="relative max-w-md mx-auto">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-text-accent/20 to-app-achievement-workout/20 rounded-3xl blur-3xl animate-pulse"></div>
        
        {/* Card Principal */}
        <Card className="relative border-0 bg-app-overlay backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout via-app-text-accent to-app-achievement-workout"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(var(--achievement-workout),0.1)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--achievement-workout),0.1)_0%,transparent_50%)]"></div>
          </div>
          
          <CardContent className="relative text-center py-16 px-8 sm:py-24 sm:px-12">
            {/* Icon Container */}
            <div className="relative mb-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-app-bg-secondary via-app-border-muted to-app-bg-secondary rounded-full flex items-center justify-center shadow-app-xl">
                  <Activity className="h-12 w-12 sm:h-16 sm:w-16 text-app-achievement-workout" />
                </div>
                {/* Alert Icon */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-app-medium">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              {/* Animated Rings */}
              <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-text-accent/20 to-app-achievement-workout/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
            </div>

            {/* Content */}
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-app-heading via-app-achievement-workout to-app-heading bg-clip-text text-transparent mb-4">
              Avaliação não encontrada
            </h2>
            <p className="text-app-text-secondary mb-8 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
              A avaliação solicitada não existe ou você não tem permissão para acessá-la.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.href = '/dashboard/physical-assessments'}
                className="group relative px-6 py-3 bg-gradient-to-r from-app-achievement-workout to-app-btn-primary hover:from-app-achievement-workout hover:to-app-btn-primary text-white rounded-xl font-semibold shadow-app-xl hover:shadow-app-achievement-workout/25 transition-all duration-300 transform hover:scale-105 border-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Voltar às Avaliações
                  <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                </span>
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout to-app-btn-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="px-6 py-3 bg-app-card border-2 border-app-border-accent hover:border-app-achievement-workout text-app-achievement-workout rounded-xl font-semibold shadow-app-medium transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-app-achievement-workout/20 to-app-text-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-app-achievement-workout/20 to-app-btn-primary/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
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

/* Gradient classes for buttons */
.btn-gradient-primary {
  background: linear-gradient(135deg, rgb(var(--achievement-workout)), rgb(var(--button-primary)));
}

.btn-gradient-primary:hover {
  background: linear-gradient(135deg, rgb(var(--achievement-workout)), rgb(var(--button-primary-hover)));
}

/* Card app styling */
.card-app {
  background: rgb(var(--background-card));
  backdrop-filter: blur(12px);
  border: 1px solid rgb(var(--border-accent));
  box-shadow: var(--shadow-large);
}

.card-app:hover {
  box-shadow: var(--shadow-xl);
}
`;