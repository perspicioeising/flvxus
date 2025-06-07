'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  Target,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Zap,
  Award,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Assessment {
  id: string;
  created_at: string;
  weight: number;
  height: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  bmi?: number;
  protocol: string;
  notes?: string;
}

interface ComparisonData {
  metric: string;
  label: string;
  unit: string;
  previous: number;
  current: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  isPositive: boolean;
}

interface AssessmentComparisonProps {
  studentId: string;
  currentAssessment?: Assessment;
}

export default function AssessmentComparison({ studentId, currentAssessment }: AssessmentComparisonProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchAssessments();
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedAssessment && currentAssessment) {
      calculateComparison();
    }
  }, [selectedAssessment, currentAssessment]);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/physical-assessments?student_id=${studentId}`);
      const data = await response.json();
      
      if (response.ok) {
        const sortedAssessments = (data.assessments || []).sort(
          (a: Assessment, b: Assessment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAssessments(sortedAssessments);
        
        // Auto-selecionar a avaliação mais recente se houver
        if (sortedAssessments.length > 0 && !selectedAssessment) {
          setSelectedAssessment(sortedAssessments[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateComparison = () => {
    const previousAssessment = assessments.find(a => a.id === selectedAssessment);
    if (!previousAssessment || !currentAssessment) return;

    const metrics = [
      {
        metric: 'weight',
        label: 'Peso Corporal',
        unit: 'kg',
        isPositiveChange: (change: number) => false // Depende do objetivo
      },
      {
        metric: 'fat_percentage',
        label: '% Gordura Corporal',
        unit: '%',
        isPositiveChange: (change: number) => change < 0 // Diminuir é positivo
      },
      {
        metric: 'fat_mass',
        label: 'Massa Gorda',
        unit: 'kg',
        isPositiveChange: (change: number) => change < 0 // Diminuir é positivo
      },
      {
        metric: 'lean_mass',
        label: 'Massa Magra',
        unit: 'kg',
        isPositiveChange: (change: number) => change > 0 // Aumentar é positivo
      },
      {
        metric: 'bmi',
        label: 'IMC',
        unit: '',
        isPositiveChange: (change: number) => Math.abs(change) < 0.5 // Estabilidade é positiva
      }
    ];

    const comparisons: ComparisonData[] = metrics.map(metric => {
      const previous = (previousAssessment as any)[metric.metric] || 0;
      const current = (currentAssessment as any)[metric.metric] || 0;
      const change = current - previous;
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(change) > 0.1) {
        trend = change > 0 ? 'up' : 'down';
      }

      return {
        metric: metric.metric,
        label: metric.label,
        unit: metric.unit,
        previous,
        current,
        change,
        changePercent,
        trend,
        isPositive: metric.isPositiveChange(change)
      };
    }).filter(comp => comp.previous !== 0 && comp.current !== 0);

    setComparisonData(comparisons);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', isPositive: boolean) => {
    const iconClass = `h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`;
    
    switch (trend) {
      case 'up':
        return isPositive ? 
          <ArrowUpRight className={iconClass} /> : 
          <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'down':
        return isPositive ? 
          <ArrowDownRight className="h-4 w-4 text-green-500" /> : 
          <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Equal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressColor = (isPositive: boolean, trend: 'up' | 'down' | 'stable') => {
    if (trend === 'stable') return 'from-gray-100 to-gray-200 text-gray-800';
    return isPositive 
      ? 'from-green-100 to-emerald-100 text-green-800 border-green-300'
      : 'from-red-100 to-pink-100 text-red-800 border-red-300';
  };

  const generateInsights = () => {
    if (comparisonData.length === 0) return [];

    const insights = [];
    const positiveChanges = comparisonData.filter(d => d.isPositive).length;
    const totalChanges = comparisonData.length;

    // Insight geral
    if (positiveChanges > totalChanges / 2) {
      insights.push({
        type: 'success',
        title: 'Evolução Positiva',
        message: `${positiveChanges} de ${totalChanges} métricas mostraram evolução favorável.`,
        icon: <Award className="h-5 w-5" />
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Atenção aos Resultados',
        message: `Apenas ${positiveChanges} de ${totalChanges} métricas evoluíram favoravelmente.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }

    // Insights específicos
    const weightChange = comparisonData.find(d => d.metric === 'weight');
    const fatChange = comparisonData.find(d => d.metric === 'fat_percentage');
    const leanChange = comparisonData.find(d => d.metric === 'lean_mass');

    if (fatChange && fatChange.change < -1) {
      insights.push({
        type: 'success',
        title: 'Redução de Gordura Significativa',
        message: `Redução de ${Math.abs(fatChange.change).toFixed(1)}% na gordura corporal.`,
        icon: <TrendingDown className="h-5 w-5" />
      });
    }

    if (leanChange && leanChange.change > 0.5) {
      insights.push({
        type: 'success',
        title: 'Ganho de Massa Magra',
        message: `Aumento de ${leanChange.change.toFixed(1)}kg na massa magra.`,
        icon: <TrendingUp className="h-5 w-5" />
      });
    }

    if (weightChange && fatChange && weightChange.change < 0 && fatChange.change < 0) {
      insights.push({
        type: 'success',
        title: 'Perda de Peso Saudável',
        message: 'Perda de peso com redução prioritária da gordura corporal.',
        icon: <Target className="h-5 w-5" />
      });
    }

    return insights;
  };

  const prepareChartData = () => {
    const allAssessments = [...assessments];
    if (currentAssessment) {
      allAssessments.push(currentAssessment);
    }

    return allAssessments
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(assessment => ({
        date: format(new Date(assessment.created_at), 'dd/MM', { locale: ptBR }),
        fullDate: format(new Date(assessment.created_at), 'PPP', { locale: ptBR }),
        peso: assessment.weight,
        gordura: assessment.fat_percentage,
        massaMagra: assessment.lean_mass,
        imc: assessment.bmi || 0
      }));
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando histórico de avaliações...</p>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Primeira Avaliação
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Esta é a primeira avaliação deste aluno. As comparações estarão disponíveis nas próximas avaliações.
          </p>
        </CardContent>
      </Card>
    );
  }

  const insights = generateInsights();
  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      {/* Seletor de Avaliação para Comparação */}
      <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Análise Comparativa</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Compare os resultados com avaliações anteriores
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium">Comparar com:</label>
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="w-[300px] h-12 bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg">
                <SelectValue placeholder="Selecione uma avaliação anterior" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assessment.protocol} • {assessment.weight}kg
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Métricas de Comparação */}
          {comparisonData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonData.map((data) => (
                <div key={data.metric} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {data.label}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(data.trend, data.isPositive)}
                        <span className={`text-sm font-semibold ${
                          data.isPositive ? 'text-green-600 dark:text-green-400' : 
                          data.trend === 'stable' ? 'text-gray-600 dark:text-gray-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {data.change > 0 ? '+' : ''}{data.change.toFixed(1)} {data.unit}
                        </span>
                      </div>
                    </div>
                    <Badge className={`px-2 py-1 text-xs bg-gradient-to-r ${getProgressColor(data.isPositive, data.trend)}`}>
                      {Math.abs(data.changePercent).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Anterior:</span>
                      <span className="font-medium">{data.previous.toFixed(1)} {data.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atual:</span>
                      <span className="font-medium">{data.current.toFixed(1)} {data.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights da IA */}
      {insights.length > 0 && (
        <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Insights Inteligentes</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Análise automática dos resultados
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  insight.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'success' 
                        ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400' 
                        : 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {insight.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        insight.type === 'success' 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {insight.title}
                      </h4>
                      <p className={`text-sm ${
                        insight.type === 'success' 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Evolução */}
      {chartData.length > 1 && (
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Evolução Temporal</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Histórico completo de {chartData.length} avaliações
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Gráfico de Linha - Composição Corporal */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Composição Corporal ao Longo do Tempo
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any, name: string) => [
                          `${Number(value).toFixed(1)}${name === 'gordura' ? '%' : 'kg'}`,
                          name === 'gordura' ? '% Gordura' : 
                          name === 'massaMagra' ? 'Massa Magra' : 
                          name === 'peso' ? 'Peso' : 'IMC'
                        ]}
                        labelFormatter={(label: string) => `Data: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="gordura" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="massaMagra" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legenda */}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Peso (kg)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">% Gordura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Massa Magra (kg)</span>
                  </div>
                </div>
              </div>

              {/* Gráfico de Barras - IMC */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Evolução do Índice de Massa Corporal (IMC)
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any) => [`${Number(value).toFixed(1)}`, 'IMC']}
                        labelFormatter={(label: string) => `Data: ${label}`}
                      />
                      <Bar 
                        dataKey="imc" 
                        fill="#8B5CF6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}