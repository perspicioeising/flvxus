// components/workouts/detail/components/WorkoutExerciseCard.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Dumbbell, 
  Hash, 
  Target, 
  Clock, 
  StickyNote,
  Play,
  Info
} from 'lucide-react';
import { WorkoutExerciseCardProps } from './types';

export function WorkoutExerciseCard({ 
  exercise, 
  index, 
  onView, 
  userRole 
}: WorkoutExerciseCardProps) {
  return (
    <div className="group relative">
      {/* Connection line for visual flow */}
      {index > 0 && (
        <div className="absolute -top-4 left-8 w-0.5 h-4 bg-gradient-to-b from-red-300 to-transparent dark:from-red-600"></div>
      )}
      
      <div className="relative p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:transform group-hover:scale-[1.02]">
        
        {/* Exercise Number & Main Info */}
        <div className="flex items-start gap-4 mb-4">
          
          {/* Exercise Number */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">{index + 1}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Dumbbell className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Exercise Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {exercise.exercise.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {exercise.exercise.description}
                </p>
              </div>
              
              {/* View Exercise Button */}
              <Button
                onClick={() => onView(exercise.exercise)}
                size="sm"
                variant="outline"
                className="flex-shrink-0 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>

            {/* Muscle Groups */}
            <div className="flex flex-wrap gap-2 mb-4">
              {exercise.exercise.muscle_group.slice(0, 3).map((muscle) => (
                <Badge
                  key={muscle}
                  className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-600 text-xs font-medium"
                >
                  {muscle}
                </Badge>
              ))}
              {exercise.exercise.muscle_group.length > 3 && (
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs">
                  +{exercise.exercise.muscle_group.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          
          {/* Sets */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Séries</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{exercise.sets}</p>
            </div>
          </div>

          {/* Reps */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Reps</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{exercise.reps}</p>
            </div>
          </div>

          {/* Rest */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Descanso</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{exercise.rest}s</p>
            </div>
          </div>

          {/* Duration (if exists) */}
          {exercise.duration ? (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Duração</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{exercise.duration}s</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl opacity-60">
              <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Tempo</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Livre</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes (if exists) */}
        {exercise.notes && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <StickyNote className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Observações:</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 leading-relaxed">
                  {exercise.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Equipment (if exists) */}
        {exercise.exercise.equipment && exercise.exercise.equipment.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Equipamentos:</span>
            <div className="flex flex-wrap gap-1">
              {exercise.exercise.equipment.slice(0, 3).map((eq) => (
                <Badge
                  key={eq}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {eq}
                </Badge>
              ))}
              {exercise.exercise.equipment.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{exercise.exercise.equipment.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Student Action Button */}
        {userRole === 'student' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Exercício
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}