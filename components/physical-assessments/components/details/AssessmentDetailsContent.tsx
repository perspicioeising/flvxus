// components/physical-assessments/components/details/AssessmentDetailsContent.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Ruler,
  Brain,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Scale,
  BarChart3,
  Weight,
  Activity,
  Calculator,
  PieChart,
  Star,
  Award,
  CheckCircle2,
  Info,
  Sparkles,
  Target,
  Heart,
  Zap,
  Calendar,
  Crown,
  ListCollapse,
  Expand,
  User,
  Droplets,
  Flame,
  Shield,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { AssessmentComparison } from '../comparacao/assessmentComparison';
import AssessmentAIAnalysis from '@/components/AssessmentAIAnalysis';

interface AssessmentDetailsContentProps {
  assessment: any;
  classification: any;
}

export function AssessmentDetailsContent({ assessment, classification }: AssessmentDetailsContentProps) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    measurements: false,
    analysis: false,
    info: false,
    comparison: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Função auxiliar para garantir que temos um número válido
  const ensureNumber = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return 0;
    const stringValue = String(value).trim();
    if (stringValue === '') return 0;
    const num = Number(stringValue);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const formatNumber = (value: unknown, decimals: number = 2): string => {
    const num = ensureNumber(value);
    return num.toFixed(decimals);
  };

  // DEBUG: Verificar dados da IA
  console.log('=== DEBUG ASSESSMENT DETAILS ===');
  console.log('Assessment ID:', assessment.id);
  console.log('AI Analysis (raw):', assessment.ai_analysis);
  console.log('AI Recommendations (raw):', assessment.ai_recommendations);
  console.log('Type AI Analysis:', typeof assessment.ai_analysis);
  console.log('Type AI Recommendations:', typeof assessment.ai_recommendations);

  // Configuração das métricas principais
  const metrics = [
    {
      value: assessment.bmi,
      label: "IMC",
      color: 'from-app-achievement-workout to-app-btn-primary',
      icon: Scale,
      progress: Math.min((ensureNumber(assessment.bmi) / 35) * 100, 100),
      suffix: "",
      description: "Índice de Massa Corporal",
      idealRange: "18.5 - 24.9"
    },
    {
      value: assessment.fat_percentage,
      label: "% Gordura",
      color: 'from-app-achievement-workout to-app-btn-secondary',
      icon: BarChart3,
      progress: Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100),
      suffix: "%",
      description: "Percentual de gordura",
      idealRange: assessment.gender === 'male' ? "10-15%" : "16-24%"
    },
    {
      value: assessment.fat_mass,
      label: "Massa Gorda",
      color: 'from-app-achievement-workout to-app-text-accent',
      icon: Weight,
      progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.fat_mass) / ensureNumber(assessment.weight)) * 100 : 0,
      suffix: "kg",
      description: "Peso total de gordura",
      idealRange: "Variável"
    },
    {
      value: assessment.lean_mass,
      label: "Massa Magra",
      color: 'from-app-achievement-workout to-app-btn-accent',
      icon: Activity,
      progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.lean_mass) / ensureNumber(assessment.weight)) * 100 : 0,
      suffix: "kg",
      description: "Peso de músculos e ossos",
      idealRange: "Máximo possível"
    }
  ];

  const MEASUREMENT_LABELS: Record<string, string> = {
    neck: 'Pescoço',
    shoulders: 'Ombros',
    chest: 'Peito',
    chest_circ: 'Circunf. Peitoral',
    waist: 'Cintura',
    abdomen: 'Abdômen',
    hips: 'Quadril',
    left_arm: 'Braço Esquerdo',
    right_arm: 'Braço Direito',
    left_thigh: 'Coxa Esquerda',
    right_thigh: 'Coxa Direita',
    left_calf: 'Panturrilha Esquerda',
    right_calf: 'Panturrilha Direita',
    triceps: 'Tríceps',
    biceps: 'Bíceps',
    subscapular: 'Subescapular',
    abdominal: 'Abdominal',
    suprailiac: 'Supra-ilíaca',
    midaxillary: 'Axilar Média',
    thigh: 'Coxa'
  };

  // Filtrar medidas válidas
  const validMeasurements = Object.entries(assessment.measurements || {}).filter(([_, value]) => ensureNumber(value) > 0);

  // Separar circunferências e dobras cutâneas
  const circumferences = validMeasurements.filter(([key]) =>
    ['neck', 'shoulders', 'chest', 'chest_circ', 'waist', 'abdomen', 'hips', 'left_arm', 'right_arm', 'left_thigh', 'right_thigh', 'left_calf', 'right_calf'].includes(key)
  );

  const skinFolds = validMeasurements.filter(([key]) =>
    ['triceps', 'biceps', 'subscapular', 'abdominal', 'suprailiac', 'midaxillary', 'thigh'].includes(key)
  );

  // Verificar se há dados de IA válidos
  const hasAIData = assessment.ai_analysis || assessment.ai_recommendations;
  console.log('=== HAS AI DATA ===', hasAIData);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Visão Geral Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-text-accent/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Card className="relative border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Visão Geral
                </CardTitle>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('overview')}
                className="h-8 w-8 p-0 sm:hidden"
              >
                {expandedSections.overview ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {(expandedSections.overview || window.innerWidth >= 640) && (
            <CardContent>
              {/* Main Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  const validValue = ensureNumber(metric.value);
                  const displayValue = metric.suffix === '%' ? formatNumber(validValue, 1) :
                    metric.suffix === 'kg' ? formatNumber(validValue, 1) :
                      formatNumber(validValue, 1);

                  return (
                    <div key={index} className="relative group">
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>

                      {/* Card */}
                      <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute inset-0 bg-gradient-to-br from-app-text-primary to-transparent"></div>
                        </div>

                        <CardContent className="relative p-4 sm:p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                                {metric.label}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-black text-app-heading">
                                  {displayValue}
                                </span>
                                <span className="text-lg sm:text-xl font-semibold text-app-text-secondary">
                                  {metric.suffix}
                                </span>
                              </div>
                              <p className="text-xs text-app-text-muted mt-1">
                                Ideal: {metric.idealRange}
                              </p>
                            </div>

                            {/* Icon */}
                            <div className={`relative p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-app-medium group-hover:shadow-app-large transition-all duration-300`}>
                              <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <Progress
                              value={metric.progress}
                              className="h-2 bg-app-bg-secondary"
                            />
                            <p className="text-xs text-app-text-muted">
                              {metric.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Body Composition Chart */}
              <div className="relative">
                <div className="p-6 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-workout/10 to-app-bg-secondary/30 rounded-2xl border border-app-border-muted shadow-app-medium">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="p-3 bg-app-achievement-workout rounded-xl shadow-app-large">
                        <PieChart className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="h-2 w-2 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-app-heading">
                        Composição Corporal
                      </h3>
                      <p className="text-app-text-secondary">
                        Distribuição de massa corporal
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Classification */}
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-app-bg-secondary to-app-border-muted"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-black text-app-heading">
                              {formatNumber(assessment.fat_percentage, 1)}%
                            </div>
                            <div className="text-xs text-app-text-secondary font-semibold">
                              Gordura
                            </div>
                          </div>
                        </div>
                      </div>

                      <Badge className={`px-3 py-1 bg-gradient-to-r ${classification.colorClass} text-white rounded-full text-sm font-bold border-0 shadow-app-medium`}>
                        <Crown className="h-3 w-3 mr-1" />
                        {classification.classification}
                      </Badge>
                    </div>

                    {/* Extended Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                        <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-app-achievement-workout" />
                          Massa Gorda:
                        </span>
                        <span className="text-sm font-bold text-app-heading">{formatNumber(assessment.fat_mass, 1)}kg</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                        <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                          <Flame className="h-4 w-4 text-app-achievement-workout" />
                          Massa Magra:
                        </span>
                        <span className="text-sm font-bold text-app-heading">{formatNumber(assessment.lean_mass, 1)}kg</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                        <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                          <Scale className="h-4 w-4 text-app-achievement-workout" />
                          Peso Total:
                        </span>
                        <span className="text-sm font-bold text-app-heading">{formatNumber(assessment.weight, 1)}kg</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
                        <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                          <Activity className="h-4 w-4 text-app-achievement-workout" />
                          Densidade Corporal:
                        </span>
                        <span className="text-sm font-bold text-app-heading">{formatNumber(assessment.body_density, 4)}g/ml</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Health Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                  <h4 className="font-bold text-app-heading mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-app-achievement-workout" />
                    Perfil de Saúde
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-app-text-secondary">Idade:</span>
                      <span className="text-sm font-semibold text-app-heading">{assessment.age} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-app-text-secondary">Altura:</span>
                      <span className="text-sm font-semibold text-app-heading">{assessment.height}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-app-text-secondary">Gênero:</span>
                      <span className="text-sm font-semibold text-app-heading">
                        {assessment.gender === 'male' ? 'Masculino' : 'Feminino'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                  <h4 className="font-bold text-app-heading mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-app-achievement-workout" />
                    Dados Técnicos
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-app-text-secondary">Protocolo:</span>
                      <span className="text-sm font-semibold text-app-heading">
                        {assessment.protocol || 'Padrão'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-app-text-secondary">Precisão:</span>
                      <span className="text-sm font-semibold text-app-heading">
                        {assessment.accuracy_estimate || '±3%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-app-text-secondary">Cálculos:</span>
                      <span className="text-sm font-semibold text-app-heading">
                        {assessment.calculations_used || 'Automático'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Measurements Section */}
      {validMeasurements.length > 0 && (
        <Card className="border-0 card-app">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                  <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                  Medidas Corporais
                </CardTitle>
                <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-xs">
                  {validMeasurements.length}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('measurements')}
                className="h-8 w-8 p-0"
              >
                {expandedSections.measurements ? (
                  <ListCollapse className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {expandedSections.measurements && (
            <CardContent>
              {/* Circumferences Section */}
              {circumferences.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-app-achievement-workout" />
                    <h4 className="text-lg font-bold text-app-heading">
                      Circunferências ({circumferences.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {circumferences.map(([key, value], index) => (
                      <MeasurementCard
                        key={key}
                        label={MEASUREMENT_LABELS[key] || key}
                        value={formatNumber(value, 1)}
                        unit="cm"
                        color="from-app-achievement-workout to-app-btn-primary"
                        icon={Activity}
                        delay={index * 50}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Skin Folds Section */}
              {skinFolds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-app-achievement-workout" />
                    <h4 className="text-lg font-bold text-app-heading">
                      Dobras Cutâneas ({skinFolds.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {skinFolds.map(([key, value], index) => (
                      <MeasurementCard
                        key={key}
                        label={MEASUREMENT_LABELS[key] || key}
                        value={formatNumber(value, 1)}
                        unit="mm"
                        color="from-app-achievement-workout to-app-btn-secondary"
                        icon={Target}
                        delay={index * 50}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* AI Analysis Section - CORRIGIDO COM OS DADOS CORRETOS */}
      <Card className="border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Análise IA
              </CardTitle>
              <Badge className="px-2 py-1 bg-purple-100 text-purple-600 border border-purple-200 rounded-full text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {hasAIData ? 'Disponível' : 'Não disponível'}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('analysis')}
              className="h-8 w-8 p-0"
            >
              {expandedSections.analysis ? (
                <ListCollapse className="h-4 w-4" />
              ) : (
                <Expand className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {expandedSections.analysis && (
          <CardContent>
            {/* CORREÇÃO: Passar os dados corretos para o componente */}
            <AssessmentAIAnalysis
              aiAnalysis={assessment.ai_analysis}
              aiRecommendations={assessment.ai_recommendations}
              mode="view"
              assessmentData={{
                weight: assessment.weight,
                height: assessment.height,
                age: assessment.age,
                gender: assessment.gender,
                bmi: assessment.bmi,
                fatPercentage: assessment.fat_percentage,
                fatMass: assessment.fat_mass,
                leanMass: assessment.lean_mass,
                protocol: assessment.protocol
              }}
              studentInfo={{
                name: assessment.profiles?.full_name || 'N/A',
                goals: assessment.profiles?.goals || []
              }}
            />
          </CardContent>
        )}
      </Card>

      {/* Comparison/Evolution Section */}
      <Card className="border-0 card-app">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Evolução
              </CardTitle>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('comparison')}
              className="h-8 w-8 p-0"
            >
              {expandedSections.comparison ? (
                <ListCollapse className="h-4 w-4" />
              ) : (
                <Expand className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {expandedSections.comparison && (
          <CardContent>
            <AssessmentComparison
              currentAssessment={assessment}
              studentId={assessment.student_id}
              className="enhanced-ui"
            />
          </CardContent>
        )}
      </Card>

      {/* Protocol Information */}
      <Card className="border-0 card-app">
         <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                Informações do Protocolo
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('info')}
              className="h-8 w-8 p-0"
            >
              {expandedSections.info ? (
                <ListCollapse className="h-4 w-4" />
              ) : (
                <Expand className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
{expandedSections.info && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-lg shadow-app-medium">
                  <Calculator className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-text-secondary mb-1 text-sm">
                    Protocolo Utilizado
                  </div>
                  <div className="text-app-heading font-semibold">
                    {assessment.protocol || 'Protocolo Padrão'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-btn-secondary rounded-lg shadow-app-medium">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-text-secondary mb-1 text-sm">
                    Precisão Estimada
                  </div>
                  <div className="text-app-heading font-semibold">
                    {assessment.accuracy_estimate || 'Não especificada'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted shadow-app-medium">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-app-achievement-workout to-app-btn-accent rounded-lg shadow-app-medium">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-text-secondary mb-1 text-sm">
                    Data da Avaliação
                  </div>
                  <div className="text-app-heading font-semibold">
                    {new Date(assessment.date).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Protocol Info */}
          {assessment.notes && (
            <div className="mt-6 p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-app-achievement-workout rounded-lg">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-app-heading mb-2">Observações da Avaliação</h4>
                  <p className="text-sm text-app-text-primary leading-relaxed">
                    {assessment.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-app-achievement-workout" />
              <h4 className="font-bold text-app-heading">Timeline da Avaliação</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-app-text-secondary">Criada em:</span>
                <span className="font-semibold text-app-heading">
                  {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {assessment.updated_at !== assessment.created_at && (
                <div className="flex justify-between">
                  <span className="text-app-text-secondary">Atualizada em:</span>
                  <span className="font-semibold text-app-heading">
                    {new Date(assessment.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
         )}
      </Card>

      {/* Empty State for missing sections */}
      {!hasAIData && validMeasurements.length === 0 && (
        <Card className="border-0 card-app">
          <CardContent className="text-center py-12 sm:py-16">
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
                <Info className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-app-heading mb-2">
              Dados Complementares Não Disponíveis
            </h3>
            <p className="text-app-text-secondary max-w-md mx-auto leading-relaxed">
              Esta avaliação contém apenas os dados básicos. Medidas detalhadas e análise IA não foram realizadas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Action Cards - Mobile Only */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <Button
          onClick={() => window.navigator.share?.({
            title: `Avaliação Física: ${assessment.profiles.full_name}`,
            text: `Avaliação realizada em ${new Date(assessment.date).toLocaleDateString('pt-BR')}`,
            url: window.location.href,
          })}
          variant="outline"
          className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>

        <Button
          onClick={() => {
            const assessmentData = {
              student: assessment.profiles.full_name,
              date: assessment.date,
              bmi: assessment.bmi,
              fat_percentage: assessment.fat_percentage,
              fat_mass: assessment.fat_mass,
              lean_mass: assessment.lean_mass
            };
            const dataStr = JSON.stringify(assessmentData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `avaliacao-${assessment.profiles.full_name.toLowerCase().replace(/\s+/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          variant="outline"
          className="h-12 bg-app-card border-app-border-muted text-app-text-primary rounded-xl"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
}

// Componente MeasurementCard
function MeasurementCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
  delay
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: any;
  delay: number;
}) {
  return (
    <div
      className="group relative animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>

      {/* Card Content */}
      <div className="relative p-4 bg-app-card backdrop-blur-sm rounded-xl border border-app-border-accent shadow-app-medium transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-app-large overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${color}`}></div>
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-app-text-secondary text-sm truncate flex-1">
              {label}
            </div>
            <div className={`p-1.5 bg-gradient-to-br ${color} rounded-lg ml-2`}>
              <Icon className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-app-heading">
              {value}
            </span>
            <span className="text-sm font-semibold text-app-text-secondary">
              {unit}
            </span>
          </div>

          {/* Decorative Element */}
          <div className={`absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br ${color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
        </div>
      </div>
    </div>
  );
}