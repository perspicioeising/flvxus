import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Target,
  Dumbbell,
  PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DAYS_OF_WEEK, WORKOUT_LEVELS } from '../../constants';

interface UpcomingWorkoutCardProps {
  workout: any;
  onStartWorkout: (workoutId: string, planId: string) => void;
  className?: string;
}

export function UpcomingWorkoutCard({ workout, onStartWorkout, className = '' }: UpcomingWorkoutCardProps) {
  const levelConfig = WORKOUT_LEVELS[workout.level?.toLowerCase() as keyof typeof WORKOUT_LEVELS] || WORKOUT_LEVELS.intermediario;
  const dayInfo = DAYS_OF_WEEK.find(d => d.value === workout.dayOfWeek);
  
  const exerciseCount = workout.workout_exercises?.length || 0;
  const estimatedDuration = exerciseCount * 3;

  return (
    <Card className={`border-0 card-app group hover:shadow-app-medium transition-all duration-300 ${className}`}>
      <CardContent className="p-3 sm:p-4">
        {/* Date Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-app-achievement-workout" />
            <div className="text-xs">
              <p className="font-semibold text-app-heading">
                {dayInfo?.short}
              </p>
              <p className="text-app-text-muted">
                {format(workout.scheduledDate, 'dd/MM', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <Badge className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelConfig.color}`}>
            {levelConfig.label}
          </Badge>
        </div>

        {/* Workout Info */}
        <div className="space-y-2 mb-3">
          <h5 className="text-sm font-semibold text-app-heading truncate">
            {workout.name}
          </h5>
          
          <div className="flex items-center justify-between text-xs text-app-text-muted">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{exerciseCount} ex.</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>~{estimatedDuration}min</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={() => onStartWorkout(workout.id, workout.planId)}
          variant="outline"
          size="sm"
          className="w-full text-xs border-app-border-accent hover:bg-app-achievement-workout hover:text-white hover:border-app-achievement-workout transition-colors"
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          Executar
        </Button>
      </CardContent>
    </Card>
  );
}