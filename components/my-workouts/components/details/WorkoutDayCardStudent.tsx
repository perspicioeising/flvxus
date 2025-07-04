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
    <div className={`group relative bg-app-card backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden hover:shadow-app-medium hover:scale-[1.02] ${
      isToday 
        ? 'border-app-achievement-workout/50 ring-2 ring-app-achievement-workout/30 bg-gradient-to-br from-app-achievement-workout/5 to-orange-500/5 dark:from-app-achievement-workout/10 dark:to-orange-500/10' 
        : 'border-app-border-muted hover:border-app-achievement-workout/40'
    }`}>
      
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
          <div className={`ml-3 p-2 rounded-lg border transition-all duration-200 ${
            isToday 
              ? 'bg-app-achievement-workout border-app-achievement-workout/20' 
              : 'bg-app-bg-secondary border-app-border-muted hover:border-app-achievement-workout/30'
          }`}>
            <GoalIcon className={`w-5 h-5 ${
              isToday 
                ? 'text-white' 
                : goalConfig?.color || 'text-app-achievement-workout'
            }`} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={`px-2.5 py-1 rounded-full text-xs font-medium ${levelConfig.color}`}>
            {levelConfig.label}
          </Badge>
          
          {workout.goal && goalConfig && (
            <Badge className={`px-2.5 py-1 rounded-full text-xs font-medium ${goalConfig.color}`}>
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
          className={`w-full font-bold rounded-xl shadow-app-medium transition-all duration-300 group-hover:scale-105 ${
            isToday 
              ? 'bg-gradient-to-r from-app-achievement-workout to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-app-large' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-app-large'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          {isToday ? 'Iniciar Agora' : 'Iniciar Treino'}
        </Button>
      </div>
    </div>
  );
}