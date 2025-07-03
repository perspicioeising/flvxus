import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock,
  Target
} from 'lucide-react';
import { UpcomingWorkoutCard } from '../cards/UpcomingWorkoutCard';

interface UpcomingWorkoutsListProps {
  workouts: any[];
  onStartWorkout: (workoutId: string, planId: string) => void;
  className?: string;
}

export function UpcomingWorkoutsList({ workouts, onStartWorkout, className = '' }: UpcomingWorkoutsListProps) {
  if (workouts.length === 0) {
    return null; // Não mostrar se não há treinos futuros
  }

  return (
    <Card className={`border-0 card-app ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-app-heading">
              Próximos Treinos
            </CardTitle>
          </div>
          
          <Badge className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">
            {workouts.length} próximo{workouts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {workouts.map((workout, index) => (
            <UpcomingWorkoutCard
              key={`${workout.id}-${workout.dayOfWeek}-${index}`}
              workout={workout}
              onStartWorkout={onStartWorkout}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


