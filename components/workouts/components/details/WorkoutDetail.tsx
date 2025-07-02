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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  ListOrdered, 
  BarChart3, 
  Info,
  ListCollapse,
  Expand,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutDetailProps {
  workoutId: string;
  userRole?: string;
}

export function WorkoutDetail({ workoutId, userRole = 'trainer' }: WorkoutDetailProps) {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Estado para seções expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    exercises: false,
    stats: false,
    info: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    router.push(`/dashboard/workouts/${workoutId}/start`);
  };

  const handleExerciseView = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleCloseExerciseModal = () => {
    setSelectedExercise(null);
  };

  if (isLoading) {
    return <WorkoutDetailSkeleton />;
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-app-gradient">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl shadow-app-xl">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        
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

        <div className="space-y-4 sm:space-y-6">
          
          {/* Visão Geral Section */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Visão Geral
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('overview')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.overview ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" /> 
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.overview && (
              <CardContent>
                <WorkoutStatsCard
                  stats={stats!}
                  level={workout.level}
                  goal={workout.goal}
                />
              </CardContent>
            )}
          </Card>

          {/* Exercícios Section */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <ListOrdered className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Sequência de Exercícios
                  </CardTitle>
                  <div className="text-sm font-medium text-app-text-muted bg-app-bg-secondary px-3 py-1 rounded-full border border-app-border-accent">
                    {workout.workout_exercises?.length || 0} {(workout.workout_exercises?.length || 0) !== 1}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('exercises')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.exercises ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.exercises && (
              <CardContent>
                <WorkoutExerciseList
                  exercises={workout.workout_exercises || []}
                  onExerciseView={handleExerciseView}
                  userRole={userRole}
                />
              </CardContent>
            )}
          </Card>

          {/* Estatísticas Section */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Estatísticas Detalhadas
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('stats')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.stats ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" /> 
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.stats && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Intensity Analysis */}
                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                    <h4 className="font-bold text-app-heading mb-3">Intensidade</h4>
                    <div className="text-2xl font-black text-app-achievement-workout mb-1"> 
                      {(stats?.totalExercises || 0) >= 8 ? 'Alta' : 
                       (stats?.totalExercises || 0) >= 5 ? 'Moderada' : 'Básica'}
                    </div>
                    <p className="text-xs text-app-text-muted">{stats?.totalExercises} exercícios</p>
                  </div>
                  
                  {/* Volume Analysis */}
                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                    <h4 className="font-bold text-app-heading mb-3">Volume</h4>
                    <div className="text-2xl font-black text-app-achievement-consecutive mb-1">
                      {stats?.totalSets || 0}
                    </div>
                    <p className="text-xs text-app-text-muted">séries totais</p>
                  </div>

                  {/* Complexity */}
                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                    <h4 className="font-bold text-app-heading mb-3">Complexidade</h4>
                    <div className="text-2xl font-black text-app-achievement-exercise mb-1"> 
                      {(stats?.muscleGroups?.length || 0) >= 4 ? 'Alta' : 
                       (stats?.muscleGroups?.length || 0) >= 2 ? 'Moderada' : 'Básica'}
                    </div>
                    <p className="text-xs text-app-text-muted">{(stats?.muscleGroups?.length || 0)} grupos musculares</p>
                  </div>

                  {/* Equipment Dependency */}
                  <div className="p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted">
                    <h4 className="font-bold text-app-heading mb-3">Equipamentos</h4>
                    <div className="text-2xl font-black text-app-achievement-weight mb-1">
                      {stats?.equipmentNeeded.length || 0}
                    </div>
                    <p className="text-xs text-app-text-muted">tipos necessários</p>
                  </div> 
                </div>
              </CardContent>
            )}
          </Card>

          {/* Informações Adicionais Section */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Informações do Treino
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('info')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.info ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" /> 
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.info && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-app-heading">Dados Básicos</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-app-text-secondary">Criado em:</span>
                        <span className="text-sm font-semibold text-app-heading">
                          {format(new Date(workout.created_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {workout.updated_at !== workout.created_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-app-text-secondary">Atualizado em:</span>
                          <span className="text-sm font-semibold text-app-heading">
                            {format(new Date(workout.updated_at), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-app-text-secondary">Nível:</span>
                        <span className="text-sm font-semibold text-app-heading">
                          {workout.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-app-text-secondary">Objetivo:</span>
                        <span className="text-sm font-semibold text-app-heading">
                          {workout.goal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-app-heading">Métricas</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-app-text-secondary">Duração estimada:</span>
                        <span className="text-sm font-semibold text-app-heading">
                          ~{stats?.estimatedDuration} minutos
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-app-text-secondary">Descanso médio:</span>
                        <span className="text-sm font-semibold text-app-heading">
                          {stats?.averageRest} segundos
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-app-text-secondary">Total de séries:</span>
                        <span className="text-sm font-semibold text-app-heading">
                          {stats?.totalSets || 0} séries
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {workout.notes && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-app-achievement-workout rounded-lg">
                        <Info className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-app-heading mb-2">Observações do Treino</h4>
                        <p className="text-sm text-app-text-primary leading-relaxed">
                          {workout.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de detalhes do exercício */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={!!selectedExercise}
        onClose={handleCloseExerciseModal}
      />
    </div>
  );
}