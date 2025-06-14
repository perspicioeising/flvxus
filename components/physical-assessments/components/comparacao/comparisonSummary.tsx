// components/physical-assessments/components/comparisonSummary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Award,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Lightbulb,
  Star,
  Target,
  BarChart3,
  Sparkles,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { ComparisonData, Assessment } from '@/types/assessment-comparison';

interface ComparisonSummaryProps {
  comparisonData: ComparisonData[];
  currentAssessment: Assessment;
  selectedPreviousAssessment: Assessment;
}

interface Recommendation {
  icon: React.ReactNode;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export function ComparisonSummary({
  comparisonData,
  currentAssessment,
  selectedPreviousAssessment
}: ComparisonSummaryProps): React.JSX.Element {
  
  // Cálculos das métricas
  const positiveChanges = comparisonData.filter(d => d.improvement === 'positive').length;
  const negativeChanges = comparisonData.filter(d => d.improvement === 'negative').length;
  const neutralChanges = comparisonData.filter(d => d.improvement === 'neutral').length;
  const totalMetrics = comparisonData.length;
  
  // Cálculo do intervalo de tempo
  const daysDifference = Math.abs(
    Math.ceil(
      (new Date(currentAssessment.date).getTime() - new Date(selectedPreviousAssessment.date).getTime()) / 
      (1000 * 60 * 60 * 24)
    )
  );

  // Score geral de progresso
  const progressScore = totalMetrics > 0 ? Math.round((positiveChanges / totalMetrics) * 100) : 0;

  // Função para gerar recomendações inteligentes
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (positiveChanges > negativeChanges) {
      // Cenário positivo
      recommendations.push({
        icon: <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0 mt-0.5" />,
        text: "Excelente progresso! Continue com o protocolo atual",
        priority: 'high'
      });
      
      recommendations.push({
        icon: <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />,
        text: "Mantenha a consistência no treinamento e alimentação",
        priority: 'medium'
      });

      if (progressScore >= 80) {
        recommendations.push({
          icon: <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />,
          text: "Considere aumentar gradualmente a intensidade dos treinos",
          priority: 'low'
        });
      } else {
        recommendations.push({
          icon: <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />,
          text: "Pequenos ajustes podem otimizar ainda mais os resultados",
          priority: 'medium'
        });
      }
    } else if (negativeChanges > positiveChanges) {
      // Cenário que precisa de melhoria
      recommendations.push({
        icon: <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0 mt-0.5" />,
        text: "Necessário revisar estratégia de treinamento e nutrição",
        priority: 'high'
      });
      
      recommendations.push({
        icon: <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0 mt-0.5" />,
        text: "Avaliar fatores externos: sono, estresse e hidratação",
        priority: 'high'
      });
      
      recommendations.push({
        icon: <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0 mt-0.5" />,
        text: "Considerar ajustes no protocolo de avaliação",
        priority: 'medium'
      });
    } else {
      // Cenário neutro/estável
      recommendations.push({
        icon: <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0 mt-0.5" />,
        text: "Resultados estáveis - considere variar o estímulo de treino",
        priority: 'medium'
      });
      
      recommendations.push({
        icon: <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0 mt-0.5" />,
        text: "Introduzir novos exercícios ou metodologias",
        priority: 'medium'
      });
      
      recommendations.push({
        icon: <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />,
        text: "Reavaliar objetivos e metas do treinamento",
        priority: 'low'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Função para determinar cor do score
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-blue-600 dark:text-blue-400';
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 70) return 'from-green-600 to-emerald-600';
    if (score >= 50) return 'from-blue-600 to-cyan-600';
    if (score >= 30) return 'from-yellow-600 to-orange-600';
    return 'from-red-600 to-pink-600';
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
        
        {/* Header */}
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative mx-auto sm:mx-0">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Resumo da Evolução
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Período: {format(new Date(selectedPreviousAssessment.date), 'dd/MM/yyyy', { locale: ptBR })} → {format(new Date(currentAssessment.date), 'dd/MM/yyyy', { locale: ptBR })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          
          {/* Score Geral de Progresso */}
          <div className="relative mb-8">
            <div className={`absolute inset-0 bg-gradient-to-r ${getScoreGradient(progressScore)} rounded-xl sm:rounded-2xl blur-xl opacity-50`}></div>
            <div className="relative text-center p-6 sm:p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-blue-200/30 dark:border-blue-700/30">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Score de Progresso</h3>
              <div className={`text-4xl sm:text-6xl font-black ${getScoreColor(progressScore)} mb-4`}>
                {progressScore}%
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                {progressScore >= 70 ? 'Excelente evolução!' :
                 progressScore >= 50 ? 'Boa evolução' :
                 progressScore >= 30 ? 'Evolução moderada' : 'Precisa de ajustes'}
              </div>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <MetricCard
              value={positiveChanges}
              label="Melhoradas"
              icon={<CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-500 mx-auto mt-2" />}
              color="from-green-600 to-emerald-600"
              textColor="text-green-600 dark:text-green-400"
            />
            
            <MetricCard
              value={negativeChanges}
              label="Pioradas"
              icon={<AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-500 mx-auto mt-2" />}
              color="from-red-600 to-pink-600"
              textColor="text-red-600 dark:text-red-400"
            />

            <MetricCard
              value={neutralChanges}
              label="Estáveis"
              icon={<Target className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500 mx-auto mt-2" />}
              color="from-gray-600 to-slate-600"
              textColor="text-gray-600 dark:text-gray-400"
            />
            
            <MetricCard
              value={daysDifference}
              label="Dias"
              icon={<Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500 mx-auto mt-2" />}
              color="from-blue-600 to-cyan-600"
              textColor="text-blue-600 dark:text-blue-400"
            />
          </div>

          {/* Detalhamento das Mudanças */}
          <div className="mb-8">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              Detalhamento das Mudanças
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comparisonData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      data.improvement === 'positive' ? 'bg-green-100 dark:bg-green-900/30' :
                      data.improvement === 'negative' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {data.icon}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {data.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm sm:text-base ${
                      data.improvement === 'positive' ? 'text-green-600 dark:text-green-400' :
                      data.improvement === 'negative' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}{data.unit}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {data.changePercentage > 0 ? '+' : ''}{data.changePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recomendações Inteligentes */}
          <RecommendationsCard recommendations={recommendations} />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para cards de métricas
interface MetricCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
}

function MetricCard({
  value,
  label,
  icon,
  color,
  textColor
}: MetricCardProps): React.JSX.Element {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
        <div className={`text-2xl sm:text-4xl font-black ${textColor} mb-2`}>
          {value}
        </div>
        <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</div>
        {icon}
      </div>
    </div>
  );
}

// Componente para recomendações
interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

function RecommendationsCard({
  recommendations
}: RecommendationsCardProps): React.JSX.Element {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
      <div className="relative p-4 sm:p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl shadow-lg mx-auto sm:mx-0 flex-shrink-0">
            <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 sm:mb-4 text-base sm:text-lg flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              Recomendações Personalizadas
            </h4>
            <div className="space-y-3 text-blue-700 dark:text-blue-400 text-sm sm:text-base">
              {recommendations.map((recommendation, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-2 p-3 rounded-lg transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800/50 ${
                    recommendation.priority === 'high' ? 'border-l-4 border-red-400 bg-red-50/50 dark:bg-red-900/20' :
                    recommendation.priority === 'medium' ? 'border-l-4 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20' :
                    'border-l-4 border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  }`}
                >
                  {recommendation.icon}
                  <span className="font-medium flex-1">{recommendation.text}</span>
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                    recommendation.priority === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                    recommendation.priority === 'medium' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                    'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                  }`}>
                    {recommendation.priority === 'high' ? 'Alta' : 
                     recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}