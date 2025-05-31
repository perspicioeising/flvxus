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

export function useExercises() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setExercises(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching exercises",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

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

      setExercises([...exercises, data]);
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding exercise",
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

      setExercises(exercises.map(ex => ex.id === id ? data : ex));
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating exercise",
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
        throw new Error(data.error);
      }

      setExercises(exercises.filter(ex => ex.id !== id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting exercise",
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
        title: "Error uploading video",
        description: error.message,
      });
      throw error;
    }
  };

  return {
    exercises,
    loading,
    addExercise,
    updateExercise,
    deleteExercise,
    uploadVideo,
    refresh: fetchExercises,
  };
}