// app/dashboard/exercises/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Exercise } from '@/components/exercices/types/exercise';
import { ExerciseDetailsHeader } from '@/components/exercices/components/details/ExerciseDetailsHeader';
import { ExerciseDetailsContent } from '@/components/exercices/components/details/ExerciseDetailsContent';
import { ExerciseDetailsActions } from '@/components/exercices/components/details/ExerciseDetailsActions';
import { ExerciseDetailsSkeleton } from '@/components/exercices/components/details/ExerciseDetailsSkeleton';
import { Loader2 } from 'lucide-react';


export function ExerciseViewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const exerciseId = params.id as string;

  useEffect(() => {
    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId]);

  const fetchExercise = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Buscando exercício:', exerciseId);
      
      const response = await fetch(`/api/exercises/${exerciseId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar exercício');
      }

      console.log('✅ Exercício carregado:', data.name);
      setExercise(data);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar exercício:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar exercício",
        description: error.message,
      });
      
      // Redirecionar para lista se não encontrou
      router.push('/dashboard/exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/exercises/${exerciseId}/edit`);
  };

  const handleClone = () => {
    // Redirecionar para criar novo exercício com dados pré-preenchidos
    const searchParams = new URLSearchParams({
      clone: exerciseId,
    });
    
    router.push(`/dashboard/exercises/new?${searchParams.toString()}`);
  };

  const handleDelete = async () => {
    if (!exercise) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o exercício "${exercise.name}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      console.log('🗑️ Deletando exercício:', exercise.name);

      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar exercício');
      }

      toast({
        title: "Exercício deletado com sucesso",
        description: `"${exercise.name}" foi removido da biblioteca`,
      });

      router.push('/dashboard/exercises');

    } catch (error: any) {
      console.error('❌ Erro ao deletar exercício:', error);
      toast({
        variant: "destructive",
        title: "Erro ao deletar exercício",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/exercises');
  };

  if (isLoading) {
    return <ExerciseDetailsSkeleton />;
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😵</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Exercício não encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            O exercício que você procura não existe ou foi removido.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header com título e ações principais */}
        <ExerciseDetailsHeader
          exercise={exercise}
          onBack={handleBack}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />

        {/* Conteúdo principal */}
        <ExerciseDetailsContent exercise={exercise} />

        {/* Ações secundárias (mobile) */}
        <ExerciseDetailsActions
          exercise={exercise}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}