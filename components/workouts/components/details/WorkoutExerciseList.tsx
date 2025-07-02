// components/workouts/detail/components/WorkoutExerciseList.tsx
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
import { WorkoutExerciseListProps } from './types';
import { Activity, Dumbbell, Hash, Clock, Target, Star, Crown, PieChart } from 'lucide-react';

export function WorkoutExerciseList({ 
  exercises, 
  onExerciseView, 
  userRole 
}: WorkoutExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="relative mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-app-bg-secondary rounded-2xl flex items-center justify-center shadow-app-large border border-app-border-accent">
            <Dumbbell className="h-8 w-8 sm:h-10 sm:w-10 text-app-text-muted" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-app-text-muted/30 via-app-achievement-workout/30 to-app-text-muted/30 rounded-2xl blur-2xl animate-pulse"></div>
        </div>
        <h4 className="text-base sm:text-lg font-semibold text-app-heading mb-2">
          Nenhum exercício configurado
        </h4>
        <p className="text-sm sm:text-base text-app-text-secondary">
          Este treino ainda não possui exercícios adicionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exercise List */}
      <div className="space-y-6">
        {exercises
          .sort((a, b) => a.order - b.order)
          .map((exercise, index) => (
            <WorkoutExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onView={onExerciseView}
              userRole={userRole}
            />
          ))}
      </div>

      {/* Workout Summary */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-2xl blur-lg"></div>
        <div className="relative p-6 bg-gradient-to-r from-app-bg-secondary/30 via-app-achievement-workout/10 to-app-bg-secondary/30 rounded-2xl border border-app-border-muted shadow-app-medium">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="p-3 bg-app-achievement-workout rounded-xl shadow-app-large">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-app-achievement-workout">
                Resumo do Treino
              </h3>
              <p className="text-app-text-secondary">
                Visão geral das métricas
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Exercises */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout/20 to-app-achievement-workout/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative text-center p-4 bg-app-card rounded-xl border border-app-border-muted shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-app-medium group-hover:shadow-app-large transition-all duration-300">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-black text-app-achievement-workout mb-1">
                  {exercises.length}
                </p>
                <p className="text-sm text-app-text-muted font-medium">Exercícios</p>
              </div>
            </div>
            
            {/* Total Sets */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-consecutive/20 to-app-achievement-consecutive/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative text-center p-4 bg-app-card rounded-xl border border-app-border-muted shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-app-achievement-consecutive to-app-btn-secondary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-app-medium group-hover:shadow-app-large transition-all duration-300">
                  <Hash className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-black text-app-achievement-consecutive mb-1">
                  {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                </p>
                <p className="text-sm text-app-text-muted font-medium">Séries</p>
              </div>
            </div>
            
            {/* Average Rest */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-weight/20 to-app-achievement-weight/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative text-center p-4 bg-app-card rounded-xl border border-app-border-muted shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-app-achievement-weight to-app-text-accent rounded-xl flex items-center justify-center mx-auto mb-3 shadow-app-medium group-hover:shadow-app-large transition-all duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-black text-app-achievement-weight mb-1">
                  {Math.round(exercises.reduce((sum, ex) => sum + ex.rest, 0) / exercises.length)}s
                </p>
                <p className="text-sm text-app-text-muted font-medium">Descanso Médio</p>
              </div>
            </div>
            
            {/* Muscle Groups */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-exercise/20 to-app-achievement-exercise/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative text-center p-4 bg-app-card rounded-xl border border-app-border-muted shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-app-achievement-exercise to-app-btn-accent rounded-xl flex items-center justify-center mx-auto mb-3 shadow-app-medium group-hover:shadow-app-large transition-all duration-300">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-black text-app-achievement-exercise mb-1">
                  {Array.from(new Set(exercises.flatMap(ex => ex.exercise.muscle_group))).length}
                </p>
                <p className="text-sm text-app-text-muted font-medium">Grupos Musculares</p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
              <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                <Activity className="h-4 w-4 text-app-achievement-workout" />
                Intensidade:
              </span>
              <span className="text-sm font-bold text-app-heading">
                {exercises.length >= 8 ? 'Alta' : exercises.length >= 5 ? 'Moderada' : 'Básica'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
              <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                <Hash className="h-4 w-4 text-app-achievement-workout" />
                Volume Total:
              </span>
              <span className="text-sm font-bold text-app-heading">
                {exercises.reduce((sum, ex) => sum + (ex.sets * parseInt(ex.reps.toString())), 0)} reps
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-app-card rounded-xl">
              <span className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                <Clock className="h-4 w-4 text-app-achievement-workout" />
                Tempo Total:
              </span>
              <span className="text-sm font-bold text-app-heading">
                ~{Math.round((exercises.reduce((sum, ex) => sum + (ex.sets * ex.rest), 0) + exercises.length * 60) / 60)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}