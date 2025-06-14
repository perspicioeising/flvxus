// /components/physical-assessments/components/list/AssessmentCard.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Brain, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AssessmentCardProps } from "@/components/physical-assessments/types/physical-assessment";
import { PROTOCOLS, ASSESSMENT_METRICS } from "@/components/physical-assessments/constants/physical-assessment";
import { getBodyFatClassification, formatMetricValue, getMetricTooltip, getNameInitials } from "@/components/physical-assessments/components/assessmentUtils";


export function AssessmentCard({ 
  assessment, 
  onView, 
  onViewAnalysis 
}: AssessmentCardProps) {
  
  const getClassificationBadge = (fatPercentage: number, gender: string) => {
    const classification = getBodyFatClassification(fatPercentage, gender);
    return (
      <Badge className={`${classification.colorClass} font-semibold text-xs`}>
        {classification.classification}
      </Badge>
    );
  };

  const formatValue = (value: number | null | undefined, format: string) => {
    return formatMetricValue(value, format as any);
  };

  const getTooltip = (value: number | null | undefined, label: string, format: string) => {
    return getMetricTooltip(value, label, format as any);
  };

  const studentInitials = getNameInitials(assessment.profiles.full_name);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-cyan-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01]">
        <CardContent className="p-4 sm:p-6">

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {studentInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                  <Activity className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {assessment.profiles.full_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                  {assessment.profiles.email}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs px-2 py-1">
                    {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs px-2 py-1">
                    {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metrics Mobile - Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {ASSESSMENT_METRICS.map((metric, index) => (
                <div
                  key={index}
                  className={`p-3 bg-gradient-to-br ${metric.colors} rounded-xl border border-white/20 dark:border-gray-700/20 shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{metric.icon}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {metric.label}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${metric.text}`}>
                    {formatValue(assessment[metric.key as keyof typeof assessment] as number, metric.format)}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Mobile */}
            <div className="flex gap-2">
              <Button
                onClick={() => onView(assessment.id)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-medium border-0 h-11"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="text-sm">Ver Detalhes</span>
              </Button>
              {assessment.ai_analysis && onViewAnalysis && (
                <Button
                  variant="outline"
                  onClick={() => onViewAnalysis(assessment.id)}
                  className="flex-1 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-11"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  <span className="text-sm">Análise IA</span>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {/* Student Info - Desktop */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {studentInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                  <Activity className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {assessment.profiles.full_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {assessment.profiles.email}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs">
                    {format(new Date(assessment.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </Badge>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 text-xs">
                    {PROTOCOLS[assessment.protocol as keyof typeof PROTOCOLS]}
                  </Badge>
                  {getClassificationBadge(assessment.fat_percentage, assessment.gender)}
                </div>
              </div>
            </div>

            {/* Metrics Desktop - Grid 1x4 */}
            <div className="grid grid-cols-4 gap-3 w-80">
              {ASSESSMENT_METRICS.map((metric, index) => (
                <div
                  key={index}
                  className={`text-center p-3 bg-gradient-to-r ${metric.colors} rounded-xl min-h-[80px] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200`}
                  title={getTooltip(assessment[metric.key as keyof typeof assessment] as number, metric.label, metric.format)}
                >
                  <div className={`text-xl font-bold ${metric.text} truncate`}>
                    {formatValue(assessment[metric.key as keyof typeof assessment] as number, metric.format)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Desktop */}
            <div className="flex gap-3 flex-col w-36">
              <Button
                onClick={() => onView(assessment.id)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl font-semibold border-0"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              {assessment.ai_analysis && onViewAnalysis && (
                <Button
                  variant="outline"
                  onClick={() => onViewAnalysis(assessment.id)}
                  className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Análise IA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}