import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  PlayCircle,
  Clock,
  Target
} from 'lucide-react';
import { TodayWorkoutCard } from '../cards/TodayWorkoutCard';

interface TodayWorkoutsListProps {
  workouts: any[];
  onStartWorkout: (workoutId: string, planId: string) => void;
  className?: string;
}

export function TodayWorkoutsList({ workouts, onStartWorkout, className = '' }: TodayWorkoutsListProps) {
  if (workouts.length === 0) {
    return (
      <Card className={`border-0 card-app ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center shadow-app-medium">
              <Sun className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-app-heading">
              Treinos de Hoje
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-app-bg-secondary rounded-2xl flex items-center justify-center mb-4 border border-app-border-muted">
              <Sun className="h-6 w-6 text-app-text-muted" />
            </div>
            <h4 className="text-base font-semibold text-app-heading mb-2">
              Dia de Descanso
            </h4>
            <p className="text-sm text-app-text-secondary">
              Aproveite para relaxar e se recuperar. Seus músculos agradecem!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 card-app ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center shadow-app-medium">
              <Sun className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-app-heading">
              Treinos de Hoje
            </CardTitle>
          </div>
          
          <Badge className="px-3 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-achievement-workout/20 rounded-full text-xs font-semibold">
            {workouts.length} treino{workouts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {workouts.map((workout, index) => (
            <TodayWorkoutCard
              key={`${workout.id}-${index}`}
              workout={workout}
              onStartWorkout={onStartWorkout}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}