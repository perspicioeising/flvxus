// components/workout-plans/components/details/WorkoutDayCard.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell, 
  Play, 
  Target, 
  Trophy, 
  Zap, 
  Heart, 
  Users,
  Clock,
  Activity
} from 'lucide-react';

interface WorkoutDayCardProps {
  workout: any;
  onStartWorkout?: (workoutId: string) => void;
  userRole: 'trainer' | 'student';
}

export function WorkoutDayCard({ workout, onStartWorkout, userRole }: WorkoutDayCardProps) {
  const getLevelColor = (level?: string): string => {
    if (!level) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    
    switch (level.toLowerCase()) {
      case 'iniciante':
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediário':
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'avançado':
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

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

  const getGoalColor = (goal?: string): string => {
    if (!goal) return 'text-gray-500';
    
    switch (goal.toLowerCase()) {
      case 'hipertrofia':
      case 'muscle gain':
        return 'text-orange-600 dark:text-orange-400';
      case 'emagrecimento':
      case 'weight loss':
        return 'text-red-600 dark:text-red-400';
      case 'resistência':
      case 'endurance':
        return 'text-blue-600 dark:text-blue-400';
      case 'força':
      case 'strength':
        return 'text-purple-600 dark:text-purple-400';
      case 'condicionamento':
      case 'conditioning':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const levelColor = getLevelColor(workout.level);
  const GoalIcon = getGoalIcon(workout.goal);
  const goalColor = getGoalColor(workout.goal);

  // Calcular stats do treino
  const exerciseCount = workout.exercises?.length || 0;
  const estimatedDuration = exerciseCount * 3; // 3 min por exercício em média

  return (
    <div className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h5 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
              {workout.name}
            </h5>
            {workout.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
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
            <GoalIcon className={`w-5 h-5 ${goalColor}`} />
          </div>
        </div>

        {/* Tags e Info */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {workout.level && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${levelColor}`}>
              {workout.level}
            </span>
          )}
          
          {workout.goal && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 ${goalColor}`}>
              {workout.goal}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            {exerciseCount > 0 && (
              <div className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>{exerciseCount} exercícios</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>~{estimatedDuration} min</span>
            </div>
          </div>
        </div>

        {/* Action Button for Students */}
        {userRole === 'student' && onStartWorkout && workout.id && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onStartWorkout(workout.id);
            }}
            size="sm"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-green-500/25 transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Iniciar Treino
          </Button>
        )}

        {/* Visual Indicator for Trainers */}
        {userRole === 'trainer' && workout.is_template && (
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                Template
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}