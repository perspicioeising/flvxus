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
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Edit } from 'lucide-react';

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
      
      router.push('/dashboard/exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/exercises/${exerciseId}/edit`);
  };

  const handleClone = () => {
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
      <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-app-bg-secondary rounded-full flex items-center justify-center shadow-app-large">
              <Dumbbell className="h-12 w-12 text-app-text-muted" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-exercise/30 to-app-text-muted/30 rounded-full blur-2xl animate-pulse"></div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-app-heading mb-2">
              Exercício não encontrado
            </h2>
            <p className="text-app-text-secondary leading-relaxed">
              O exercício que você procura não existe ou foi removido.
            </p>
          </div>
          
          <Button
            onClick={handleBack}
            className="btn-gradient-primary px-6 py-3 rounded-xl font-semibold shadow-app-large hover:shadow-app-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar à Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-6xl">
        
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

        {/* Floating Action Buttons - Mobile Only */}
        <div className="fixed bottom-24 right-4 sm:hidden z-40 space-y-3">
          {/* Edit FAB */}
          <div className="relative">
            <div className="absolute inset-0 bg-achievement-exercise/30 rounded-full blur-xl animate-pulse"></div>
            <Button
              onClick={handleEdit}
              className="relative w-14 h-14 bg-achievement-exercise hover:bg-achievement-exercise/90 rounded-full shadow-app-xl hover:shadow-app-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <Edit className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}