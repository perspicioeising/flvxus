import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell,
  Clock,
  Target,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  Info,
  PlayCircle,
  Users,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { DAYS_OF_WEEK, WORKOUT_LEVELS, WORKOUT_GOALS } from '../../constants';

interface AllUserWorkoutsSectionProps {
  onStartWorkout: (workoutId: string) => void;
}

export function AllUserWorkoutsSection({ onStartWorkout }: AllUserWorkoutsSectionProps) {
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllWorkoutPlans = async () => {
      try {
        const response = await fetch('/api/my-workouts');
        if (response.ok) {
          const data = await response.json();
          setWorkoutPlans(data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar planos de treino:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllWorkoutPlans();
  }, []);

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

  if (isLoading) {
    return (
      <Card className="border-0 card-app">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-achievement-workout"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workoutPlans.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 card-app">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
              Todos os Seus Treinos
            </CardTitle>
            <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-xs">
              {allWorkouts.length} treinos únicos
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllWorkouts(!showAllWorkouts)}
            className="h-8 w-8 p-0"
          >
            {showAllWorkouts ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats gerais sempre visíveis */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <Dumbbell className="h-6 w-6 text-app-achievement-workout mx-auto mb-2" />
            <p className="text-xs text-app-text-muted font-semibold mb-1">Total de Treinos</p>
            <p className="text-xl font-bold text-app-heading">{allWorkouts.length}</p>
          </div>
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <Activity className="h-6 w-6 text-app-achievement-exercise mx-auto mb-2" />
            <p className="text-xs text-app-text-muted font-semibold mb-1">Dias/Semana</p>
            <p className="text-xl font-bold text-app-heading">{scheduledDays.length}</p>
          </div>
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <Target className="h-6 w-6 text-app-achievement-consecutive mx-auto mb-2" />
            <p className="text-xs text-app-text-muted font-semibold mb-1">Planos Ativos</p>
            <p className="text-xl font-bold text-app-heading">{workoutPlans.length}</p>
          </div>
          <div className="text-center p-3 bg-app-bg-secondary rounded-xl border border-app-border-muted">
            <TrendingUp className="h-6 w-6 text-app-achievement-weight mx-auto mb-2" />
            <p className="text-xs text-app-text-muted font-semibold mb-1">Variações</p>
            <p className="text-xl font-bold text-app-heading">
              {[...new Set(allWorkouts.map(w => w.level || 'intermediário'))].length}
            </p>
          </div>
        </div>

        {/* Toggle para mostrar detalhes */}
        <Button
          variant="ghost"
          onClick={() => setShowAllWorkouts(!showAllWorkouts)}
          className="w-full mb-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl py-3"
        >
          <Info className="h-4 w-4 mr-2" />
          {showAllWorkouts ? 'Ocultar' : 'Ver'} Detalhes dos Treinos
          {showAllWorkouts ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>

        {/* Lista detalhada de treinos por dia */}
        {showAllWorkouts && (
          <div className="space-y-4">
            {scheduledDays.map((dayNumber) => {
              const dayWorkouts = workoutsByDay[dayNumber] || [];
              const dayInfo = DAYS_OF_WEEK.find(d => d.value === dayNumber);
              const isToday = new Date().getDay() === dayNumber;
              
              return (
                <div key={dayNumber} className={`border border-app-border-muted rounded-xl overflow-hidden ${isToday ? 'ring-2 ring-app-achievement-workout ring-opacity-30' : ''}`}>
                  {/* Day Header */}
                  <div className={`px-4 py-3 ${isToday ? 'bg-gradient-to-r from-app-achievement-workout/15 to-orange-500/15 dark:from-app-achievement-workout/25 dark:to-orange-500/25' : 'bg-gradient-to-r from-app-bg-secondary to-app-bg-tertiary'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-app-achievement-workout" />
                        <h4 className="text-base font-semibold text-app-heading">
                          {dayInfo?.label}
                        </h4>
                        {isToday && (
                          <Badge className="px-2 py-0.5 bg-app-achievement-workout text-white rounded-full text-xs font-bold animate-pulse">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayWorkouts.map((workout: { workout_exercises: string | any[]; level: string; goal: string; id: string; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; planName: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, index: any) => {
                        const exerciseCount = workout.workout_exercises?.length || 0;
                        const estimatedDuration = exerciseCount * 3;
                        const levelConfig = WORKOUT_LEVELS[workout.level?.toLowerCase() as keyof typeof WORKOUT_LEVELS] || WORKOUT_LEVELS.intermediario;
                        const goalConfig = WORKOUT_GOALS[workout.goal?.toLowerCase() as keyof typeof WORKOUT_GOALS];
                        
                        return (
                          <div key={`${workout.id}-${index}`} className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-app-medium ${
                            isToday 
                              ? 'bg-gradient-to-br from-app-achievement-workout/10 to-orange-500/10 dark:from-app-achievement-workout/20 dark:to-orange-500/20 border-app-achievement-workout/50 hover:border-app-achievement-workout/70' 
                              : 'bg-app-card border-app-border-muted hover:border-app-achievement-workout/50'
                          }`}>
                            
                            {/* Header do workout */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-app-heading text-sm truncate mb-1">
                                  {workout.name}
                                </h5>
                                <p className="text-xs text-app-text-muted">
                                  📋 {workout.planName}
                                </p>
                              </div>
                              
                              <div className="flex-shrink-0 ml-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isToday ? 'bg-app-achievement-workout' : 'bg-app-bg-secondary border border-app-border-muted'
                                }`}>
                                  <Dumbbell className={`h-4 w-4 ${isToday ? 'text-white' : 'text-app-achievement-workout'}`} />
                                </div>
                              </div>
                            </div>
                            
                            {/* Stats do workout */}
                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-app-achievement-exercise" />
                                <span className="text-app-text-secondary">{exerciseCount} exercícios</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-app-achievement-workout" />
                                <span className="text-app-text-secondary">~{estimatedDuration}min</span>
                              </div>
                            </div>
                            
                            {workout.description && (
                              <p className="text-xs text-app-text-secondary line-clamp-2 mb-3">
                                {workout.description}
                              </p>
                            )}
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge className={`px-2 py-0.5 text-xs rounded-full ${levelConfig.color}`}>
                                {levelConfig.label}
                              </Badge>
                              {goalConfig && (
                                <Badge className={`px-2 py-0.5 text-xs rounded-full ${goalConfig.color}`}>
                                  {goalConfig.label}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Action Button */}
                            <Button
                              onClick={() => onStartWorkout(workout.id)}
                              size="sm"
                              className={`w-full font-semibold rounded-lg transition-all duration-200 ${
                                isToday
                                  ? 'bg-app-achievement-workout hover:bg-app-achievement-workout/90 text-white shadow-app-medium hover:shadow-app-large'
                                  : 'bg-app-bg-secondary hover:bg-app-achievement-exercise hover:text-white border border-app-border-accent text-app-text-primary'
                              }`}
                            >
                              <PlayCircle className="h-3 w-3 mr-1" />
                              {isToday ? 'Treinar Agora' : 'Iniciar Treino'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumo por planos */}
        {showAllWorkouts && (
          <div className="mt-6 p-4 bg-gradient-to-r from-app-bg-secondary/30 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-app-achievement-workout rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-app-heading mb-2">Seus Planos de Treino</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {workoutPlans.map((plan, index) => (
                    <div key={plan.id} className="flex justify-between">
                      <span className="text-app-text-secondary truncate">📋 {plan.name}:</span>
                      <span className="font-semibold text-app-heading ml-2">
                        {plan.workouts?.length || 0} treinos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}