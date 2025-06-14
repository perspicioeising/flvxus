// components/physical-assessments/components/assessmentComparison.tsx
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, User, Trophy } from "lucide-react";
import { AssessmentComparisonProps } from '@/components/physical-assessments/types/assessment-comparison';
import { useAssessmentComparison } from '@/components/physical-assessments/hooks/useAssessmentComparison';
import { ComparisonSkeleton } from './comparisonSkeleton';
import { ComparisonEmptyState } from './comparisonEmptyState';
import { ComparisonHeader } from './comparisonHeader';
import { ComparisonOverview } from './comparisonOverview';
import { ComparisonMeasurements } from './comparisonMeasurements';
import { ComparisonSummary } from './comparisonSummary';

export function AssessmentComparison({
  currentAssessment,
  studentId,
  className
}: AssessmentComparisonProps) {
  const {
    // Estados
    isLoading,
    previousAssessments,
    selectedPreviousAssessment,
    comparisonData,
    selectedMeasurement,
    activeTab,
    activeMeasurementCategory,

    // Ações
    setSelectedMeasurement,
    setActiveTab,
    setActiveMeasurementCategory,
    handleMeasurementClick,
    handleAssessmentSelect,

    // Utilitários
    getOverallProgress
  } = useAssessmentComparison(currentAssessment, studentId);

  // Loading state
  if (isLoading) {
    return <ComparisonSkeleton />;
  }

  // Empty state - primeira avaliação
  if (previousAssessments.length === 0) {
    return <ComparisonEmptyState />;
  }

  // Estados derivados
  const progress = getOverallProgress();

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>

      {/* Header com seleção de avaliação */}
      <ComparisonHeader
        progress={progress}
        availableAssessments={previousAssessments}
        selectedAssessment={selectedPreviousAssessment}
        onAssessmentSelect={handleAssessmentSelect}
      />

      {/* Tabs de Navegação */}
      {selectedPreviousAssessment && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
            <TabsList className="relative grid w-full grid-cols-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-lg sm:shadow-2xl rounded-xl sm:rounded-2xl p-1 sm:p-2 border-0">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 "
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Métricas</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger
                value="measurements"
                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 "
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Corpo</span>
                <span className="sm:hidden">Medidas</span>
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm py-2 "
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Resumo</span>
                <span className="sm:hidden">Resume</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="overview">
            <ComparisonOverview comparisonData={comparisonData} />
          </TabsContent>

          <TabsContent value="measurements">
            <ComparisonMeasurements
              currentAssessment={currentAssessment}
              selectedPreviousAssessment={selectedPreviousAssessment}
              selectedMeasurement={selectedMeasurement}
              setSelectedMeasurement={setSelectedMeasurement}
              activeMeasurementCategory={activeMeasurementCategory}
              setActiveMeasurementCategory={setActiveMeasurementCategory}
              onMeasurementClick={handleMeasurementClick}
            />
          </TabsContent>

          <TabsContent value="summary">
            <ComparisonSummary
              comparisonData={comparisonData}
              currentAssessment={currentAssessment}
              selectedPreviousAssessment={selectedPreviousAssessment}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Export default para compatibilidade
export default AssessmentComparison;