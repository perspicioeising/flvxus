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
  AlertTriangle,
  User,
  Scale,
  Percent,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { number, string } from "zod";

interface Assessment {
  [x: string]: any;
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
  student_id: string;
  age?: number;
  gender?: string;
  goals?: string[];
  body_density?: number;
  
  // Dobras cutâneas
  triceps?: number;
  subscapular?: number;
  biceps?: number;
  chest?: number;
  midaxillary?: number;
  suprailiac?: number;
  abdominal?: number;
  thigh?: number;
  
  // Circunferências
  neck?: number;
  shoulders?: number;
  waist?: number;
  abdomen?: number;
  hips?: number;
  left_arm?: number;
  right_arm?: number;
  left_thigh?: number;
  right_thigh?: number;
  left_calf?: number;
  right_calf?: number;
  
  // Medições flexíveis (JSONB)
  measurements?: Record<string, any>;
}
  height: number;
  fat_percentage: number;
  fat_mass: number;
  lean_mass: number;
  protocol: string;
  student_id: string;

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

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function AssessmentDetailsPage({ params }: PageProps) {
  const assessmentId = params.id;
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (currentAssessment) {
      // Verificar diferentes formas de obter o student_id
      const studentId = currentAssessment.student_id || currentAssessment.student?.id;
      console.log('Student ID encontrado:', studentId);
      console.log('Current assessment completa:', currentAssessment);
      
      if (studentId) {
        fetchAllAssessments(studentId);
      } else {
        console.warn('Student ID não encontrado na avaliação');
      }
    }
  }, [currentAssessment]);

  useEffect(() => {
    if (selectedAssessment && currentAssessment) {
      calculateComparison();
    }
  }, [selectedAssessment, currentAssessment, allAssessments]);

  const fetchCurrentAssessment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Buscando avaliação com ID:', assessmentId);
      const response = await fetch(`/api/physical-assessments/${assessmentId}`);
      
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      // A API retorna a avaliação diretamente, não dentro de um objeto 'assessment'
      if (data && data.id) {
        setCurrentAssessment(data);
        console.log('Avaliação carregada com sucesso:', data.id);
      } else {
        throw new Error('Dados da avaliação inválidos');
      }
    } catch (error) {
      console.error('Erro ao buscar avaliação atual:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAssessments = async (studentId: string) => {
    try {
      console.log('Buscando outras avaliações para o aluno:', studentId);
      const response = await fetch(`/api/physical-assessments?student_id=${studentId}`);
      
      if (!response.ok) {
        console.warn('Erro ao buscar outras avaliações:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('Dados de outras avaliações:', data);
      
      // Verificar se a resposta tem o formato esperado
      const assessments = data.assessments || data || [];
      
      if (Array.isArray(assessments)) {
        // Filtrar a avaliação atual e ordenar por data
        const otherAssessments = assessments
          .filter((assessment: Assessment) => assessment.id !== assessmentId)
          .sort((a: Assessment, b: Assessment) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        
        console.log(`Encontradas ${otherAssessments.length} outras avaliações`);
        setAllAssessments(otherAssessments);
        
        // Auto-selecionar a avaliação mais recente se houver
        if (otherAssessments.length > 0) {
          setSelectedAssessment(otherAssessments[0].id);
          console.log('Auto-selecionando avaliação:', otherAssessments[0].id);
        }
      } else {
        console.log('Nenhuma outra avaliação encontrada');
        setAllAssessments([]);
      }
    } catch (error) {
      console.error('Erro ao buscar outras avaliações:', error);
      setAllAssessments([]);
    }
  };

  const calculateComparison = () => {
    const previousAssessment = allAssessments.find(a => a.id === selectedAssessment);
    if (!previousAssessment || !currentAssessment) return;

    const metrics = [
      {
        metric: 'weight',
        label: 'Peso Corporal',
        unit: 'kg',
        isPositiveChange: (change: number) => Math.abs(change) < 1 // Estabilidade é boa
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
        return <ArrowUpRight className={iconClass} />;
      case 'down':
        return <ArrowDownRight className={iconClass} />;
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

    return insights;
  };

  const prepareChartData = () => {
    const allData = [currentAssessment, ...allAssessments]
      .filter(Boolean)
      .sort((a, b) => new Date(a!.created_at).getTime() - new Date(b!.created_at).getTime())
      .map(assessment => ({
        date: format(new Date(assessment!.created_at), 'dd/MM', { locale: ptBR }),
        fullDate: format(new Date(assessment!.created_at), 'PPP', { locale: ptBR }),
        peso: assessment!.weight,
        gordura: assessment!.fat_percentage,
        massaMagra: assessment!.lean_mass,
        imc: assessment!.bmi || 0
      }));

    return allData;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando detalhes da avaliação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !currentAssessment) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-0 bg-red-50 dark:bg-red-900/20 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
              Erro ao Carregar Avaliação
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error || 'Avaliação não encontrada'}
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const insights = generateInsights();
  const chartData = prepareChartData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com detalhes da avaliação atual */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Detalhes da Avaliação Física
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  {format(new Date(currentAssessment.created_at), 'PPPp', { locale: ptBR })}
                </p>
              </div>
            </div>
            <Badge className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-300">
              {currentAssessment.protocol}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Informações Básicas */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Dados Básicos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Peso</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.weight.toFixed(1)} kg
                </p>
              </div>
              
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Altura</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.height.toFixed(0)} cm
                </p>
              </div>
              
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Idade</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.age || 'N/A'} anos
                </p>
              </div>
              
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Gênero</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.gender === 'male' ? 'M' : currentAssessment.gender === 'female' ? 'F' : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Resultados Calculados */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Resultados da Composição Corporal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">% Gordura</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.fat_percentage?.toFixed(1) || 'N/A'}%
                </p>
              </div>
              
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Massa Gorda</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.fat_mass?.toFixed(1) || 'N/A'} kg
                </p>
              </div>
              
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Massa Magra</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.lean_mass?.toFixed(1) || 'N/A'} kg
                </p>
              </div>
              
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">IMC</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(currentAssessment.bmi || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Dobras Cutâneas (se existirem) */}
          {(currentAssessment.triceps || currentAssessment.subscapular || currentAssessment.biceps || 
            currentAssessment.chest || currentAssessment.midaxillary || currentAssessment.suprailiac || 
            currentAssessment.abdominal || currentAssessment.thigh) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Dobras Cutâneas (mm)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentAssessment.triceps && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Tríceps</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.triceps.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.subscapular && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Subescapular</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.subscapular.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.biceps && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Bíceps</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.biceps.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.chest && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Peitoral</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.chest.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.midaxillary && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Axilar Média</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.midaxillary.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.suprailiac && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Supra-ilíaca</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.suprailiac.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.abdominal && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Abdominal</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.abdominal.toFixed(1)} mm
                    </p>
                  </div>
                )}
                {currentAssessment.thigh && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Coxa</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.thigh.toFixed(1)} mm
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Circunferências (se existirem) */}
          {(currentAssessment.neck || currentAssessment.shoulders || currentAssessment.waist || 
            currentAssessment.abdomen || currentAssessment.hips || currentAssessment.left_arm || 
            currentAssessment.right_arm || currentAssessment.left_thigh || currentAssessment.right_thigh || 
            currentAssessment.left_calf || currentAssessment.right_calf) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Circunferências (cm)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentAssessment.neck && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Pescoço</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.neck.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.shoulders && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Ombros</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.shoulders.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.waist && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Cintura</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.waist.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.abdomen && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Abdômen</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.abdomen.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.hips && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Quadril</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.hips.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.left_arm && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Braço Esq.</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.left_arm.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.right_arm && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Braço Dir.</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.right_arm.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.left_thigh && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Coxa Esq.</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.left_thigh.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.right_thigh && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Coxa Dir.</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.right_thigh.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.left_calf && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Panturr. Esq.</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.left_calf.toFixed(1)} cm
                    </p>
                  </div>
                )}
                {currentAssessment.right_calf && (
                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Panturr. Dir.</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentAssessment.right_calf.toFixed(1)} cm
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Densidade Corporal */}
          {currentAssessment.body_density && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Densidade Corporal
              </h3>
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Densidade</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentAssessment.body_density.toFixed(4)} g/ml
                </p>
              </div>
            </div>
          )}

          {/* Objetivos */}
          {currentAssessment.goals && currentAssessment.goals.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Objetivos do Aluno
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentAssessment.goals.map((goal: string, index: number) => (
                  <Badge
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 border-green-300"
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {currentAssessment.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Observações
              </h3>
              <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentAssessment.notes}
                </p>
              </div>
            </div>
          )}

          {/* Medições Adicionais do Campo measurements (JSONB) */}
          {currentAssessment.measurements && Object.keys(currentAssessment.measurements).length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Medições Adicionais
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(currentAssessment.measurements).map(([key, value]) => (
                  <div key={key} className="p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {typeof value === 'number' ? value.toFixed(1) : value}
                      {typeof value === 'number' ? (key.includes('dobra') || key.includes('skinfold') ? ' mm' : ' cm') : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Seção de Comparação - apenas se existirem outras avaliações */}
      {allAssessments.length > 0 && (
        <>
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
                    Compare com {allAssessments.length} avaliações anteriores
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
                    {allAssessments.map((assessment) => (
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
        </>
      )}

      {/* Se não há outras avaliações, mostrar apenas um card informativo */}
      {allAssessments.length === 0 && (
        <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Primeira Avaliação Registrada
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Esta é a primeira avaliação deste aluno. As comparações e gráficos de evolução estarão disponíveis nas próximas avaliações.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={() => window.history.back()} 
          variant="outline"
          className="px-6 py-2"
        >
          Voltar
        </Button>
        <Button 
          onClick={() => window.print()} 
          className="px-6 py-2"
        >
          Imprimir Relatório
        </Button>
      </div>
    </div>
  );
}