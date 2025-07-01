// components/physical-assessments/components/comparisonSummary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Zap,
  Trophy,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { ComparisonData, Assessment } from '@/components/physical-assessments/types/assessment-comparison';

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

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  // Função para gerar recomendações inteligentes
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (positiveChanges > negativeChanges) {
      // Cenário positivo
      recommendations.push({
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        text: "Excelente progresso! Continue com o protocolo atual",
        priority: 'high'
      });
      
      recommendations.push({
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        text: "Mantenha a consistência no treinamento e alimentação",
        priority: 'medium'
      });

      if (progressScore >= 80) {
        recommendations.push({
          icon: <TrendingUp className="h-5 w-5 text-app-achievement-workout" />,
          text: "Considere aumentar gradualmente a intensidade dos treinos",
          priority: 'low'
        });
      } else {
        recommendations.push({
          icon: <Target className="h-5 w-5 text-app-achievement-consecutive" />,
          text: "Pequenos ajustes podem otimizar ainda mais os resultados",
          priority: 'medium'
        });
      }
    } else if (negativeChanges > positiveChanges) {
      // Cenário que precisa de melhoria
      recommendations.push({
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        text: "Necessário revisar estratégia de treinamento e nutrição",
        priority: 'high'
      });
      
      recommendations.push({
        icon: <Activity className="h-5 w-5 text-orange-500" />,
        text: "Avaliar fatores externos: sono, estresse e hidratação",
        priority: 'high'
      });
      
      recommendations.push({
        icon: <BarChart3 className="h-5 w-5 text-app-achievement-exercise" />,
        text: "Considerar ajustes no protocolo de avaliação",
        priority: 'medium'
      });
    } else {
      // Cenário neutro/estável
      recommendations.push({
        icon: <Target className="h-5 w-5 text-app-achievement-workout" />,
        text: "Resultados estáveis - considere variar o estímulo de treino",
        priority: 'medium'
      });
      
      recommendations.push({
        icon: <Zap className="h-5 w-5 text-yellow-500" />,
        text: "Introduzir novos exercícios ou metodologias",
        priority: 'medium'
      });
      
      recommendations.push({
        icon: <Calendar className="h-5 w-5 text-app-achievement-consecutive" />,
        text: "Reavaliar objetivos e metas do treinamento",
        priority: 'low'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Função para determinar gradiente do score
  const getScoreGradient = (score: number): string => {
    if (score >= 70) return 'from-green-500 to-emerald-600';
    if (score >= 50) return 'from-app-achievement-workout to-app-btn-primary';
    if (score >= 30) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 70) return 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20';
    if (score >= 50) return 'bg-app-bg-secondary/50';
    if (score >= 30) return 'from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20';
    return 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 70) return 'Excelente evolução! 🎉';
    if (score >= 50) return 'Boa evolução 💪';
    if (score >= 30) return 'Evolução moderada 📊';
    return 'Precisa de ajustes ⚡';
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 to-app-achievement-exercise/20 rounded-3xl blur-xl"></div>
      <Card className="relative border-0 bg-app-bg-card/80 backdrop-blur-xl rounded-3xl shadow-app-xl overflow-hidden">
        
        {/* Header */}
        <CardHeader className="p-8 bg-gradient-to-r from-app-bg-accent/30 to-app-bg-secondary/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-app-achievement-workout via-app-achievement-exercise to-app-btn-primary rounded-2xl shadow-app-medium">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Crown className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-app-text-heading">
                Resumo da Evolução
              </CardTitle>
              <CardDescription className="text-app-text-secondary flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(selectedPreviousAssessment.date)} → {formatDate(currentAssessment.date)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          
          {/* Score Geral de Progresso */}
          <div className="relative mb-10">
            <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(progressScore)} rounded-2xl blur-2xl opacity-50`}></div>
            <div className={`relative text-center p-8 bg-gradient-to-br ${getScoreBg(progressScore)} backdrop-blur-sm rounded-2xl border border-app-border-accent shadow-app-xl`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className={`h-6 w-6 ${progressScore >= 70 ? 'text-yellow-500' : progressScore >= 50 ? 'text-app-achievement-workout' : 'text-app-text-muted'}`} />
                <h3 className="text-xl font-bold text-app-text-heading">Score de Progresso</h3>
              </div>
              <div className="relative inline-block">
                <div className={`text-6xl font-black bg-gradient-to-br ${getScoreGradient(progressScore)} bg-clip-text text-transparent mb-4`}>
                  {progressScore}%
                </div>
                <Sparkles className="absolute -top-2 -right-4 h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
              <div className="text-lg text-app-text-primary font-semibold">
                {getScoreMessage(progressScore)}
              </div>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <MetricCard
              value={positiveChanges}
              label="Melhorias"
              icon={CheckCircle2}
              gradient="from-green-500 to-emerald-600"
              bgColor="from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20"
              textColor="text-green-700 dark:text-green-300"
              trend={<ArrowUpRight className="h-4 w-4 text-green-600" />}
            />
            
            <MetricCard
              value={negativeChanges}
              label="Atenção"
              icon={AlertTriangle}
              gradient="from-red-500 to-rose-600"
              bgColor="from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20"
              textColor="text-red-700 dark:text-red-300"
              trend={<ArrowDownRight className="h-4 w-4 text-red-600" />}
            />

            <MetricCard
              value={neutralChanges}
              label="Estáveis"
              icon={Target}
              gradient="from-app-achievement-consecutive to-app-btn-secondary"
              bgColor="bg-app-bg-secondary/50"
              textColor="text-app-text-heading"
              trend={null}
            />
            
            <MetricCard
              value={daysDifference}
              label="Intervalo"
              icon={Calendar}
              gradient="from-app-achievement-workout to-app-btn-primary"
              bgColor="bg-app-bg-accent/30"
              textColor="text-app-text-heading"
              trend={null}
              suffix="dias"
            />
          </div>

          {/* Detalhamento das Mudanças */}
          <div className="mb-10">
            <h4 className="text-xl font-bold text-app-text-heading mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-achievement-exercise rounded-lg shadow-app-medium">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              Detalhamento das Mudanças
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonData.map((data, index) => (
                <ChangeDetailCard key={index} data={data} index={index} />
              ))}
            </div>
          </div>
          
          {/* Recomendações Inteligentes */}
          <RecommendationsSection recommendations={recommendations} />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para cards de métricas
interface MetricCardProps {
  value: number;
  label: string;
  icon: any;
  gradient: string;
  bgColor: string;
  textColor: string;
  trend?: React.ReactNode;
  suffix?: string;
}

function MetricCard({
  value,
  label,
  icon: Icon,
  gradient,
  bgColor,
  textColor,
  trend,
  suffix = ""
}: MetricCardProps): React.JSX.Element {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      <div className={`relative bg-gradient-to-br ${bgColor} backdrop-blur-xl rounded-2xl p-6 border border-app-border-accent shadow-app-xl transform group-hover:scale-105 transition-all duration-300 overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 bg-gradient-to-br ${gradient} rounded-lg shadow-app-medium`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {trend}
          </div>
          <div className={`text-3xl font-black ${textColor} mb-1`}>
            {value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </div>
          <div className="text-sm font-semibold text-app-text-secondary">{label}</div>
        </div>
      </div>
    </div>
  );
}

// Componente para detalhes de mudança
function ChangeDetailCard({ data, index }: { data: ComparisonData; index: number }): React.JSX.Element {
  const getImprovementColor = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20';
      case 'negative': return 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20';
      default: return 'bg-app-bg-secondary/50';
    }
  };

  const getTextColor = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'text-green-700 dark:text-green-300';
      case 'negative': return 'text-red-700 dark:text-red-300';
      default: return 'text-app-text-heading';
    }
  };

  const getGradient = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'from-green-500 to-emerald-600';
      case 'negative': return 'from-red-500 to-rose-600';
      default: return 'from-app-achievement-consecutive to-app-btn-secondary';
    }
  };

  return (
    <div 
      className="relative group animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(data.improvement)} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className={`relative flex items-center justify-between p-4 bg-gradient-to-br ${getImprovementColor(data.improvement)} rounded-xl border border-app-border-accent shadow-app-medium group-hover:shadow-app-xl transition-all duration-300 group-hover:scale-[1.02]`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-app-bg-card/80 rounded-lg shadow-app-medium`}>
            {data.icon}
          </div>
          <span className="font-bold text-app-text-heading">
            {data.label}
          </span>
        </div>
        <div className="text-right">
          <div className={`font-black text-lg ${getTextColor(data.improvement)} flex items-center gap-1`}>
            {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}{data.unit}
            {data.improvement === 'positive' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : data.improvement === 'negative' ? (
              <ArrowDownRight className="h-4 w-4" />
            ) : null}
          </div>
          <div className="text-sm text-app-text-secondary font-semibold">
            {data.changePercentage > 0 ? '+' : ''}{data.changePercentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para recomendações
function RecommendationsSection({ recommendations }: { recommendations: Recommendation[] }): React.JSX.Element {
  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-rose-600';
      case 'medium': return 'from-yellow-500 to-amber-600';
      default: return 'from-app-achievement-workout to-app-btn-primary';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-800/20';
      case 'medium': return 'from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20';
      default: return 'bg-app-bg-accent/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Prioridade Alta';
      case 'medium': return 'Prioridade Média';
      default: return 'Prioridade Baixa';
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-exercise/10 rounded-2xl blur-xl"></div>
      <div className="relative p-8 bg-gradient-to-br from-app-bg-accent/50 to-app-bg-secondary/30 rounded-2xl border border-app-border-accent shadow-app-medium">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-app-achievement-workout to-app-achievement-exercise rounded-xl shadow-app-medium">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-app-achievement-workout mb-6 text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recomendações Personalizadas
              <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            </h4>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div 
                  key={index} 
                  className={`relative group animate-fadeIn`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${getPriorityGradient(recommendation.priority)} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className={`relative flex items-start gap-3 p-4 bg-gradient-to-br ${getPriorityBg(recommendation.priority)} rounded-xl border border-app-border-accent shadow-app-medium group-hover:shadow-app-xl transition-all duration-300 group-hover:scale-[1.01]`}>
                    <div className="p-2 bg-app-bg-card/80 rounded-lg shadow-sm">
                      {recommendation.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-app-text-heading mb-1">
                        {recommendation.text}
                      </p>
                      <Badge className={`px-3 py-1 bg-gradient-to-r ${getPriorityGradient(recommendation.priority)} text-white border-0 rounded-full text-xs font-bold shadow-app-medium`}>
                        {getPriorityLabel(recommendation.priority)}
                      </Badge>
                    </div>
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