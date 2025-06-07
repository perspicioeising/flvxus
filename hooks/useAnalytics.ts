// hooks/useAssessmentAI.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AssessmentData {
  weight: number;
  height: number;
  fat_percentage: number;
  lean_mass: number;
  bmi: number;
  age: number;
  gender: string;
  protocol: string;
  goals?: string[];
}

interface StudentProfile {
  full_name: string;
  birth_date?: string;
  gender?: string;
  experience_level?: string;
  medical_conditions?: string;
  goals?: string[];
}

interface PreviousAssessment {
  weight: number;
  fat_percentage: number;
  lean_mass: number;
  fat_mass: number;
  bmi: number;
  date: string;
}

export function useAssessmentAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeAssessment = async (
    current: AssessmentData,
    previous?: PreviousAssessment[],
    studentProfile?: StudentProfile
  ) => {
    try {
      setIsAnalyzing(true);
      
      const response = await fetch('/api/ai/assessment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current,
          previous: previous || [],
          student_profile: studentProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na análise');
      }

      const result = await response.json();
      setAnalysis(result);
      
      return result;
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na análise",
        description: "Não foi possível gerar a análise da avaliação",
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysis,
    analyzeAssessment,
    setAnalysis
  };
}

export function useProtocolRecommendation() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const { toast } = useToast();

  const getRecommendation = async (profile: {
    age: number;
    gender: 'male' | 'female';
    experience_level?: string;
    goals?: string[];
    medical_conditions?: string;
    previous_assessments?: number;
    last_protocol_used?: string;
  }) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/ai/protocol-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Falha na recomendação');
      }

      const result = await response.json();
      setRecommendation(result);
      
      return result;
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na recomendação",
        description: "Não foi possível gerar recomendação de protocolo",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    recommendation,
    getRecommendation,
    setRecommendation
  };
}

export function useWorkoutRecommendations() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const { toast } = useToast();

  const generateWorkoutPlan = async (data: {
    assessment_data: AssessmentData;
    student_profile: {
      experience_level?: string;
      goals?: string[];
      medical_conditions?: string;
      available_days?: number;
      preferred_training_time?: string;
      equipment_access?: string[];
    };
    previous_assessments?: PreviousAssessment[];
  }) => {
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/ai/workout-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha na geração do plano');
      }

      const result = await response.json();
      setWorkoutPlan(result);
      
      toast({
        title: "Plano de treino gerado!",
        description: "O plano personalizado foi criado com base na avaliação",
      });
      
      return result;
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no plano de treino",
        description: "Não foi possível gerar o plano de treino",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    workoutPlan,
    generateWorkoutPlan,
    setWorkoutPlan
  };
}

export function useNutritionRecommendations() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const { toast } = useToast();

  const generateNutritionPlan = async (data: {
    assessment_data: AssessmentData;
    activity_data: {
      training_frequency: number;
      training_intensity: 'low' | 'moderate' | 'high';
      cardio_frequency: number;
      daily_activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    };
    preferences: {
      dietary_restrictions?: string[];
      food_allergies?: string[];
      meal_preferences?: string[];
      budget_level?: 'low' | 'medium' | 'high';
      cooking_skill?: 'beginner' | 'intermediate' | 'advanced';
    };
    goals: string[];
    medical_conditions?: string;
  }) => {
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/ai/nutrition-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha na geração do plano');
      }

      const result = await response.json();
      setNutritionPlan(result);
      
      toast({
        title: "Plano nutricional gerado!",
        description: "O plano alimentar foi personalizado para os objetivos",
      });
      
      return result;
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no plano nutricional",
        description: "Não foi possível gerar o plano nutricional",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    nutritionPlan,
    generateNutritionPlan,
    setNutritionPlan
  };
}

export function useCompleteAssessment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const processCompleteAssessment = async (data: {
    student_id: string;
    assessment_data: {
      protocol: string;
      weight: number;
      height: number;
      age: number;
      gender: string;
      measurements: Record<string, number>;
      goals: string[];
      notes?: string;
    };
    generate_workout_plan?: boolean;
    generate_nutrition_plan?: boolean;
    activity_preferences?: {
      training_frequency: number;
      training_intensity: 'low' | 'moderate' | 'high';
      available_days: number[];
      equipment_access: string[];
    };
    nutrition_preferences?: {
      dietary_restrictions?: string[];
      food_allergies?: string[];
      budget_level?: 'low' | 'medium' | 'high';
      cooking_skill?: 'beginner' | 'intermediate' | 'advanced';
    };
  }) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/ai/complete-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha no processamento');
      }

      const result = await response.json();
      setResult(result);
      
      toast({
        title: "✅ Avaliação completa processada!",
        description: "Análise, planos e recomendações foram gerados com sucesso",
      });
      
      return result;
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Falha desconhecida",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    result,
    processCompleteAssessment,
    setResult
  };
}

