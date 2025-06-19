'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
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
  TrendingUp,
  Heart,
  Zap,
  Calendar
} from "lucide-react";
import { AssessmentOverviewProps, MetricCard, PROTOCOLS } from '@/components/physical-assessments/types/physical-assessment-details';

export function AssessmentOverview({ assessment, classification }: AssessmentOverviewProps) {

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

  // Configuração das métricas principais
  const metrics: MetricCard[] = [
    {
      value: assessment.bmi,
      label: "IMC",
      color: 'from-indigo-500 to-indigo-600',
      icon: Scale,
      progress: Math.min((ensureNumber(assessment.bmi) / 35) * 100, 100),
      suffix: "",
      description: "Índice de Massa Corporal"
    },
    {
      value: assessment.fat_percentage,
      label: "% Gordura",
      color: 'from-blue-500 to-indigo-600',
      icon: BarChart3,
      progress: Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100),
      suffix: "%",
      description: "Percentual de gordura corporal"
    },
    {
      value: assessment.fat_mass,
      label: "Massa Gorda",
      color: 'from-purple-500 to-indigo-600',
      icon: Weight,
      progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.fat_mass) / ensureNumber(assessment.weight)) * 100 : 0,
      suffix: "kg",
      description: "Peso total de gordura"
    },
    {
      value: assessment.lean_mass,
      label: "Massa Magra",
      color: 'from-teal-500 to-indigo-600',
      icon: Activity,
      progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.lean_mass) / ensureNumber(assessment.weight)) * 100 : 0,
      suffix: "kg",
      description: "Peso de músculos e ossos"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {metrics.map((metric, index) => (
          <MetricCardComponent key={index} metric={metric} />
        ))}
      </div>

      {/* Body Composition Section */}
      <BodyCompositionSection assessment={assessment} classification={classification} />

      {/* Protocol Information */}
      <ProtocolInformationSection assessment={assessment} />

      {/* Notes Section
      {assessment.notes && <NotesSection notes={assessment.notes} />} */}
    </div>
  );
}

// Componente do Card de Métrica
function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon;
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

  const validValue = ensureNumber(metric.value);
  const displayValue = metric.suffix === '%' ? formatNumber(validValue, 1) :
    metric.suffix === 'kg' ? formatNumber(validValue, 1) :
      formatNumber(validValue, 1);

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>

      {/* Card */}
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent"></div>
        </div>

        <CardContent className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {displayValue}
                </span>
                <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                  {metric.suffix}
                </span>
              </div>
            </div>

            {/* Icon */}
            <div className={`relative p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
              <Icon className="h-6 w-6 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={metric.progress}
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {metric.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente da Seção de Composição Corporal
function BodyCompositionSection({ assessment, classification }: { assessment: AssessmentOverviewProps['assessment'], classification: AssessmentOverviewProps['classification'] }) {
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

  const fatPercentage = ensureNumber(assessment.fat_percentage);
  const leanPercentage = 100 - fatPercentage;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <PieChart className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Star className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Composição Corporal
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Análise detalhada da distribuição de massa
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visual Chart */}
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64">
                {/* Background Circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"></div>

                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke="url(#gradient-fat)"
                    strokeWidth="40"
                    fill="none"
                    strokeDasharray={`${fatPercentage * 6.28} 628`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient-fat" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f97316" />

                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-black text-gray-900 dark:text-white">
                      {formatNumber(fatPercentage, 1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mt-1">
                      Gordura
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg"></div>
                  <span className="text-sm font-semibold">
                    Massa Gorda: {formatNumber(assessment.fat_mass, 1)}kg ({formatNumber(fatPercentage, 1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"></div>
                  <span className="text-sm font-semibold">
                    Massa Magra: {formatNumber(assessment.lean_mass, 1)}kg ({formatNumber(leanPercentage, 1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Reference Cards */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-indigo-600" />
                Indicadores de Referência
              </h4>

              {/* BMI Card */}
              <ReferenceCard
                title="IMC"
                value={formatNumber(assessment.bmi, 1)}
                reference="Normal: 18.5-24.9"
                progress={Math.min((ensureNumber(assessment.bmi) / 30) * 100, 100)}
                gradient="from-blue-500 to-indigo-500"
              />

              {/* Fat Percentage Card */}
              <ReferenceCard
                title="% Gordura"
                value={`${formatNumber(assessment.fat_percentage, 1)}%`}
                reference={assessment.gender === 'male' ? 'Ideal: 10-15%' : 'Ideal: 16-24%'}
                progress={Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100)}
                gradient="from-purple-500 to-pink-500"
              />

              {/* Classification Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Classificação</span>
                    <Badge className={`${classification.colorClass} px-3 py-1 font-semibold`}>
                      {classification.classification}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Baseado no percentual de gordura corporal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Card de Referência
function ReferenceCard({ title, value, reference, progress, gradient }: {
  title: string;
  value: string;
  reference: string;
  progress: number;
  gradient: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
        <Progress value={progress} className="h-3 mb-2" />
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{reference}</div>
      </div>
    </div>
  );
}

// Componente da Seção de Informações do Protocolo
function ProtocolInformationSection({ assessment }: { assessment: AssessmentOverviewProps['assessment'] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const protocolCards = [
    {
      icon: Calculator,
      label: "Protocolo Utilizado",
      value: PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS] || assessment.protocol,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
    },
    {
      icon: Target,
      label: "Precisão Estimada",
      value: assessment.accuracy_estimate || "Não especificada",
      gradient: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
    },
    {
      icon: Calendar,
      label: "Data da Avaliação",
      value: formatDate(assessment.date),
      gradient: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
    }
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Informações do Protocolo
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Método e precisão da avaliação
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {protocolCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                  <div className={`relative p-6 bg-gradient-to-br ${card.bgColor} rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg transform group-hover:scale-105 transition-all duration-300`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                          {card.label}
                        </div>
                        <div className="text-gray-900 dark:text-white font-semibold">
                          {card.value}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

