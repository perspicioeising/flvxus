// components/workouts/detail/components/WorkoutExerciseList.tsx
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
import { WorkoutExerciseListProps } from './types';
import { Dumbbell, ListOrdered } from 'lucide-react';

export function WorkoutExerciseList({ 
  exercises, 
  onExerciseView, 
  userRole 
}: WorkoutExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-2xl blur-md"></div>
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Nenhum exercício encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Este treino ainda não possui exercícios configurados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-2xl blur-md"></div>
      <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <ListOrdered className="h-5 w-5 text-white" />
              </div>
              Sequência de Exercícios
            </h2>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {exercises.length} exercício{exercises.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-6">
          <div className="space-y-4">
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
          <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200 dark:border-red-700">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Resumo do Treino
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {exercises.length}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Exercícios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Séries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {Math.round(exercises.reduce((sum, ex) => sum + ex.rest, 0) / exercises.length)}s
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Descanso Médio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {Array.from(new Set(exercises.flatMap(ex => ex.exercise.muscle_group))).length}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Grupos Musculares</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}