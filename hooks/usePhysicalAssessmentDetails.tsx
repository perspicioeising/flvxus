// hooks/usePhysicalAssessmentDetails.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AssessmentDetails, AssessmentClassification } from '@/types/physical-assessment-details';

// Função auxiliar para garantir que temos um número válido
const ensureNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const stringValue = String(value).trim();
  if (stringValue === '') {
    return 0;
  }
  const num = Number(stringValue);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

export const usePhysicalAssessmentDetails = (assessmentId: string) => {
  const router = useRouter();
  const { toast } = useToast();

  // Estados
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  // Buscar dados da avaliação
  const fetchAssessment = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/physical-assessments/${assessmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Parse de dados de IA se necessário
      if (data.ai_analysis && typeof data.ai_analysis === 'string') {
        try {
          data.ai_analysis = JSON.parse(data.ai_analysis);
        } catch (parseError) {
          console.error('Erro ao fazer parse de ai_analysis:', parseError);
          data.ai_analysis = null;
        }
      }

      if (data.ai_recommendations && typeof data.ai_recommendations === 'string') {
        try {
          data.ai_recommendations = JSON.parse(data.ai_recommendations);
        } catch (parseError) {
          console.error('Erro ao fazer parse de ai_recommendations:', parseError);
          data.ai_recommendations = null;
        }
      }

      // Garantir que todos os valores numéricos sejam números válidos
      const processedData = {
        ...data,
        weight: ensureNumber(data.weight),
        height: ensureNumber(data.height),
        age: ensureNumber(data.age),
        bmi: ensureNumber(data.bmi),
        fat_percentage: ensureNumber(data.fat_percentage),
        fat_mass: ensureNumber(data.fat_mass),
        lean_mass: ensureNumber(data.lean_mass),
        body_density: ensureNumber(data.body_density),
        measurements: data.measurements || {}
      };

      setAssessment(processedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliação",
        description: error.message,
      });
      router.push('/dashboard/physical-assessments');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId, toast, router]);

  // Buscar role do usuário
  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (response.ok) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Erro ao buscar role do usuário:', error);
    }
  }, []);

  // Classificação de gordura corporal
  const getClassificationColor = useCallback((fatPercentage: number, gender: string): AssessmentClassification => {
    let classification = '';
    let colorClass = '';
    const validFatPercentage = ensureNumber(fatPercentage);

    if (gender === 'male') {
      if (validFatPercentage < 6) {
        classification = 'Muito Baixo';
        colorClass = 'text-red-600 dark:text-red-400';
      } else if (validFatPercentage < 14) {
        classification = 'Atlético';
        colorClass = 'text-green-600 dark:text-green-400';
      } else if (validFatPercentage < 18) {
        classification = 'Fitness';
        colorClass = 'text-blue-600 dark:text-blue-400';
      } else if (validFatPercentage < 25) {
        classification = 'Aceitável';
        colorClass = 'text-yellow-600 dark:text-yellow-400';
      } else {
        classification = 'Elevado';
        colorClass = 'text-orange-600 dark:text-orange-400';
      }
    } else {
      if (validFatPercentage < 16) {
        classification = 'Muito Baixo';
        colorClass = 'text-red-600 dark:text-red-400';
      } else if (validFatPercentage < 21) {
        classification = 'Atlético';
        colorClass = 'text-green-600 dark:text-green-400';
      } else if (validFatPercentage < 25) {
        classification = 'Fitness';
        colorClass = 'text-blue-600 dark:text-blue-400';
      } else if (validFatPercentage < 32) {
        classification = 'Aceitável';
        colorClass = 'text-yellow-600 dark:text-yellow-400';
      } else {
        classification = 'Elevado';
        colorClass = 'text-orange-600 dark:text-orange-400';
      }
    }

    return { classification, colorClass };
  }, []);

  // Deletar avaliação
  const deleteAssessment = async () => {
    if (!confirm('Tem certeza que deseja deletar esta avaliação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/physical-assessments/${assessmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação deletada",
        description: "A avaliação foi removida com sucesso.",
      });

      router.push('/dashboard/physical-assessments');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar avaliação",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Editar avaliação
  const editAssessment = () => {
    router.push(`/dashboard/physical-assessments/${assessmentId}/edit`);
  };

  // Compartilhar avaliação
  const shareAssessment = () => {
    // TODO: Implementar funcionalidade de compartilhar
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A função de compartilhar será implementada em breve.",
    });
  };

  // Download do relatório
  const downloadReport = () => {
    // TODO: Implementar funcionalidade de download
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A função de download será implementada em breve.",
    });
  };

  // Formato de número
  const formatNumber = (value: unknown, decimals: number = 2): string => {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    const stringValue = String(value).trim();
    if (stringValue === '') {
      return '0.00';
    }
    const num = Number(stringValue);
    if (isNaN(num) || !isFinite(num)) {
      return '0.00';
    }
    return num.toFixed(decimals);
  };

  // Inicialização
  useEffect(() => {
    const init = async () => {
      await fetchUserRole();
      await fetchAssessment();
    };
    init();
  }, [fetchUserRole, fetchAssessment]);

  return {
    // Estados
    assessment,
    isLoading,
    userRole,
    activeTab,
    isDeleting,
    
    // Ações
    setActiveTab,
    deleteAssessment,
    editAssessment,
    shareAssessment,
    downloadReport,
    
    // Utilitários
    getClassificationColor,
    formatNumber,
    ensureNumber
  };
};