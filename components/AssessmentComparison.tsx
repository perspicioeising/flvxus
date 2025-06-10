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
  AlertTriangle
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
    if (Math.abs(change) < 0.01) return <ArrowRightCircle className="h-4 w-4 text-gray-500" />;
    
    if (improvement === 'positive') {
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    } else if (improvement === 'negative') {
      return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
    } else {
      return change > 0 ? 
        <ArrowUpCircle className="h-4 w-4 text-blue-500" /> : 
        <ArrowDownCircle className="h-4 w-4 text-blue-500" />;
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
      <Card className={`border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl ${className}`}>
        <CardContent className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando comparações...</p>
        </CardContent>
      </Card>
    );
  }

  if (previousAssessments.filter(a => a.id !== currentAssessment.id).length === 0) {
    return (
      <Card className={`border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Evolução e Comparações</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Análise temporal e comparações com avaliações anteriores
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
            Primeira Avaliação
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Esta é a primeira avaliação do aluno. As comparações estarão disponíveis após a próxima avaliação.
          </p>
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600 px-4 py-2">
            🎯 Linha de base estabelecida
          </Badge>
        </CardContent>
      </Card>
    );
  }

  const progress = getOverallProgress();
  const availableAssessments = previousAssessments.filter(a => a.id !== currentAssessment.id);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com seleção de avaliação */}
      <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Evolução e Comparações</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Análise temporal entre avaliações
                </CardDescription>
              </div>
            </div>
            
            {/* Progress Score */}
            <div className="text-center">
              <div className={`text-3xl font-black ${
                progress.status === 'excellent' ? 'text-green-600' :
                progress.status === 'good' ? 'text-blue-600' :
                progress.status === 'moderate' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {progress.score.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{progress.message}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Comparar com:
            </span>
            {availableAssessments.map((assessment) => (
              <Button
                key={assessment.id}
                variant={selectedPreviousAssessment?.id === assessment.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPreviousAssessment(assessment)}
                className="rounded-xl"
              >
                {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparações */}
      {selectedPreviousAssessment && (
        <>
          {/* Cards de Comparação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonData.map((comparison) => (
              <Card key={comparison.metric} className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-br from-${comparison.color}-500 to-${comparison.color}-600 rounded-xl text-white`}>
                        {comparison.icon}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{comparison.label}</span>
                    </div>
                    {getTrendIcon(comparison.change, comparison.improvement)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Atual</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {comparison.current.toFixed(2)}{comparison.unit}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Anterior</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {comparison.previous.toFixed(2)}{comparison.unit}
                      </span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Variação</span>
                        <div className="text-right">
                          <div className={`font-bold ${getTrendColor(comparison.improvement)}`}>
                            {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(2)}{comparison.unit}
                          </div>
                          <div className={`text-xs ${getTrendColor(comparison.improvement)}`}>
                            {comparison.changePercentage > 0 ? '+' : ''}{comparison.changePercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo da Evolução */}
          <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Resumo da Evolução</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Período: {format(new Date(selectedPreviousAssessment.date), 'dd/MM/yyyy', { locale: ptBR })} → {format(new Date(currentAssessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-2">
                    {comparisonData.filter(d => d.improvement === 'positive').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Métricas Melhoradas</div>
                </div>
                
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-black text-red-600 dark:text-red-400 mb-2">
                    {comparisonData.filter(d => d.improvement === 'negative').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Métricas Pioradas</div>
                </div>
                
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2">
                    {Math.abs(new Date(currentAssessment.date).getTime() - new Date(selectedPreviousAssessment.date).getTime()) / (1000 * 60 * 60 * 24)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dias de Intervalo</div>
                </div>
              </div>
              
              {/* Recomendações baseadas na evolução */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Recomendações para Próxima Avaliação</h4>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                      {comparisonData.filter(d => d.improvement === 'positive').length > comparisonData.filter(d => d.improvement === 'negative').length ? (
                        <>
                          <li>• Continue com o protocolo atual - resultados positivos!</li>
                          <li>• Mantenha a consistência no treinamento</li>
                          <li>• Considere pequenos ajustes para otimizar ainda mais</li>
                        </>
                      ) : (
                        <>
                          <li>• Revisar estratégia de treinamento e nutrição</li>
                          <li>• Avaliar fatores externos (sono, estresse, hidratação)</li>
                          <li>• Considerar ajustes no protocolo de avaliação</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AssessmentComparison;