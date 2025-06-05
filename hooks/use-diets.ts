// hooks/use-diets.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Diet {
  id: string;
  student_id: string;
  created_by: string;
  name: string;
  description: string;
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
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  status: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  creator?: {
    id: string;
    full_name: string;
    role: string;
  };
  physical_assessment?: any;
  meals?: any[];
  shopping_list?: any[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useDiets(studentId?: string) {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const fetchDiets = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (studentId) {
        params.append('studentId', studentId);
      }

      const response = await fetch(`/api/diets?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setDiets(data.diets);
      setPagination(data.pagination);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar dietas",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, studentId, toast]);

  useEffect(() => {
    fetchDiets();
  }, [fetchDiets]);

  const createDiet = async (dietData: Partial<Diet>) => {
    try {
      const response = await fetch('/api/diets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dietData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Dieta criada com sucesso",
        description: "A dieta foi salva e está disponível para consulta"
      });

      await fetchDiets();
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar dieta",
        description: error.message
      });
      throw error;
    }
  };

  const updateDiet = async (id: string, dietData: Partial<Diet>) => {
    try {
      const response = await fetch(`/api/diets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dietData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Dieta atualizada",
        description: "As alterações foram salvas com sucesso"
      });

      await fetchDiets();
      
      return data;
    } catch (error: any) {
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
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Dieta excluída",
        description: "A dieta foi removida com sucesso"
      });

      await fetchDiets();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir dieta",
        description: error.message
      });
      throw error;
    }
  };

  const generateDietWithAI = async (params: any) => {
    try {
      const response = await fetch('/api/ai/generate-diet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar dieta",
        description: error.message
      });
      throw error;
    }
  };

  const changePage = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const changePageSize = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return {
    diets,
    loading,
    pagination,
    createDiet,
    updateDiet,
    deleteDiet,
    generateDietWithAI,
    changePage,
    changePageSize,
    refetch: fetchDiets
  };
}