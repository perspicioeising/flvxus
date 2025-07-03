// components/my-workouts/components/details/WorkoutDayCardStudent.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Play, 
  Target, 
  Trophy, 
  Zap, 
  Heart, 
  Users,
  Clock,
  Activity,
  Star,
  Flame
} from 'lucide-react';
import { WORKOUT_LEVELS, WORKOUT_GOALS } from '../../constants';

interface WorkoutDayCardStudentProps {
  workout: any;
  onStartWorkout: (workoutId: string) => void;
  isToday?: boolean;
}

export function WorkoutDayCardStudent({ workout, onStartWorkout, isToday = false }: WorkoutDayCardStudentProps) {
  const levelConfig = WORKOUT_LEVELS[workout.level?.toLowerCase() as keyof typeof WORKOUT_LEVELS] || WORKOUT_LEVELS.intermediario;
  const goalConfig = WORKOUT_GOALS[workout.goal?.toLowerCase() as keyof typeof WORKOUT_GOALS];

  // Calcular stats do treino
  const exerciseCount = workout.workout_exercises?.length || 0;
  const estimatedDuration = exerciseCount * 3; // 3 min por exercício em média

  const getGoalIcon = (goal?: string) => {
    if (!goal) return Users;
    
    switch (goal.toLowerCase()) {
      case 'hipertrofia':
      case 'muscle gain':
        return Dumbbell;
      case 'emagrecimento':
      case 'weight loss':
        return Zap;
      case 'resistência':
      case 'endurance':
        return Heart;
      case 'força':
      case 'strength':
        return Trophy;
      case 'condicionamento':
      case 'conditioning':
        return Target;
      default:
        return Users;
    }
  };

  const GoalIcon = getGoalIcon(workout.goal);

  return (
    <div className={`group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-[1.02] ${
      isToday 
        ? 'border-app-achievement-workout/50 ring-2 ring-app-achievement-workout ring-opacity-30' 
        : 'border-gray-200/30 dark:border-gray-700/30'
    }`}>
      
      {/* Glow effect para hoje */}
      {isToday && (
        <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout/10 to-orange-500/10 opacity-100"></div>
      )}
      
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isToday && (
                <Badge className="px-2 py-0.5 bg-app-achievement-workout text-white rounded-full text-xs font-bold animate-pulse">
                  <Flame className="h-3 w-3 mr-1" />
                  Hoje
                </Badge>
              )}
            </div>
            
            <h5 className="text-base font-bold text-app-heading truncate mb-1">
              {workout.name}
            </h5>
            
            {workout.description && (
              <p className="text-xs text-app-text-secondary line-clamp-2">
                {workout.description}
              </p>
            )}
          </div>
          
          {/* Goal Icon */}
          <div className={`ml-3 p-2 rounded-lg bg-gradient-to-br ${
            workout.goal?.toLowerCase().includes('hipertrofia') ? 'from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20' :
            workout.goal?.toLowerCase().includes('emagrecimento') ? 'from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20' :
            workout.goal?.toLowerCase().includes('força') ? 'from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20' :
            'from-gray-100 to-gray-200 dark:from-gray-900/20 dark:to-gray-800/20'
          }`}>
            <GoalIcon className={`w-5 h-5 ${goalConfig?.color || 'text-gray-600'}`} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={`px-2.5 py-1 rounded-full text-xs font-medium ${levelConfig.color}`}>
            {levelConfig.label}
          </Badge>
          
          {workout.goal && goalConfig && (
            <Badge className={`px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 ${goalConfig.color}`}>
              {goalConfig.label}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-app-text-muted mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>{exerciseCount} exercícios</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>~{estimatedDuration} min</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onStartWorkout(workout.id)}
          className={`w-full font-bold rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 ${
            isToday 
              ? 'bg-gradient-to-r from-app-achievement-workout to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-orange-500/25' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-green-500/25'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          {isToday ? 'Iniciar Agora' : 'Iniciar Treino'}
        </Button>
      </div>
    </div>
  );
}