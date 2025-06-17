import React from 'react';
import { Calendar, Clock, Target, Dumbbell, Users, Trophy, Zap, Heart, Play, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkoutPlan, WorkoutPlanItem } from '../../types/index';
import { DAYS_OF_WEEK } from '../../constants';

// Tipo para os dias da semana baseado na constante
type DayOfWeek = typeof DAYS_OF_WEEK[number];

interface WorkoutPlanScheduleProps {
  plan: WorkoutPlan;
  className?: string;
  onStartWorkout?: (workoutId: string) => void;
  userRole?: 'trainer' | 'student';
}

// Funções auxiliares com tratamento de valores opcionais
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

const getDayName = (dayNumber: number): string => {
  const day = DAYS_OF_WEEK.find((d) => d.value === dayNumber);
  return day?.label || `Dia ${dayNumber}`;
};

const getDayShort = (dayNumber: number): string => {
  const day = DAYS_OF_WEEK.find((d) => d.value === dayNumber);
  return day?.short || `D${dayNumber}`;
};

// Agrupar treinos por dia da semana com verificação de segurança
const groupWorkoutsByDay = (workouts: WorkoutPlanItem[] = []): Record<number, WorkoutPlanItem[]> => {
  return workouts.reduce((acc, item) => {
    if (!item || typeof item.day_of_week !== 'number') {
      return acc;
    }
    
    const day = item.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {} as Record<number, WorkoutPlanItem[]>);
};

// Análise simplificada do plano
const analyzePlan = (workouts: WorkoutPlanItem[]) => {
  if (!workouts.length) return null;
  
  // Contagem de objetivos - filtrar e garantir que são strings
  const goals = workouts
    .map(w => w.workout?.goal)
    .filter((goal): goal is string => Boolean(goal) && typeof goal === 'string');
  
  const goalCounts = goals.reduce((acc: Record<string, number>, goal: string) => {
    acc[goal] = (acc[goal] || 0) + 1;
    return acc;
  }, {});
  const mainGoal = Object.entries(goalCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
  
  // Variedade de treinos - filtrar e garantir que são strings
  const uniqueWorkoutIds = workouts
    .map(w => w.workout?.id)
    .filter((id): id is string => Boolean(id) && typeof id === 'string');
  
  const uniqueWorkouts = [...new Set(uniqueWorkoutIds)];
  const variety = uniqueWorkouts.length === workouts.length ? 'Alta' : 
                 uniqueWorkouts.length >= workouts.length * 0.7 ? 'Moderada' : 'Baixa';
  
  return { mainGoal, variety, uniqueCount: uniqueWorkouts.length };
};

export function WorkoutPlanSchedule({ 
  plan, 
  className = '',
  onStartWorkout,
  userRole = 'trainer'
}: WorkoutPlanScheduleProps) {
  const workoutsByDay = groupWorkoutsByDay(plan?.workouts);
  const scheduledDays = Object.keys(workoutsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const analysis = analyzePlan(plan?.workouts || []);

  const handleStartWorkout = (workoutId: string) => {
    if (onStartWorkout && workoutId) {
      onStartWorkout(workoutId);
    }
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Cronograma Semanal */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-2 sm:px-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Cronograma Semanal
          </h3>
          
          {/* Indicador de Frequência */}
          {scheduledDays.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Activity className="w-4 h-4" />
              <span className="font-medium">{scheduledDays.length}x por semana</span>
            </div>
          )}
        </div>

        {scheduledDays.length === 0 ? (
          <div className="relative mx-2 sm:mx-0">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
              <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum treino agendado
              </h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Este plano ainda não possui treinos configurados para nenhum dia da semana.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {scheduledDays.map((dayNumber) => {
              const dayWorkouts = workoutsByDay[dayNumber] || [];
              
              return (
                <div
                  key={dayNumber}
                  className="relative mx-2 sm:mx-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 via-orange-500/5 to-orange-600/5 rounded-xl sm:rounded-2xl blur-lg"></div>
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
                    {/* Cabeçalho do Dia */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base sm:text-lg font-semibold text-white">
                          {getDayName(dayNumber)}
                        </h4>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-orange-100">
                          <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">
                            {dayWorkouts.length} treino{dayWorkouts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Treinos do Dia */}
                    <div className="p-3 sm:p-6">
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {dayWorkouts.map((item, index) => {
                          if (!item?.workout) {
                            return null;
                          }

                          const workout = item.workout;
                          const levelColor = getLevelColor(workout.level);
                          const GoalIcon = getGoalIcon(workout.goal);
                          const goalColor = getGoalColor(workout.goal);

                          return (
                            <div
                              key={`${item.id}-${index}`}
                              className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200/30 dark:border-orange-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                            >
                              {/* Cabeçalho do Treino */}
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex-1 min-w-0 pr-2">
                                  <h5 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                                    {workout.name}
                                  </h5>
                                  {workout.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                      {workout.description}
                                    </p>
                                  )}
                                </div>
                                <GoalIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${goalColor} flex-shrink-0`} />
                              </div>

                              {/* Tags e Informações */}
                              <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                                {workout.level && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelColor}`}>
                                    {workout.level}
                                  </span>
                                )}
                                
                                {workout.goal && (
                                  <span className={`text-xs font-medium ${goalColor} truncate`}>
                                    {workout.goal}
                                  </span>
                                )}
                              </div>

                              {/* Botão de Ação para Estudantes */}
                              {userRole === 'student' && onStartWorkout && workout.id && (
                                <Button
                                  onClick={() => handleStartWorkout(workout.id)}
                                  size="sm"
                                  className="w-full text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-green-500/25 transition-all duration-300"
                                >
                                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                  Iniciar Treino
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendário Visual da Semana */}
      {scheduledDays.length > 0 && (
        <div className="relative mx-2 sm:mx-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-orange-500/10 to-orange-600/10 rounded-xl sm:rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-orange-200/50 dark:border-orange-800/30 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              Distribuição Semanal
            </h3>
            
            {/* Grid do Calendário */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
              {DAYS_OF_WEEK.map((day: DayOfWeek) => {
                const hasWorkout = workoutsByDay[day.value];
                const workoutCount = hasWorkout?.length || 0;
                
                return (
                  <div
                    key={day.value}
                    className={`
                      group p-2 sm:p-3 rounded-lg sm:rounded-xl text-center border-2 transition-all duration-300 cursor-pointer hover:scale-105
                      ${hasWorkout 
                        ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-700 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-lg hover:shadow-orange-500/20' 
                        : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700/50 hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`text-xs font-medium mb-1 transition-colors ${
                      hasWorkout 
                        ? 'text-orange-700 dark:text-orange-300 group-hover:text-orange-800 dark:group-hover:text-orange-200' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}>
                      {day.short}
                    </div>
                    <div className={`text-sm sm:text-lg font-bold transition-colors ${
                      hasWorkout 
                        ? 'text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300' 
                        : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-500'
                    }`}>
                      {workoutCount}
                    </div>
                    {hasWorkout && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mx-auto mt-1 group-hover:bg-orange-600 transition-colors"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Análise do Plano */}
            {analysis && (
              <div className="border-t border-orange-200/50 dark:border-orange-700/50 pt-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  Resumo do Plano
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Objetivo Principal */}
                  {analysis.mainGoal && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Foco Principal</span>
                      </div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{analysis.mainGoal}</div>
                    </div>
                  )}

                  {/* Variedade */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Variedade</span>
                    </div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">{analysis.variety}</div>
                    <div className="text-xs text-green-500">{analysis.uniqueCount} treinos únicos</div>
                  </div>

                  {/* Frequência */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Frequência</span>
                    </div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{scheduledDays.length}x Semana</div>
                    <div className="text-xs text-purple-500">
                      {scheduledDays.length >= 5 ? 'Alta intensidade' : 
                       scheduledDays.length >= 3 ? 'Moderada' : 'Básica'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}