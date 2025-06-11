'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Calendar,
  Target,
  Activity,
  Scale,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightCircle,
  Zap,
  Award,
  AlertTriangle,
  Crown,
  Star,
  Sparkles,
  Trophy,
  Lightbulb,
  CheckCircle2,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Assessment {
  id: string;
  student_id: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  protocol: string;
  bmi: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  body_density: number;
  notes?: string;
  created_at: string;
}

interface ComparisonData {
  metric: string;
  label: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  improvement: 'positive' | 'negative' | 'neutral';
}

interface AssessmentComparisonProps {
  currentAssessment: Assessment;
  studentId: string;
  className?: string;
}

const AssessmentComparison: React.FC<AssessmentComparisonProps> = ({
  currentAssessment,
  studentId,
  className
}) => {
  const [previousAssessments, setPreviousAssessments] = useState<Assessment[]>([]);
  const [selectedPreviousAssessment, setSelectedPreviousAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);

  useEffect(() => {
    fetchPreviousAssessments();
  }, [studentId]);

  useEffect(() => {
    if (previousAssessments.length > 0 && !selectedPreviousAssessment) {
      // Seleciona automaticamente a avaliação mais recente
      const mostRecent = previousAssessments
        .filter(assessment => assessment.id !== currentAssessment.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (mostRecent) {
        setSelectedPreviousAssessment(mostRecent);
      }
    }
  }, [previousAssessments, currentAssessment.id, selectedPreviousAssessment]);

  useEffect(() => {
    if (selectedPreviousAssessment) {
      generateComparisonData();
    }
  }, [selectedPreviousAssessment]);

  const fetchPreviousAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/physical-assessments?student_id=${studentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPreviousAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações anteriores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateComparisonData = () => {
    if (!selectedPreviousAssessment) return;

    const comparisons: ComparisonData[] = [
      {
        metric: 'weight',
        label: 'Peso',
        current: currentAssessment.weight,
        previous: selectedPreviousAssessment.weight,
        change: currentAssessment.weight - selectedPreviousAssessment.weight,
        changePercentage: ((currentAssessment.weight - selectedPreviousAssessment.weight) / selectedPreviousAssessment.weight) * 100,
        unit: 'kg',
        icon: <Scale className="h-5 w-5" />,
        color: 'blue',
        improvement: 'neutral'
      },
      {
        metric: 'bmi',
        label: 'IMC',
        current: currentAssessment.bmi,
        previous: selectedPreviousAssessment.bmi,
        change: currentAssessment.bmi - selectedPreviousAssessment.bmi,
        changePercentage: ((currentAssessment.bmi - selectedPreviousAssessment.bmi) / selectedPreviousAssessment.bmi) * 100,
        unit: '',
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'purple',
        improvement: currentAssessment.bmi < selectedPreviousAssessment.bmi ? 'positive' : 
                    currentAssessment.bmi > selectedPreviousAssessment.bmi ? 'negative' : 'neutral'
      },
      {
        metric: 'fat_percentage',
        label: '% Gordura',
        current: currentAssessment.fat_percentage,
        previous: selectedPreviousAssessment.fat_percentage,
        change: currentAssessment.fat_percentage - selectedPreviousAssessment.fat_percentage,
        changePercentage: ((currentAssessment.fat_percentage - selectedPreviousAssessment.fat_percentage) / selectedPreviousAssessment.fat_percentage) * 100,
        unit: '%',
        icon: <Target className="h-5 w-5" />,
        color: 'red',
        improvement: currentAssessment.fat_percentage < selectedPreviousAssessment.fat_percentage ? 'positive' : 
                    currentAssessment.fat_percentage > selectedPreviousAssessment.fat_percentage ? 'negative' : 'neutral'
      },
      {
        metric: 'fat_mass',
        label: 'Massa Gorda',
        current: currentAssessment.fat_mass,
        previous: selectedPreviousAssessment.fat_mass,
        change: currentAssessment.fat_mass - selectedPreviousAssessment.fat_mass,
        changePercentage: ((currentAssessment.fat_mass - selectedPreviousAssessment.fat_mass) / selectedPreviousAssessment.fat_mass) * 100,
        unit: 'kg',
        icon: <TrendingDown className="h-5 w-5" />,
        color: 'orange',
        improvement: currentAssessment.fat_mass < selectedPreviousAssessment.fat_mass ? 'positive' : 
                    currentAssessment.fat_mass > selectedPreviousAssessment.fat_mass ? 'negative' : 'neutral'
      },
      {
        metric: 'lean_mass',
        label: 'Massa Magra',
        current: currentAssessment.lean_mass,
        previous: selectedPreviousAssessment.lean_mass,
        change: currentAssessment.lean_mass - selectedPreviousAssessment.lean_mass,
        changePercentage: ((currentAssessment.lean_mass - selectedPreviousAssessment.lean_mass) / selectedPreviousAssessment.lean_mass) * 100,
        unit: 'kg',
        icon: <Activity className="h-5 w-5" />,
        color: 'green',
        improvement: currentAssessment.lean_mass > selectedPreviousAssessment.lean_mass ? 'positive' : 
                    currentAssessment.lean_mass < selectedPreviousAssessment.lean_mass ? 'negative' : 'neutral'
      }
    ];

    setComparisonData(comparisons);
  };

  const getTrendIcon = (change: number, improvement: string) => {
    if (Math.abs(change) < 0.01) return <ArrowRightCircle className="h-5 w-5 text-gray-500" />;
    
    if (improvement === 'positive') {
      return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    } else if (improvement === 'negative') {
      return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
    } else {
      return change > 0 ? 
        <ArrowUpCircle className="h-5 w-5 text-blue-500" /> : 
        <ArrowDownCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = (improvement: string) => {
    switch (improvement) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getOverallProgress = () => {
    if (comparisonData.length === 0) return { score: 0, status: 'neutral', message: 'Sem dados' };
    
    const positiveChanges = comparisonData.filter(d => d.improvement === 'positive').length;
    const totalMetrics = comparisonData.length;
    const score = (positiveChanges / totalMetrics) * 100;
    
    if (score >= 70) return { score, status: 'excellent', message: 'Excelente progresso!' };
    if (score >= 50) return { score, status: 'good', message: 'Bom progresso' };
    if (score >= 30) return { score, status: 'moderate', message: 'Progresso moderado' };
    return { score, status: 'needs_improvement', message: 'Precisa melhorar' };
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardContent className="text-center py-24">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                Carregando comparações...
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Analisando evolução das métricas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (previousAssessments.filter(a => a.id !== currentAssessment.id).length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-red-600/10 rounded-3xl blur-2xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
            <CardHeader className="p-8 bg-gradient-to-r from-yellow-50/50 via-orange-50/50 to-red-50/50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Evolução e Comparações
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Análise temporal e comparações com avaliações anteriores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center py-24">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center shadow-2xl">
                  <Calendar className="h-20 w-20 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse"></div>
              </div>

              <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 dark:from-white dark:via-orange-400 dark:to-white bg-clip-text text-transparent mb-4">
                Primeira Avaliação
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                Esta é a primeira avaliação do aluno. As comparações estarão disponíveis após a próxima avaliação.
              </p>
              <Badge className="px-6 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0 rounded-2xl text-base font-bold shadow-lg dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300">
                <Target className="h-5 w-5 mr-2" />
                Linha de Base Estabelecida
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = getOverallProgress();
  const availableAssessments = previousAssessments.filter(a => a.id !== currentAssessment.id);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com seleção de avaliação */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-green-500/10 rounded-3xl blur-xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
          <CardHeader className="p-8 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-green-900/10 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Evolução e Comparações
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Análise temporal entre avaliações
                  </CardDescription>
                </div>
              </div>
              
              {/* Progress Score */}
              <div className="text-center">
                <div className={`text-4xl font-black ${
                  progress.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                  progress.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                  progress.status === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {progress.score.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{progress.message}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {progress.status === 'excellent' && <Crown className="h-4 w-4 text-yellow-500" />}
                  {progress.status === 'good' && <Trophy className="h-4 w-4 text-blue-500" />}
                  {progress.status === 'moderate' && <Award className="h-4 w-4 text-yellow-500" />}
                  {progress.status === 'needs_improvement' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-base font-bold text-gray-700 dark:text-gray-300 mr-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Comparar com:
              </span>
              {availableAssessments.map((assessment) => (
                <Button
                  key={assessment.id}
                  variant={selectedPreviousAssessment?.id === assessment.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPreviousAssessment(assessment)}
                  className={`rounded-xl font-semibold transition-all duration-300 ${
                    selectedPreviousAssessment?.id === assessment.id 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105' 
                      : 'hover:scale-105'
                  }`}
                >
                  {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparações */}
      {selectedPreviousAssessment && (
        <>
          {/* Cards de Comparação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonData.map((comparison) => (
              <div key={comparison.metric} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  comparison.improvement === 'positive' ? 'from-green-600 to-emerald-600' :
                  comparison.improvement === 'negative' ? 'from-red-600 to-pink-600' :
                  'from-blue-600 to-cyan-600'
                } rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">
                  
                  {/* Animated gradient border */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    comparison.improvement === 'positive' ? 'from-green-500 to-emerald-500' :
                    comparison.improvement === 'negative' ? 'from-red-500 to-pink-500' :
                    'from-blue-500 to-cyan-500'
                  } rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-br ${
                          comparison.improvement === 'positive' ? 'from-green-500 to-emerald-500' :
                          comparison.improvement === 'negative' ? 'from-red-500 to-pink-500' :
                          'from-blue-500 to-cyan-500'
                        } rounded-xl text-white shadow-lg`}>
                          {comparison.icon}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{comparison.label}</span>
                      </div>
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        {getTrendIcon(comparison.change, comparison.improvement)}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Atual</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                          {comparison.current.toFixed(2)}{comparison.unit}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Anterior</span>
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                          {comparison.previous.toFixed(2)}{comparison.unit}
                        </span>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">Variação</span>
                          <div className="text-right">
                            <div className={`text-xl font-black ${getTrendColor(comparison.improvement)}`}>
                              {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(2)}{comparison.unit}
                            </div>
                            <div className={`text-sm font-semibold ${getTrendColor(comparison.improvement)}`}>
                              {comparison.changePercentage > 0 ? '+' : ''}{comparison.changePercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Resumo da Evolução */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
            <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
              <CardHeader className="p-8 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-t-3xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Resumo da Evolução</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Período: {format(new Date(selectedPreviousAssessment.date), 'dd/MM/yyyy', { locale: ptBR })} → {format(new Date(currentAssessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                        {comparisonData.filter(d => d.improvement === 'positive').length}
                      </div>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Métricas Melhoradas</div>
                      <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mt-2" />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-4xl font-black text-red-600 dark:text-red-400 mb-2">
                        {comparisonData.filter(d => d.improvement === 'negative').length}
                      </div>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Métricas Pioradas</div>
                      <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mt-2" />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                      <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
                        {Math.abs(Math.ceil((new Date(currentAssessment.date).getTime() - new Date(selectedPreviousAssessment.date).getTime()) / (1000 * 60 * 60 * 24)))}
                      </div>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Dias de Intervalo</div>
                      <Calendar className="h-6 w-6 text-blue-500 mx-auto mt-2" />
                    </div>
                  </div>
                </div>
                
                {/* Recomendações baseadas na evolução */}
                <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-4 text-lg">Recomendações para Próxima Avaliação</h4>
                      <ul className="space-y-2 text-blue-700 dark:text-blue-400">
                        {comparisonData.filter(d => d.improvement === 'positive').length > comparisonData.filter(d => d.improvement === 'negative').length ? (
                          <>
                            <li className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">Continue com o protocolo atual - resultados positivos!</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="font-medium">Mantenha a consistência no treinamento</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Considere pequenos ajustes para otimizar ainda mais</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">Revisar estratégia de treinamento e nutrição</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-red-500" />
                              <span className="font-medium">Avaliar fatores externos (sono, estresse, hidratação)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">Considerar ajustes no protocolo de avaliação</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AssessmentComparison;