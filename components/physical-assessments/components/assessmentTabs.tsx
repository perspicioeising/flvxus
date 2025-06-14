// components/physical-assessments/components/assessmentTabs.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Ruler, Brain, TrendingUp } from "lucide-react";
import { AssessmentTabsProps } from '@/types/physical-assessment-details';
import { AssessmentOverview } from '@/components/physical-assessments/components/details/assessmentOverview';
import { AssessmentMeasurements } from '@/components/physical-assessments/components/details/assessmentMeasurements';
import AssessmentAIAnalysis from '@/components/AssessmentAIAnalysis';
import { AssessmentComparison } from './comparacao/assessmentComparison';

export function AssessmentTabs({ 
  assessment, 
  activeTab, 
  onTabChange, 
  classification 
}: AssessmentTabsProps) {
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {/* Mobile-Optimized Tabs */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl blur-xl opacity-20"></div>
        <TabsList className="relative grid w-full grid-cols-2 sm:grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-xl sm:rounded-2xl  border-0 gap-1">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm  "
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger
            value="measurements"
            className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm "
          >
            <Ruler className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Medidas</span>
            <span className="sm:hidden">Medidas</span>
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm "
          >
            <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Análise IA</span>
            <span className="sm:hidden">IA</span>
          </TabsTrigger>
          <TabsTrigger
            value="comparison"
            className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 font-semibold text-xs sm:text-sm"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Comparação</span>
            <span className="sm:hidden">Compare</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Contents */}
      <TabsContent value="overview" className="space-y-4 sm:space-y-6">
        <AssessmentOverview 
          assessment={assessment} 
          classification={classification} 
        />
      </TabsContent>

      <TabsContent value="measurements" className="space-y-4 sm:space-y-6">
        <AssessmentMeasurements 
          measurements={assessment.measurements} 
        />
      </TabsContent>

      <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
        <AssessmentAIAnalysis
          aiAnalysis={assessment.ai_analysis}
          aiRecommendations={assessment.ai_recommendations}
          className="mobile-optimized"
        />
      </TabsContent>

      <TabsContent value="comparison" className="space-y-4 sm:space-y-6">
        <AssessmentComparison
          currentAssessment={assessment}
          studentId={assessment.student_id}
          className="mobile-optimized"
        />
      </TabsContent>
    </Tabs>
  );
}