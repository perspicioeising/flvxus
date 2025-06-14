// hooks/useAssessmentComparison.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Assessment, 
  ComparisonData, 
  MeasurementPoint, 
  ProgressScore,
  safeNumber
} from '@/types/assessment-comparison';
import {
  Scale,
  BarChart3,
  Target,
  TrendingDown,
  Activity
} from 'lucide-react';

export const useAssessmentComparison = (
  currentAssessment: Assessment,
  studentId: string
) => {
  // Estados
  const [previousAssessments, setPreviousAssessments] = useState<Assessment[]>([]);
  const [selectedPreviousAssessment, setSelectedPreviousAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementPoint | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMeasurementCategory, setActiveMeasurementCategory] = useState<'circumferences' | 'skinfolds'>('circumferences');

  // Buscar avaliações anteriores
  const fetchPreviousAssessments = useCallback(async () => {
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
  }, [studentId]);

  // Selecionar avaliação anterior mais recente automaticamente
  useEffect(() => {
    if (previousAssessments.length > 0 && !selectedPreviousAssessment) {
      const mostRecent = previousAssessments
        .filter(assessment => assessment.id !== currentAssessment.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (mostRecent) {
        setSelectedPreviousAssessment(mostRecent);
      }
    }
  }, [previousAssessments, currentAssessment.id, selectedPreviousAssessment]);

  // Gerar dados de comparação
  const generateComparisonData = useCallback(() => {
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
        icon: <Scale className="h-4 w-4 sm:h-5 sm:w-5" />,
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
        icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
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
        icon: <Target className="h-4 w-4 sm:h-5 sm:w-5" />,
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
        icon: <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />,
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
        icon: <Activity className="h-4 w-4 sm:h-5 sm:w-5" />,
        color: 'green',
        improvement: currentAssessment.lean_mass > selectedPreviousAssessment.lean_mass ? 'positive' : 
                    currentAssessment.lean_mass < selectedPreviousAssessment.lean_mass ? 'negative' : 'neutral'
      }
    ];

    setComparisonData(comparisons);
  }, [selectedPreviousAssessment, currentAssessment]);

  // Calcular progresso geral
  const getOverallProgress = useCallback((): ProgressScore => {
    if (comparisonData.length === 0) return { score: 0, status: 'needs_improvement', message: 'Sem dados' };
    
    const positiveChanges = comparisonData.filter(d => d.improvement === 'positive').length;
    const totalMetrics = comparisonData.length;
    const score = (positiveChanges / totalMetrics) * 100;
    
    if (score >= 70) return { score, status: 'excellent', message: 'Excelente progresso!' };
    if (score >= 50) return { score, status: 'good', message: 'Bom progresso' };
    if (score >= 30) return { score, status: 'moderate', message: 'Progresso moderado' };
    return { score, status: 'needs_improvement', message: 'Precisa melhorar' };
  }, [comparisonData]);

  // Manipuladores de clique
  const handleMeasurementClick = (measurement: MeasurementPoint) => {
    setSelectedMeasurement(measurement);
  };

  const handleAssessmentSelect = (assessment: Assessment) => {
    setSelectedPreviousAssessment(assessment);
  };

  // Obter avaliações disponíveis (excluindo a atual)
  const availableAssessments = previousAssessments.filter(a => a.id !== currentAssessment.id);

  // Efeitos
  useEffect(() => {
    fetchPreviousAssessments();
  }, [fetchPreviousAssessments]);

  useEffect(() => {
    if (selectedPreviousAssessment) {
      generateComparisonData();
    }
  }, [selectedPreviousAssessment, generateComparisonData]);

  return {
    // Estados
    isLoading,
    previousAssessments: availableAssessments,
    selectedPreviousAssessment,
    comparisonData,
    selectedMeasurement,
    activeTab,
    activeMeasurementCategory,
    
    // Ações
    setSelectedPreviousAssessment,
    setSelectedMeasurement,
    setActiveTab,
    setActiveMeasurementCategory,
    handleMeasurementClick,
    handleAssessmentSelect,
    
    // Utilitários
    getOverallProgress,
    safeNumber
  };
};