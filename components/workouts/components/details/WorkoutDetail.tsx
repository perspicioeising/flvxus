'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutDetail, useWorkoutActions } from './hooks';
import { WorkoutDetailSkeleton } from './WorkoutDetailSkeleton';
import { WorkoutDetailHeader } from './WorkoutDetailHeader';
import { WorkoutStatsCard } from './WorkoutStatsCard';
import { WorkoutExerciseList } from './WorkoutExerciseList';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { Exercise } from '../../types';

interface WorkoutDetailProps {
  workoutId: string;
  userRole?: string;
}

export function WorkoutDetail({ workoutId, userRole = 'trainer' }: WorkoutDetailProps) {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const {
    workout,
    stats,
    isLoading,
    error,
    refreshWorkout
  } = useWorkoutDetail(workoutId);

  const {
    isCloning,
    isDeleting,
    cloneWorkout,
    deleteWorkout
  } = useWorkoutActions();

  const handleEdit = () => {
    router.push(`/dashboard/workouts/${workoutId}/edit`);
  };

  const handleClone = async () => {
    if (workout) {
      await cloneWorkout(workout);
    }
  };

  const handleDelete = async () => {
    if (workout) {
      await deleteWorkout(workout);
    }
  };

  const handleStartWorkout = () => {
    // Implementar lógica para iniciar treino (futuro)
    router.push(`/dashboard/workouts/${workoutId}/start`);
  };

  // Função simplificada - apenas abre o modal
  const handleExerciseView = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  // Função para fechar o modal
  const handleCloseExerciseModal = () => {
    setSelectedExercise(null);
  };

  if (isLoading) {
    return <WorkoutDetailSkeleton />;
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-app-gradient">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-app-achievement-workout/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-app-border-accent">
              <span className="text-4xl">😞</span>
            </div>
            <h2 className="text-2xl font-bold text-app-text-heading mb-4">
              Treino não encontrado
            </h2>
            <p className="text-app-text-secondary mb-8">
              {error || 'O treino que você está procurando não existe ou foi removido.'}
            </p>
            <button
              onClick={() => router.push('/dashboard/workouts')}
              className="px-6 py-3 bg-achievement-workout hover:bg-app-achievement-workout/90 text-white font-semibold rounded-xl transition-all duration-300"
            >
              ← Voltar para Treinos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        
        {/* Header com ações */}
        <WorkoutDetailHeader
          workout={workout}
          stats={stats!}
          userRole={userRole}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
          onStartWorkout={handleStartWorkout}
          isLoading={isCloning || isDeleting}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Estatísticas do treino */}
          <div className="lg:col-span-1">
            <WorkoutStatsCard
              stats={stats!}
              level={workout.level}
              goal={workout.goal}
            />
          </div>

          {/* Lista de exercícios */}
          <div className="lg:col-span-3">
            <WorkoutExerciseList
              exercises={workout.workout_exercises || []}
              onExerciseView={handleExerciseView}
              userRole={userRole}
            />
          </div>
        </div>
      </div>

      {/* Modal de detalhes do exercício - funciona em mobile e desktop */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={handleCloseExerciseModal}
      />
    </div>
  );
}