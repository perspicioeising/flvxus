import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import { useToast } from './use-toast';

export type Exercise = {
  id: string;
  name: string;
  description: string;
  video_url: string | null;
  muscle_group: string[];
  equipment: string[];
  variations: string[];
  tips: string[];
  common_errors: string[];
  created_at: string;
  updated_at: string;
  tenant_id: string;
};

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useExercises() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  });

  const fetchExercises = async (page = pagination.page, limit = pagination.limit) => {
    try {
      const response = await fetch(`/api/exercises?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setExercises(data.exercises);
      setPagination(data.pagination);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar exercícios",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const addExercise = async (exerciseData: Partial<Exercise>) => {
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      await fetchExercises(); // Refresh the list after adding
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar exercício",
        description: error.message,
      });
      throw error;
    }
  };

  const updateExercise = async (id: string, exerciseData: Partial<Exercise>) => {
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      await fetchExercises(); // Refresh the list after updating
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar exercício",
        description: error.message,
      });
      throw error;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'DEPENDENCY_ERROR') {
          toast({
            variant: "destructive",
            title: "Não é possível excluir",
            description: data.error,
          });
          return;
        }
        throw new Error(data.error);
      }

      await fetchExercises(); // Refresh the list after deleting
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir exercício",
        description: error.message,
      });
      throw error;
    }
  };

  const uploadVideo = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload do vídeo",
        description: error.message,
      });
      throw error;
    }
  };

  const changePage = (page: number) => {
    fetchExercises(page, pagination.limit);
  };

  const changePageSize = (limit: number) => {
    fetchExercises(1, limit);
  };

  return {
    exercises,
    loading,
    pagination,
    addExercise,
    updateExercise,
    deleteExercise,
    uploadVideo,
    changePage,
    changePageSize,
    refresh: fetchExercises,
  };
}