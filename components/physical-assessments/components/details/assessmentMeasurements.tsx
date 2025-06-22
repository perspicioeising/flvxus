// components/physical-assessments/components/assessmentMeasurements.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, AlertCircle, Star, Sparkles, TrendingUp, Activity, Target } from "lucide-react";
import { AssessmentMeasurementsProps, MEASUREMENT_LABELS } from '@/components/physical-assessments/types/physical-assessment-details';

export function AssessmentMeasurements({ measurements }: AssessmentMeasurementsProps) {
  
  // Função auxiliar para garantir que temos um número válido
  const ensureNumber = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return 0;
    const stringValue = String(value).trim();
    if (stringValue === '') return 0;
    const num = Number(stringValue);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const formatNumber = (value: unknown, decimals: number = 1): string => {
    const num = ensureNumber(value);
    return num.toFixed(decimals);
  };

  // Filtrar medidas válidas
  const validMeasurements = Object.entries(measurements).filter(([_, value]) => ensureNumber(value) > 0);

  // Separar circunferências e dobras cutâneas
  const circumferences = validMeasurements.filter(([key]) => 
    ['neck', 'shoulders', 'chest', 'chest_circ', 'waist', 'abdomen', 'hips', 'left_arm', 'right_arm', 'left_thigh', 'right_thigh', 'left_calf', 'right_calf'].includes(key)
  );

  const skinFolds = validMeasurements.filter(([key]) => 
    ['triceps', 'biceps', 'subscapular', 'abdominal', 'suprailiac', 'midaxillary', 'thigh'].includes(key)
  );

  if (validMeasurements.length === 0) {
    return <EmptyMeasurements />;
  }

  return (
    <div className="space-y-6">
      {/* Header Card com estatísticas */}
      <MeasurementsHeader 
        totalMeasurements={validMeasurements.length}
        circumferencesCount={circumferences.length}
        skinFoldsCount={skinFolds.length}
      />

      {/* Circunferências */}
      {circumferences.length > 0 && (
        <MeasurementSection
          title="Circunferências"
          icon={Activity}
          measurements={circumferences}
          unit="cm"
          gradient="from-indigo-500 to-indigo-600"
          bgGradient="from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20"
          borderColor="border-indigo-200/50 dark:border-indigo-700/50"
          iconBg="from-indigo-500 to-indigo-600"
        />
      )}

      {/* Dobras Cutâneas */}
      {skinFolds.length > 0 && (
        <MeasurementSection
          title="Dobras Cutâneas"
          icon={Target}
          measurements={skinFolds}
          unit="mm"
          gradient="from-teal-500 to-teal-600"
          bgGradient="from-teal-50 to-indigo-100 dark:from-teal-900/20 dark:to-indigo-800/20"
          borderColor="border-purple-200/50 dark:border-purple-700/50"
          iconBg="from-purple-500 to-indigo-600"
        />
      )}
    </div>
  );
}

// Componente do Header com estatísticas
function MeasurementsHeader({ 
  totalMeasurements, 
  circumferencesCount, 
  skinFoldsCount 
}: { 
  totalMeasurements: number; 
  circumferencesCount: number; 
  skinFoldsCount: number;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-indigo-50/50 via-teal-50/50 to-teal-50/50 dark:from-indigo-900/10 dark:via-teal-900/10 dark:to-teal-900/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Ruler className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Medidas Corporais Completas
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Análise detalhada de todas as medidas coletadas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 pt-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total de Medidas"
              value={totalMeasurements}
              icon={TrendingUp}
              gradient="from-teal-500 to-teal-600"
              bgColor="from-teal-50 to-teal-100 dark:from-teal-900/80 dark:to-teal-800/80"
            />
            <StatCard
              label="Circunferências"
              value={circumferencesCount}
              icon={Activity}
              gradient="from-emerald-500 to-emerald-600"
              bgColor="from-emerald-50 to-emerald-100 dark:from-emerald-900/80 dark:to-emerald-800/80"
            />
            <StatCard
              label="Dobras Cutâneas"
              value={skinFoldsCount}
              icon={Target}
              gradient="from-green-500 to-green-600"
              bgColor="from-green-50 to-green-100 dark:from-green-900/80 dark:to-green-800/80"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Card de Estatística
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  gradient, 
  bgColor 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  gradient: string; 
  bgColor: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`relative p-4 bg-gradient-to-br ${bgColor} rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 group-hover:scale-105`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 bg-gradient-to-br ${gradient} rounded-lg shadow-md`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

// Componente para seção de medidas melhorado
interface MeasurementSectionProps {
  title: string;
  icon: any;
  measurements: [string, number][];
  unit: string;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  iconBg: string;
}

function MeasurementSection({ 
  title, 
  icon: Icon,
  measurements, 
  unit, 
  gradient,
  bgGradient,
  borderColor,
  iconBg
}: MeasurementSectionProps) {
  
  const formatNumber = (value: unknown, decimals: number = 1): string => {
    const ensureNumber = (value: unknown): number => {
      if (value === null || value === undefined || value === '') return 0;
      const stringValue = String(value).trim();
      if (stringValue === '') return 0;
      const num = Number(stringValue);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };
    
    const num = ensureNumber(value);
    return num.toFixed(decimals);
  };

  return (
    <div className="relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5 rounded-3xl blur-2xl`}></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className={`p-8 bg-gradient-to-r ${bgGradient}`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`p-4 bg-gradient-to-br ${iconBg} rounded-2xl shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {measurements.length} medidas registradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {measurements.map(([key, value], index) => (
              <MeasurementCard
                key={key}
                label={MEASUREMENT_LABELS[key as keyof typeof MEASUREMENT_LABELS]}
                value={formatNumber(value)}
                unit={unit}
                gradient={gradient}
                borderColor={borderColor}
                delay={index * 50}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para card individual de medida melhorado
interface MeasurementCardProps {
  label: string;
  value: string;
  unit: string;
  gradient: string;
  borderColor: string;
  delay?: number;
}

function MeasurementCard({ label, value, unit, gradient, borderColor, delay = 0 }: MeasurementCardProps) {
  return (
    <div 
      className="group relative animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
      
      {/* Card Content */}
      <div className={`relative p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border ${borderColor} shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2 truncate">
            {label}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              {value}
            </span>
            <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {unit}
            </span>
          </div>
          
          {/* Decorative Element */}
          <div className={`absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br ${gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
        </div>
      </div>
    </div>
  );
}

// Componente para estado vazio melhorado
function EmptyMeasurements() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="p-8 bg-gradient-to-r from-teal-50/50 via-teal-50/50 to-indigo-50/50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                <Ruler className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Medidas Corporais
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Status da coleta de medidas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 sm:p-16 text-center">
          <div className="relative mb-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                <Ruler className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent mb-4">
            Nenhuma medida registrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
            As medidas específicas não foram coletadas nesta avaliação. 
            Para uma análise completa, é recomendado registrar todas as medidas corporais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}