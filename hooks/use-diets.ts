// hooks/use-diets.ts
import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import { useToast } from '@/hooks/use-toast';

interface DietParams {
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

interface CreateDietParams extends DietParams {
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

interface Diet {
  id: string;
  name: string;
  description: string;
  student_id: string;
  student: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
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
  used_physical_assessment: boolean;
  physical_assessment_id?: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useDiets(studentId?: string) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchDiets();
  }, [studentId, pagination.page, pagination.limit]);

  const fetchDiets = async () => {
    try {
      setLoading(true);

      // Construir a URL com os parâmetros
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (studentId) {
        params.append('studentId', studentId);
      }

      const response = await fetch(`/api/diets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dietas');
      }

      const data = await response.json();
      
      setDiets(data.diets || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));

    } catch (error: any) {
      console.error('Error fetching diets:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dietas",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDietWithAI = async (params: DietParams) => {
    try {
      const response = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar dieta');
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error('Error generating diet:', error);
      throw error;
    }
  };

  const createDiet = async (dietData: CreateDietParams) => {
    try {
      console.log('=== INICIANDO CRIAÇÃO DE DIETA ===');
      console.log('Dados recebidos:', dietData);

      // Verificar se todos os campos obrigatórios estão presentes
      if (!dietData.name) {
        throw new Error('Nome da dieta é obrigatório');
      }
      if (!dietData.student_id) {
        throw new Error('ID do estudante é obrigatório');
      }
      if (!dietData.target_calories) {
        throw new Error('Calorias alvo são obrigatórias');
      }

      const response = await fetch('/api/diets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dietData),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || 'Erro ao criar dieta');
      }

      const data = await response.json();
      console.log('Dieta criada com sucesso:', data);
      
      await fetchDiets(); // Recarregar a lista
      return data;

    } catch (error: any) {
      console.error('Error creating diet:', error);
      throw error;
    }
  };

  const updateDiet = async (id: string, updateData: Partial<CreateDietParams>) => {
    try {
      const response = await fetch(`/api/diets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar dieta');
      }

      const data = await response.json();
      await fetchDiets();
      return data;

    } catch (error: any) {
      console.error('Error updating diet:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar dieta",
        description: error.message
      });
      throw error;
    }
  };

  const deleteDiet = async (id: string) => {
    try {
      const response = await fetch(`/api/diets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir dieta');
      }

      toast({
        title: "Dieta excluída",
        description: "A dieta foi excluída com sucesso"
      });

      await fetchDiets();

    } catch (error: any) {
      console.error('Error deleting diet:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir dieta",
        description: error.message
      });
      throw error;
    }
  };

  const changePage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  return {
    diets,
    loading,
    pagination,
    generateDietWithAI,
    createDiet,
    updateDiet,
    deleteDiet,
    changePage,
    changePageSize,
    fetchDiets
  };
}