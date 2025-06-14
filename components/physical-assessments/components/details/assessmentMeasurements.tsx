// components/physical-assessments/components/assessmentMeasurements.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, AlertCircle, Star } from "lucide-react";
import { AssessmentMeasurementsProps, MEASUREMENT_LABELS } from '@/types/physical-assessment-details';

export function AssessmentMeasurements({ measurements }: AssessmentMeasurementsProps) {
  
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
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-indigo-50/50 via-emerald-50/50 to-indigo-50/50 dark:from-indigo-900/10 dark:via-emerald-900/10 dark:to-indigo-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Ruler className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Medidas Registradas</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Todas as medidas coletadas durante a avaliação
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          
          {/* Circunferências */}
          {circumferences.length > 0 && (
            <MeasurementSection
              title="Circunferências"
              emoji="🔵"
              measurements={circumferences}
              unit="cm"
              colorFrom="blue-500"
              colorTo="cyan-500"
            />
          )}

          {/* Dobras Cutâneas */}
          {skinFolds.length > 0 && (
            <MeasurementSection
              title="Dobras Cutâneas"
              emoji="🟡"
              measurements={skinFolds}
              unit="mm"
              colorFrom="yellow-500"
              colorTo="orange-500"
              className={circumferences.length > 0 ? "mt-6 sm:mt-10" : ""}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para seção de medidas
interface MeasurementSectionProps {
  title: string;
  emoji: string;
  measurements: [string, number][];
  unit: string;
  colorFrom: string;
  colorTo: string;
  className?: string;
}

function MeasurementSection({ 
  title, 
  emoji, 
  measurements, 
  unit, 
  colorFrom, 
  colorTo, 
  className = "" 
}: MeasurementSectionProps) {
  
  const formatNumber = (value: unknown, decimals: number = 2): string => {
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
    <div className={className}>
      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
        <span className="text-lg sm:text-2xl">{emoji}</span>
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {measurements.map(([key, value]) => (
          <MeasurementCard
            key={key}
            label={MEASUREMENT_LABELS[key as keyof typeof MEASUREMENT_LABELS]}
            value={formatNumber(value)}
            unit={unit}
            colorFrom={colorFrom}
            colorTo={colorTo}
          />
        ))}
      </div>
    </div>
  );
}

// Componente para card individual de medida
interface MeasurementCardProps {
  label: string;
  value: string;
  unit: string;
  colorFrom: string;
  colorTo: string;
}

function MeasurementCard({ label, value, unit, colorFrom, colorTo }: MeasurementCardProps) {
  const gradientClass = `from-${colorFrom} to-${colorTo}`;
  const textColorClass = colorFrom.includes('blue') ? 'text-blue-700 dark:text-blue-300' : 'text-yellow-700 dark:text-yellow-300';
  const borderColorClass = colorFrom.includes('blue') ? 'border-blue-200/30 dark:border-blue-700/30' : 'border-yellow-200/30 dark:border-yellow-700/30';

  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`relative p-3 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border ${borderColorClass} shadow-lg transform group-hover:scale-105 transition-all duration-300`}>
        <div className={`font-bold ${textColorClass} text-xs sm:text-sm mb-1 sm:mb-2 truncate`}>
          {label}
        </div>
        <div className="text-lg sm:text-3xl font-black text-gray-900 dark:text-white">
          {value}{unit}
        </div>
      </div>
    </div>
  );
}

// Componente para estado vazio
function EmptyMeasurements() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">
        <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-green-900/10 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                <Ruler className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Medidas Registradas</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Todas as medidas coletadas durante a avaliação
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="text-center py-12 sm:py-24">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                <Ruler className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <h3 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent mb-3 sm:mb-4">
              Nenhuma medida registrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-10 max-w-lg mx-auto text-sm sm:text-lg leading-relaxed">
              As medidas específicas não foram coletadas nesta avaliação
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}