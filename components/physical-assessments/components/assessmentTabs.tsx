// components/physical-assessments/components/assessmentTabs.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Ruler, Brain, TrendingUp } from "lucide-react";
import { AssessmentTabsProps } from '@/components/physical-assessments/types/physical-assessment-details';
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
  
  const tabs = [
    {
      value: "overview",
      label: "Visão Geral",
      shortLabel: "Geral",
      icon: Eye,
      gradient: "from-indigo-500 to-indigo-600",
      description: "Resumo completo da avaliação"
    },
    {
      value: "measurements",
      label: "Medidas",
      shortLabel: "Medidas",
      icon: Ruler,
      gradient: "from-blue-500 to-indigo-600",
      description: "Todas as medidas coletadas"
    },
    {
      value: "analysis",
      label: "Análise IA",
      shortLabel: "IA",
      icon: Brain,
      gradient: "from-purple-500 to-indigo-600",
      description: "Insights e recomendações"
    },
    {
      value: "comparison",
      label: "Evolução",
      shortLabel: "Evolução",
      icon: TrendingUp,
      gradient: "from-teal-500 to-indigo-600",
      description: "Compare com avaliações anteriores"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-2xl blur-2xl"></div>
          
          {/* Tab List */}
          <TabsList className="relative grid w-full grid-cols-2 lg:grid-cols-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-2 border-0 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    relative flex items-center justify-center gap-2 rounded-xl font-semibold 
                    transition-all duration-300 py-3 px-4 group
                    ${isActive 
                      ? 'bg-gradient-to-br ' + tab.gradient + ' text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  {/* Active Indicator Glow */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-xl blur-md opacity-50`}></div>
                  )}
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'} transition-colors`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </div>
                  
                  {/* Hover Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent dark:from-gray-800/30 dark:to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content Area */}
        <div className="mt-16">
          <TabsContent value="overview" className="space-y-6 animate-fadeIn">
            <AssessmentOverview 
              assessment={assessment} 
              classification={classification} 
            />
          </TabsContent>

          <TabsContent value="measurements" className="space-y-6 animate-fadeIn">
            <AssessmentMeasurements 
              measurements={assessment.measurements} 
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 animate-fadeIn">
            <AssessmentAIAnalysis
              aiAnalysis={assessment.ai_analysis}
              aiRecommendations={assessment.ai_recommendations}
              className="enhanced-ui"
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6 animate-fadeIn">
            <AssessmentComparison
              currentAssessment={assessment}
              studentId={assessment.student_id}
              className="enhanced-ui"
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Tab Description Card - Mobile Optimized */}
      <div className="sm:hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-xl blur-xl"></div>
          <div className="relative p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-700/30">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {tabs.find(t => t.value === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}