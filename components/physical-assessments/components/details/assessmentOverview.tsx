// components/physical-assessments/components/assessmentOverview.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Sparkles
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
      suffix: ""
    },
    {
      value: assessment.fat_percentage,
      label: "% Gordura",
      color: 'from-blue-500 to-indigo-600',
      icon: BarChart3,
      progress: Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100),
      suffix: "%"
    },
    {
      value: assessment.fat_mass,
      label: "M. Gorda",
      color: 'from-indigo-600 to-blue-600',
      icon: Weight,
      progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.fat_mass) / ensureNumber(assessment.weight)) * 100 : 0,
      suffix: "kg"
    },
    {
      value: assessment.lean_mass,
      label: "M. Magra",
      color: 'from-blue-600 to-indigo-700',
      icon: Activity,
      progress: ensureNumber(assessment.weight) > 0 ? (ensureNumber(assessment.lean_mass) / ensureNumber(assessment.weight)) * 100 : 0,
      suffix: "kg"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Metrics - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const validValue = ensureNumber(metric.value);

          return (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
            </div>
          );
        })}
      </div>

      {/* Body Composition Chart - Mobile Optimized */}
      <BodyCompositionChart assessment={assessment} classification={classification} />

      {/* Protocol Information - Mobile Optimized */}
      <ProtocolInformation assessment={assessment} />

      {/* Notes - Mobile Optimized */}
      {assessment.notes && <AssessmentNotes notes={assessment.notes} />}
    </div>
  );
}

// Componente do gráfico de composição corporal
function BodyCompositionChart({ assessment, classification }: { assessment: AssessmentOverviewProps['assessment'], classification: AssessmentOverviewProps['classification'] }) {
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

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-purple-50/50 via-indigo-50/50 to-purple-50/50 dark:from-purple-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg">
                <PieChart className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Composição Corporal</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Distribuição visual da massa corporal
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Gráfico Visual - Mobile Responsive */}
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 mx-auto">
                <div
                  className="absolute inset-0 rounded-full shadow-2xl"
                  style={{
                    background: `conic-gradient(from 0deg, #ef4444 ${ensureNumber(assessment.fat_percentage) * 3.6}deg, #10b981 0deg)`
                  }}
                />
                <div className="absolute inset-6 sm:inset-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">
                      {formatNumber(assessment.fat_percentage)}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold">Gordura</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg"></div>
                  <span className="text-xs sm:text-sm font-bold">M. Gorda ({formatNumber(assessment.fat_mass)}kg)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"></div>
                  <span className="text-xs sm:text-sm font-bold">M. Magra ({formatNumber(assessment.lean_mass)}kg)</span>
                </div>
              </div>
            </div>

            {/* Indicadores de Referência - Mobile Optimized */}
            <ReferenceIndicators assessment={assessment} classification={classification} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente dos indicadores de referência
function ReferenceIndicators({ assessment, classification }: { assessment: AssessmentOverviewProps['assessment'], classification: AssessmentOverviewProps['classification'] }) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
        Indicadores de Referência
      </h4>

      <div className="space-y-4 sm:space-y-6">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg sm:rounded-xl">
          <div className="flex justify-between mb-2 sm:mb-3">
            <span className="text-sm font-bold">IMC</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{formatNumber(assessment.bmi)}</span>
          </div>
          <Progress value={Math.min((ensureNumber(assessment.bmi) / 30) * 100, 100)} className="h-3 sm:h-4" />
          <div className="text-xs text-gray-500 mt-2 font-medium">Normal: 18.5-24.9</div>
        </div>

        <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl">
          <div className="flex justify-between mb-2 sm:mb-3">
            <span className="text-sm font-bold">% Gordura</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{formatNumber(assessment.fat_percentage)}%</span>
          </div>
          <Progress value={Math.min((ensureNumber(assessment.fat_percentage) / 35) * 100, 100)} className="h-3 sm:h-4" />
          <div className="text-xs text-gray-500 mt-2 font-medium">
            {assessment.gender === 'male' ? 'Ideal: 10-15%' : 'Ideal: 16-24%'}
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl">
          <div className="flex justify-between mb-2 sm:mb-3">
            <span className="text-sm font-bold">Classificação</span>
            <span className={`text-sm font-bold ${classification.colorClass}`}>{classification.classification}</span>
          </div>
          <div className={`h-3 sm:h-4 rounded-full shadow-md ${classification.classification === 'Atlético' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              classification.classification === 'Fitness' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                classification.classification === 'Aceitável' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-pink-500'
            }`}></div>
        </div>
      </div>
    </div>
  );
}

// Componente das informações do protocolo
function ProtocolInformation({ assessment }: { assessment: AssessmentOverviewProps['assessment'] }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-blue-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Calculator className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Informações do Protocolo</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Método utilizado e precisão da avaliação
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-blue-200/30 dark:border-blue-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                <div className="font-bold text-blue-700 dark:text-blue-300 mb-2 sm:mb-3 text-sm sm:text-lg">Protocolo Utilizado</div>
                <div className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                  {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS] || assessment.protocol}
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-green-200/30 dark:border-green-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                <div className="font-bold text-green-700 dark:text-green-300 mb-2 sm:mb-3 text-sm sm:text-lg">Precisão Estimada</div>
                <div className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                  {assessment.accuracy_estimate || 'Não especificada'}
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-purple-200/30 dark:border-purple-700/30 shadow-lg transform group-hover:scale-105 transition-all duration-300">
                <div className="font-bold text-purple-700 dark:text-purple-300 mb-2 sm:mb-3 text-sm sm:text-lg">Data da Avaliação</div>
                <div className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                  {format(new Date(assessment.date), 'PPP', { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente das observações
function AssessmentNotes({ notes }: { notes: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-slate-500/10 to-gray-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-gray-50/50 via-slate-50/50 to-gray-50/50 dark:from-gray-800/10 dark:via-slate-800/10 dark:to-gray-800/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Info className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Observações</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Anotações da avaliação física
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
              {notes}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}