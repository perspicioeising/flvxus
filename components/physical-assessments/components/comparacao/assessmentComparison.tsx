// components/physical-assessments/components/comparacao/assessmentComparison.tsx
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, User, Trophy, Sparkles } from "lucide-react";
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

  const tabs = [
    {
      value: "overview",
      label: "Métricas Gerais",
      shortLabel: "Métricas",
      icon: BarChart3,
      gradient: "from-app-achievement-workout to-app-btn-primary",
      description: "Comparação das principais métricas"
    },
    {
      value: "measurements",
      label: "Medidas Corporais",
      shortLabel: "Medidas",
      icon: User,
      gradient: "from-app-achievement-consecutive to-app-btn-secondary",
      description: "Visualização detalhada das mudanças"
    },
    {
      value: "summary",
      label: "Resumo e Análise",
      shortLabel: "Resumo",
      icon: Trophy,
      gradient: "from-app-achievement-exercise to-app-btn-accent",
      description: "Recomendações e insights"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>

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
          <div className="relative mb-8">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout/20 to-app-achievement-exercise/20 rounded-2xl blur-2xl"></div>
            
            {/* Tab List */}
            <TabsList className="relative grid w-full grid-cols-3 bg-app-bg-card/80 backdrop-blur-xl shadow-app-large rounded-2xl p-2 border-0 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`
                      relative group flex items-center justify-center gap-2 rounded-xl font-semibold 
                      py-3 px-4 transition-all duration-300
                      ${isActive 
                        ? 'text-white shadow-app-medium transform scale-[1.02]' 
                        : 'hover:bg-app-bg-secondary text-app-text-secondary hover:text-app-text-primary'
                      }
                    `}
                  >
                    {/* Active State Background */}
                    {isActive && (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl`}></div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl blur-md opacity-50`}></div>
                      </>
                    )}
                    
                    {/* Tab Content */}
                    <div className="relative z-10 flex items-center gap-2">
                      <Icon className={`h-4 w-4 transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-app-text-muted group-hover:text-app-text-secondary'
                      }`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      
                      {/* Active Indicator */}
                      {isActive && (
                        <Sparkles className="h-3 w-3 text-white/80 animate-pulse ml-1" />
                      )}
                    </div>
                    
                    {/* Hover Effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-app-bg-secondary/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Description - Mobile */}
          <div className="sm:hidden -mt-4 mb-6">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${tabs.find(t => t.value === activeTab)?.gradient} rounded-xl blur-xl opacity-10`}></div>
              <div className="relative p-3 bg-app-bg-card/60 backdrop-blur-sm rounded-xl border border-app-border-accent">
                <p className="text-xs text-center text-app-text-secondary">
                  {tabs.find(t => t.value === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Contents with smooth transitions */}
          <div className="relative">
            <TabsContent value="overview" className="animate-in fade-in-50 duration-500">
              <ComparisonOverview comparisonData={comparisonData} />
            </TabsContent>

            <TabsContent value="measurements" className="animate-in fade-in-50 duration-500">
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

            <TabsContent value="summary" className="animate-in fade-in-50 duration-500">
              <ComparisonSummary
                comparisonData={comparisonData}
                currentAssessment={currentAssessment}
                selectedPreviousAssessment={selectedPreviousAssessment}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

// Export default para compatibilidade
export default AssessmentComparison;