// hooks/use-diets.ts
import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';

export interface DietParams {
  student_id: string;
  age: number;
  weight: number;
  height?: number;
  gender: string;
  activity_level: string;
  goal: string;
  goal_description?: string;
  budget_profile: string;
  meals_per_day: number;
  dietary_style: string[];
  food_preferences: string[];
  restrictions: string[];
  custom_restrictions?: string;
  physical_assessment?: any;
}

export interface CreateDietParams extends DietParams {
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  used_physical_assessment: boolean;
  physical_assessment_id?: string;
  generatedMeals: any[];
  generatedShoppingList: any[];
  generatedRecommendations: string[];
}

export function useDiets() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateDietWithAI = async (params: DietParams) => {
    try {
      setIsLoading(true);
      console.log('🤖 Iniciando geração de dieta com IA...');
      
      const response = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dieta gerada com sucesso');
      
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao gerar dieta:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar dieta",
        description: error.message || "Erro interno do servidor"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createDiet = async (params: CreateDietParams) => {
    try {
      setIsLoading(true);
      console.log('💾 Salvando dieta...');
      
      const response = await fetch('/api/diets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dieta salva com sucesso');
      
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao salvar dieta:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar dieta",
        description: error.message || "Erro interno do servidor"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiets = async (page = 1, limit = 10, studentId?: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (studentId) {
        params.append('studentId', studentId);
      }
      
      const response = await fetch(`/api/diets?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar dietas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar dietas",
        description: error.message || "Erro interno do servidor"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateDietWithAI,
    createDiet,
    fetchDiets,
    isLoading
  };
}