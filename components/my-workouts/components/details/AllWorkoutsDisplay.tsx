import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2,
  Clock,
  Target,
  Dumbbell,
  Play,
  ChevronDown,
  ChevronUp,
  Info,
  Activity,
  Calendar
} from 'lucide-react';
import { DAYS_OF_WEEK } from '../../constants';

interface AllWorkoutsDisplayProps {
  exercises: any[];
  session: any;
  currentIndex: number;
  workoutPlans?: any[];
}

export function AllWorkoutsDisplay({ exercises, session, currentIndex, workoutPlans }: AllWorkoutsDisplayProps) {
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  
  if (!workoutPlans || workoutPlans.length === 0) {
    return null;
  }

  // Coletar TODOS os treinos únicos de todos os planos
  const getAllUniqueWorkouts = () => {
    const allWorkouts = new Map();
    
    workoutPlans.forEach(plan => {
      if (plan.workouts) {
        plan.workouts.forEach((workout: any) => {
          if (!allWorkouts.has(workout.id)) {
            allWorkouts.set(workout.id, {
              ...workout,
              planName: plan.name,
              planId: plan.id
            });
          }
        });
      }
    });
    
    return Array.from(allWorkouts.values());
  };

  const allWorkouts = getAllUniqueWorkouts();
  
  // Agrupar treinos por dia da semana
  const workoutsByDay = allWorkouts.reduce((acc, workout) => {
    const day = workout.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(workout);
    return acc;
  }, {} as Record<number, any[]>);

  const scheduledDays = Object.keys(workoutsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Card className="border-0 card-app mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-app-heading">Todos os Seus Treinos</h3>
          </div>
          <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout rounded-full text-sm">
            {allWorkouts.length} treinos únicos
          </Badge>
        </div>
        
        {/* Stats gerais */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
            <Dumbbell className="h-5 w-5 text-app-achievement-workout mx-auto mb-1" />
            <p className="text-xs text-app-text-muted mb-1">Total</p>
            <p className="text-lg font-bold text-app-heading">{allWorkouts.length}</p>
          </div>
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
            <Activity className="h-5 w-5 text-app-achievement-exercise mx-auto mb-1" />
            <p className="text-xs text-app-text-muted mb-1">Dias/Semana</p>
            <p className="text-lg font-bold text-app-heading">{scheduledDays.length}</p>
          </div>
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl">
            <Target className="h-5 w-5 text-app-achievement-consecutive mx-auto mb-1" />
            <p className="text-xs text-app-text-muted mb-1">Planos</p>
            <p className="text-lg font-bold text-app-heading">{workoutPlans.length}</p>
          </div>
        </div>

        {/* Toggle para mostrar todos */}
        <Button
          variant="ghost"
          onClick={() => setShowAllWorkouts(!showAllWorkouts)}
          className="w-full mb-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl py-3"
        >
          <Info className="h-4 w-4 mr-2" />
          {showAllWorkouts ? 'Ocultar' : 'Ver'} Todos os Treinos
          {showAllWorkouts ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>

        {/* Lista detalhada de treinos */}
        {showAllWorkouts && (
          <div className="space-y-4">
            {scheduledDays.map((dayNumber) => {
              const dayWorkouts = workoutsByDay[dayNumber] || [];
              const dayInfo = DAYS_OF_WEEK.find(d => d.value === dayNumber);
              const isToday = new Date().getDay() === dayNumber;
              
              return (
                <div key={dayNumber} className={`border border-app-border-muted rounded-xl overflow-hidden ${isToday ? 'ring-2 ring-app-achievement-workout ring-opacity-30' : ''}`}>
                  {/* Day Header */}
                  <div className={`px-4 py-3 ${isToday ? 'bg-gradient-to-r from-app-achievement-workout/20 to-orange-500/20' : 'bg-gradient-to-r from-app-bg-secondary to-app-bg-tertiary'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-app-heading">
                          {dayInfo?.label}
                        </h4>
                        {isToday && (
                          <Badge className="px-2 py-0.5 bg-app-achievement-workout text-white rounded-full text-xs font-bold">
                            Hoje
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-app-achievement-workout">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Workouts List */}
                  <div className="p-4 space-y-3">
                    {dayWorkouts.map((workout: { workout_exercises: string | any[]; id: any; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; planName: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; level: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; goal: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, index: any) => {
                      const exerciseCount = workout.workout_exercises?.length || 0;
                      const estimatedDuration = exerciseCount * 3;
                      
                      return (
                        <div key={`${workout.id}-${index}`} className="p-3 bg-app-card rounded-xl border border-app-border-muted hover:border-app-achievement-workout/50 transition-all duration-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-app-heading text-sm truncate">
                                {workout.name}
                              </h5>
                              <p className="text-xs text-app-text-muted">
                                {workout.planName}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-app-text-secondary">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{exerciseCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>~{estimatedDuration}min</span>
                              </div>
                            </div>
                          </div>
                          
                          {workout.description && (
                            <p className="text-xs text-app-text-secondary line-clamp-1 mb-2">
                              {workout.description}
                            </p>
                          )}
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {workout.level && (
                              <Badge className="px-2 py-0.5 bg-app-bg-secondary text-app-text-muted text-xs rounded-full">
                                {workout.level}
                              </Badge>
                            )}
                            {workout.goal && (
                              <Badge className="px-2 py-0.5 bg-app-achievement-workout/10 text-app-achievement-workout text-xs rounded-full">
                                {workout.goal}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumo atual (compatibilidade) */}
        {!showAllWorkouts && exercises && exercises.length > 0 && (
          <div>
            <h4 className="font-semibold text-app-heading mb-3">Exercício Atual</h4>
            <Progress value={((currentIndex + 1) / exercises.length) * 100} className="h-2 mb-4" />
            
            <div className="grid grid-cols-4 gap-2">
              {exercises.slice(0, 8).map((exercise, index) => {
                const isCurrent = index === currentIndex;
                
                return (
                  <div
                    key={exercise.exercise?.id || index}
                    className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                      isCurrent ? 'border-app-achievement-workout bg-app-achievement-workout/10' : 'border-app-border-muted bg-app-bg-secondary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                      isCurrent ? 'bg-app-achievement-workout' : 'bg-app-bg-tertiary'
                    }`}>
                      <Play className={`h-3 w-3 ${isCurrent ? 'text-white' : 'text-app-text-muted'}`} />
                    </div>
                    <p className="text-xs font-medium text-app-text-muted">
                      Ex. {index + 1}
                    </p>
                  </div>
                );
              })}
              
              {exercises.length > 8 && (
                <div className="p-2 rounded-lg border border-app-border-muted text-center bg-app-bg-secondary">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1 bg-app-bg-tertiary">
                    <Dumbbell className="h-3 w-3 text-app-text-muted" />
                  </div>
                  <p className="text-xs font-medium text-app-text-muted">
                    +{exercises.length - 8}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}