// Hook para analytics
export function useAssessmentAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async (timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    try {
      setIsLoading(true);
      
      // Em produção, esta seria uma chamada real para a API
      const response = await fetch(`/api/analytics/assessments?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
      
    } catch (error) {
      // Para demonstração, usar dados mock
      const mockData = {
        totalAssessments: 156,
        totalStudents: 89,
        averageBMI: 24.3,
        averageFat: 18.7,
        protocolDistribution: [
          { protocol: 'Jackson & Pollock (3 dobras)', count: 45, percentage: 28.8 },
          { protocol: 'Jackson & Pollock (7 dobras)', count: 38, percentage: 24.4 },
          { protocol: 'Guedes (1994)', count: 32, percentage: 20.5 },
          { protocol: 'Durnin & Womersley', count: 25, percentage: 16.0 },
          { protocol: 'PROESP-BR', count: 16, percentage: 10.3 }
        ],
        monthlyTrends: [
          { month: 'Jan', assessments: 12, avgFat: 19.2, avgLean: 55.8 },
          { month: 'Fev', assessments: 18, avgFat: 18.9, avgLean: 56.1 },
          { month: 'Mar', assessments: 22, avgFat: 18.5, avgLean: 56.8 },
          { month: 'Abr', assessments: 19, avgFat: 18.2, avgLean: 57.2 },
          { month: 'Mai', assessments: 25, avgFat: 17.8, avgLean: 57.9 },
          { month: 'Jun', assessments: 28, avgFat: 17.5, avgLean: 58.3 }
        ],
        demographicData: [
          { ageGroup: '18-25', count: 32, avgFat: 16.8 },
          { ageGroup: '26-35', count: 28, avgFat: 18.2 },
          { ageGroup: '36-45', count: 18, avgFat: 20.1 },
          { ageGroup: '46-55', count: 8, avgFat: 22.5 },
          { ageGroup: '55+', count: 3, avgFat: 24.8 }
        ],
        improvementMetrics: {
          studentsImproving: 67,
          averageImprovement: 12.3,
          topPerformers: [
            { name: 'João Silva', improvement: 28.5 },
            { name: 'Maria Santos', improvement: 24.8 },
            { name: 'Pedro Costa', improvement: 22.1 }
          ]
        },
        riskAnalysis: {
          highRisk: 8,
          mediumRisk: 23,
          lowRisk: 58
        }
      };
      
      setAnalyticsData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyticsData,
    isLoading,
    fetchAnalytics,
    setAnalyticsData
  };
}

// Hook para validação de dados
export function useAssessmentValidation() {
  const validateAssessmentData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validações básicas
    if (!data.weight || data.weight <= 0) {
      errors.push('Peso deve ser maior que zero');
    }
    
    if (!data.height || data.height <= 0) {
      errors.push('Altura deve ser maior que zero');
    }
    
    if (!data.age || data.age <= 0) {
      errors.push('Idade deve ser maior que zero');
    }
    
    if (!data.gender || !['male', 'female'].includes(data.gender)) {
      errors.push('Gênero deve ser masculino ou feminino');
    }

    // Validação de faixas normais
    if (data.weight && (data.weight < 20 || data.weight > 300)) {
      errors.push('Peso fora da faixa esperada (20-300kg)');
    }
    
    if (data.height && (data.height < 100 || data.height > 250)) {
      errors.push('Altura fora da faixa esperada (100-250cm)');
    }
    
    if (data.age && (data.age < 7 || data.age > 100)) {
      errors.push('Idade fora da faixa esperada (7-100 anos)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateMeasurements = (measurements: Record<string, number>, protocol: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validações específicas por protocolo
    const protocolRequirements: Record<string, string[]> = {
      "Jackson & Pollock (3 dobras)": ['triceps', 'suprailiac', 'thigh'],
      "Jackson & Pollock (7 dobras)": ['triceps', 'subscapular', 'chest', 'midaxillary', 'suprailiac', 'abdominal', 'thigh'],
      "Guedes (1994)": ['triceps', 'suprailiac', 'abdominal'],
      "Durnin & Womersley": ['triceps', 'biceps', 'subscapular', 'suprailiac'],
      "PROESP-BR": ['triceps', 'subscapular']
    };

    const requiredFields = protocolRequirements[protocol] || [];
    
    requiredFields.forEach(field => {
      if (!measurements[field] || measurements[field] <= 0) {
        errors.push(`Medição ${field} é obrigatória para este protocolo`);
      } else if (measurements[field] > 50) {
        errors.push(`Medição ${field} parece muito alta (>50mm)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    validateAssessmentData,
    validateMeasurements
  };
}