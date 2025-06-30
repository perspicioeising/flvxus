// components/workouts/detail/components/WorkoutExerciseList.tsx
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
import { WorkoutExerciseListProps } from './types';
import { Activity, ListOrdered } from 'lucide-react';

export function WorkoutExerciseList({ 
  exercises, 
  onExerciseView, 
  userRole 
}: WorkoutExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
        <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-app-achievement-workout/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-app-border-accent">
              <Activity className="h-10 w-10 text-app-achievement-workout" />
            </div>
            <h3 className="text-xl font-bold text-app-text-heading mb-2">
              Nenhum exercício encontrado
            </h3>
            <p className="text-app-text-secondary">
              Este treino ainda não possui exercícios configurados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
      <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-app-border-muted/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-app-text-heading flex items-center gap-3">
              <div className="w-10 h-10 bg-achievement-workout rounded-xl flex items-center justify-center">
                <ListOrdered className="h-5 w-5 text-white" />
              </div>
              Sequência de Exercícios
            </h2>
            <div className="text-sm font-medium text-app-text-muted">
              {exercises.length} exercício{exercises.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-4 sm:p-6 ">
          <div className="space-y-4 ">
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
          <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-consecutive/10 rounded-2xl border border-app-border-accent">
            <h3 className="text-lg font-bold text-app-achievement-workout mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resumo do Treino
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-app-achievement-workout">
                  {exercises.length}
                </p>
                <p className="text-sm text-app-text-muted">Exercícios</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-app-achievement-workout">
                  {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                </p>
                <p className="text-sm text-app-text-muted">Séries</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-app-achievement-workout">
                  {Math.round(exercises.reduce((sum, ex) => sum + ex.rest, 0) / exercises.length)}s
                </p>
                <p className="text-sm text-app-text-muted">Descanso Médio</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-app-achievement-workout">
                  {Array.from(new Set(exercises.flatMap(ex => ex.exercise.muscle_group))).length}
                </p>
                <p className="text-sm text-app-text-muted">Grupos Musculares</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}