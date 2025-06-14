// /utils/assessmentUtils.ts

import { AssessmentClassification } from "@/types/physical-assessment";
import { FAT_PERCENTAGE_CLASSIFICATIONS } from "@/constants/physical-assessment";

/**
 * Obtém a classificação de gordura corporal baseada no percentual e gênero
 */
export function getBodyFatClassification(
  fatPercentage: number, 
  gender: string
): AssessmentClassification {
  const classifications = FAT_PERCENTAGE_CLASSIFICATIONS[gender as 'male' | 'female'] || FAT_PERCENTAGE_CLASSIFICATIONS.male;
  const classification = classifications.find(c => fatPercentage >= c.min && fatPercentage < c.max);
  
  return {
    classification: classification?.label || 'Não classificado',
    colorClass: classification?.color || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
  };
}

/**
 * Formata valores de métricas de acordo com o tipo
 */
export function formatMetricValue(
  value: number | null | undefined, 
  format: 'decimal' | 'percentage' | 'kg' | 'default' = 'default'
): string {
  if (value == null) return "-";

  switch (format) {
    case "decimal":
      return value.toFixed(2);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "kg":
      return `${value.toFixed(1)}kg`;
    default:
      return value.toString();
  }
}

/**
 * Gera tooltip para métricas
 */
export function getMetricTooltip(
  value: number | null | undefined, 
  label: string, 
  format: 'decimal' | 'percentage' | 'kg' | 'default' = 'default'
): string {
  if (value == null) return "Não disponível";
  return `${label}: ${formatMetricValue(value, format)}`;
}

/**
 * Calcula estatísticas de uma lista de avaliações
 */
export function calculateAssessmentStats(assessments: any[]) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const thisMonth = assessments.filter(assessment => {
    const assessmentDate = new Date(assessment.created_at);
    return assessmentDate.getMonth() === currentMonth &&
      assessmentDate.getFullYear() === currentYear;
  }).length;

  const avgFatPercentage = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + (a.fat_percentage || 0), 0) / assessments.length
    : 0;

  const avgBMI = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + (a.bmi || 0), 0) / assessments.length
    : 0;

  return {
    total: assessments.length,
    thisMonth,
    avgFatPercentage: parseFloat(avgFatPercentage.toFixed(1)),
    avgBMI: parseFloat(avgBMI.toFixed(1))
  };
}

/**
 * Filtra avaliações baseado nos critérios de busca
 */
export function filterAssessments(
  assessments: any[], 
  filters: { searchQuery: string; protocolFilter: string; dateFilter: string }
) {
  return assessments.filter((assessment) => {
    const matchesSearch =
      assessment.profiles.full_name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      assessment.profiles.email.toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesProtocol = filters.protocolFilter === "all" || assessment.protocol === filters.protocolFilter;

    let matchesDate = true;
    if (filters.dateFilter !== "all") {
      const assessmentDate = new Date(assessment.created_at);
      const currentDate = new Date();

      switch (filters.dateFilter) {
        case "today":
          matchesDate = assessmentDate.toDateString() === currentDate.toDateString();
          break;
        case "week":
          const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = assessmentDate >= weekAgo;
          break;
        case "month":
          matchesDate = assessmentDate.getMonth() === currentDate.getMonth() &&
            assessmentDate.getFullYear() === currentDate.getFullYear();
          break;
      }
    }

    return matchesSearch && matchesProtocol && matchesDate;
  });
}

/**
 * Obtém as iniciais do nome completo
 */
export function getNameInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(name => name.length > 0)
    .map(name => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}