import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  Clock, 
  Target,
  Dumbbell,
  Star,
  Zap
} from 'lucide-react';
import { WORKOUT_LEVELS, WORKOUT_GOALS } from '../../constants';

interface TodayWorkoutCardProps {
  workout: any;
  onStartWorkout: (workoutId: string, planId: string) => void;
  className?: string;
}

export function TodayWorkoutCard({ workout, onStartWorkout, className = '' }: TodayWorkoutCardProps) {
  const levelConfig = WORKOUT_LEVELS[workout.level?.toLowerCase() as keyof typeof WORKOUT_LEVELS] || WORKOUT_LEVELS.intermediario;
  const goalConfig = WORKOUT_GOALS[workout.goal?.toLowerCase() as keyof typeof WORKOUT_GOALS];
  
  const exerciseCount = workout.exercises?.length || workout.workout_exercises?.length || 0;
  const estimatedDuration = exerciseCount * 3; // 3 min por exercício

  return (
    <Card className={`border-0 card-app group hover:shadow-app-large transition-all duration-300 hover:scale-[1.02] border border-app-border-muted hover:border-app-achievement-workout/50 ${className}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-app-heading truncate mb-1">
              {workout.name}
            </h4>
            <p className="text-xs text-app-text-muted mb-2">
              {workout.planName}
            </p>
            
            {workout.description && (
              <p className="text-xs text-app-text-secondary line-clamp-2">
                {workout.description}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-3">
            <div className="w-10 h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center shadow-app-medium">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Info Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelConfig.color}`}>
            {levelConfig.label}
          </Badge>
          
          {goalConfig && (
            <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium bg-app-bg-secondary border border-app-border-accent ${goalConfig.color}`}>
              {goalConfig.label}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-app-text-muted mb-4">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-app-achievement-exercise" />
            <span>{exerciseCount} exercícios</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-app-achievement-workout" />
            <span>~{estimatedDuration} min</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onStartWorkout(workout.id, workout.planId)}
          className="w-full bg-app-achievement-consecutive hover:bg-app-achievement-consecutive/90 text-white font-bold rounded-xl shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Iniciar Agora
        </Button>
      </CardContent>
    </Card>
  );
}