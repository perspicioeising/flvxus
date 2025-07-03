'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  CalendarCheck,
  Clock,
  Dumbbell,
  PlayCircle,
  Target,
  Calendar,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Star,
  Trophy,
  Zap,
  Heart,
  Flame,
  Eye,
  Expand,
  ListCollapse,
  Info
} from 'lucide-react';
import { format, isToday, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WorkoutPlan } from '../../types';
import { DAYS_OF_WEEK, WORKOUT_LEVELS, WORKOUT_GOALS } from '../../constants';
import { WorkoutDayCardStudent } from './WorkoutDayCardStudent';

interface WorkoutPlanDetailStudentProps {
  plan: WorkoutPlan;
  onStartWorkout: (workoutId: string) => void;
}

export function WorkoutPlanDetailStudent({ plan, onStartWorkout }: WorkoutPlanDetailStudentProps) {
  const router = useRouter();
  
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    schedule: true,
    progress: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calcular estatísticas do plano
  const getStats = () => {
    const startDateValue = plan.startDate || plan.start_date;
    const endDateValue = plan.endDate || plan.end_date;
    
    const startDate = startDateValue ? new Date(startDateValue) : new Date();
    const endDate = endDateValue ? new Date(endDateValue) : new Date();
    
    const duration = startDateValue && endDateValue ? 
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const now = new Date();
    
    let status: 'active' | 'completed' | 'upcoming' = 'active';
    if (endDateValue && endDate < now) {
      status = 'completed';
    } else if (startDateValue && startDate > now) {
      status = 'upcoming';
    }

    // Usar plan.workouts em vez de plan.workout_plan_items
    const workouts = plan.workouts || [];
    const scheduledDays = [...new Set(workouts.map(w => w.dayOfWeek))];
    const uniqueWorkoutIds = [...new Set(workouts.map(w => w.id).filter(Boolean))];
    
    return {
      totalWorkouts: workouts.length,
      totalDays: scheduledDays.length,
      uniqueWorkouts: uniqueWorkoutIds.length,
      duration,
      frequency: scheduledDays.length,
      status
    };
  };

  // Agrupar treinos por dia da semana
  const groupWorkoutsByDay = () => {
    const workouts = plan.workouts || [];
    return workouts.reduce((acc, workout) => {
      if (!workout || typeof workout.dayOfWeek !== 'number') {
        return acc;
      }
      
      const day = workout.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(workout);
      return acc;
    }, {} as Record<number, any[]>);
  };

  const stats = getStats();
  const workoutsByDay = groupWorkoutsByDay();
  const scheduledDays = Object.keys(workoutsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // Status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: 'from-green-500 to-emerald-600', icon: Star };
      case 'upcoming':
        return { label: 'Em Breve', color: 'from-blue-500 to-cyan-600', icon: Calendar };
      case 'completed':
        return { label: 'Concluído', color: 'from-gray-500 to-gray-600', icon: Trophy };
      default:
        return { label: 'Ativo', color: 'from-green-500 to-emerald-600', icon: Star };
    }
  };

  const statusInfo = getStatusInfo(stats.status);

  // Metrics para alunos
  const metrics = [
    {
      value: stats.frequency,
      label: "Frequência",
      color: 'from-app-achievement-workout to-orange-600',
      icon: Calendar,
      suffix: "x semana",
      description: "Dias de treino por semana"
    },
    {
      value: stats.totalWorkouts,
      label: "Sessões",
      color: 'from-blue-500 to-cyan-600',
      icon: Activity,
      suffix: " treinos",
      description: "Total de treinos no plano"
    },
    {
      value: stats.uniqueWorkouts,
      label: "Variedade",
      color: 'from-purple-500 to-pink-600',
      icon: Target,
      suffix: " únicos",
      description: "Treinos diferentes"
    },
    {
      value: stats.duration,
      label: "Duração",
      color: 'from-green-500 to-emerald-600',
      icon: Clock,
      suffix: " dias",
      description: "Período total do plano"
    }
  ];

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl">
        
        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-orange-500/10 to-app-achievement-workout/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl shadow-app-xl">
            <div className="p-4 sm:p-6">
              
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline sm:ml-2 font-semibold">Voltar</span>
                </Button>

                {stats.status === 'active' && (
                  <Button
                    onClick={() => {
                      // Iniciar primeiro treino disponível hoje ou próximo
                      const today = new Date().getDay();
                      const todayWorkouts = workoutsByDay[today];
                      
                      if (todayWorkouts && todayWorkouts[0]?.id) {
                        onStartWorkout(todayWorkouts[0].id);
                      } else {
                        // Encontrar próximo treino disponível
                        for (let i = 1; i <= 7; i++) {
                          const nextDay = (today + i) % 7;
                          const nextWorkouts = workoutsByDay[nextDay];
                          if (nextWorkouts && nextWorkouts[0]?.id) {
                            onStartWorkout(nextWorkouts[0].id);
                            return;
                          }
                        }
                      }
                    }}
                    className="h-10 px-4 sm:h-12 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                  >
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Iniciar </span>Treino
                  </Button>
                )}
              </div>

              {/* Plan Info */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-app-achievement-workout rounded-xl sm:rounded-2xl flex items-center justify-center shadow-app-large">
                    <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading leading-tight break-words">
                    {plan.name}
                  </h1>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-app-text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>
                        {(() => {
                          const startDateValue = plan.startDate || plan.start_date;
                          const endDateValue = plan.endDate || plan.end_date;
                          return `${startDateValue ? format(new Date(startDateValue), 'dd/MM/yyyy') : 'N/A'} - ${endDateValue ? format(new Date(endDateValue), 'dd/MM/yyyy') : 'N/A'}`;
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{stats.frequency}x por semana</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge className={`px-3 py-1 bg-gradient-to-r ${statusInfo.color} text-white rounded-full font-semibold border-0 text-xs`}>
                      <statusInfo.icon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              {plan.description && (
                <p className="text-sm sm:text-base text-app-text-secondary leading-relaxed mt-4">
                  {plan.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          
          {/* Visão Geral */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Visão Geral
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('overview')}
                  className="h-8 w-8 p-0 sm:hidden"
                >
                  {expandedSections.overview ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {(expandedSections.overview || window.innerWidth >= 640) && (
              <CardContent>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    
                    return (
                      <div key={index} className="relative group">
                        <Card className="border-0 bg-app-card rounded-2xl shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">
                                  {metric.label}
                                </p>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg sm:text-xl font-black text-app-heading">
                                    {metric.value}
                                  </span>
                                  <span className="text-sm font-semibold text-app-text-secondary">
                                    {metric.suffix}
                                  </span>
                                </div>
                              </div>
                              
                              <div className={`p-2 bg-gradient-to-br ${metric.color} rounded-lg shadow-app-medium`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            
                            <p className="text-xs text-app-text-muted">
                              {metric.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Info */}
                <div className="p-4 bg-gradient-to-r from-app-bg-secondary/30 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-app-achievement-workout rounded-lg">
                      <Info className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-app-heading mb-2">Sobre este Plano</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-app-text-secondary">Início:</span>
                          <span className="font-semibold text-app-heading text-right">
                            {(() => {
                              const startDateValue = plan.startDate || plan.start_date;
                              return startDateValue ? format(new Date(startDateValue), 'dd/MM/yyyy') : 'N/A';
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-app-text-secondary">Término:</span>
                          <span className="font-semibold text-app-heading text-right">
                            {(() => {
                              const endDateValue = plan.endDate || plan.end_date;
                              return endDateValue ? format(new Date(endDateValue), 'dd/MM/yyyy') : 'N/A';
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-app-text-secondary">Frequência:</span>
                          <span className="font-semibold text-app-heading">
                            {stats.frequency}x por semana
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-app-text-secondary">Total Treinos:</span>
                          <span className="font-semibold text-app-heading">
                            {stats.totalWorkouts} sessões
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Cronograma de Treinos */}
          <Card className="border-0 card-app">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Seus Treinos
                  </CardTitle>
                  <Badge className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent rounded-full text-xs">
                    {scheduledDays.length} dias
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('schedule')}
                  className="h-8 w-8 p-0"
                >
                  {expandedSections.schedule ? (
                    <ListCollapse className="h-4 w-4" />
                  ) : (
                    <Expand className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.schedule && (
              <CardContent>
                {scheduledDays.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-app-text-muted mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-semibold text-app-heading mb-2">
                      Nenhum treino configurado
                    </h4>
                    <p className="text-sm sm:text-base text-app-text-secondary">
                      Entre em contato com seu personal trainer para configurar os treinos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledDays.map((dayNumber) => {
                      const dayWorkouts = workoutsByDay[dayNumber] || [];
                      const dayInfo = DAYS_OF_WEEK.find(d => d.value === dayNumber);
                      const isToday = new Date().getDay() === dayNumber;
                      
                      return (
                        <div key={dayNumber} className={`border border-app-border-muted rounded-xl overflow-hidden ${isToday ? 'ring-2 ring-app-achievement-workout ring-opacity-50' : ''}`}>
                          {/* Day Header */}
                          <div className={`px-4 py-3 ${isToday ? 'bg-gradient-to-r from-app-achievement-workout/20 to-orange-500/20' : 'bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-consecutive/10'}`}>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {dayWorkouts.map((workout, index) => {
                                if (!workout) return null;
                                
                                // Adaptar o workout para o formato esperado pelo WorkoutDayCardStudent
                                const adaptedWorkout = {
                                  id: workout.id,
                                  name: workout.name,
                                  description: workout.description,
                                  level: workout.level,
                                  goal: workout.goal,
                                  workout_exercises: (workout as any).exercises || (workout as any).workout_exercises || []
                                };
                                
                                return (
                                  <WorkoutDayCardStudent
                                    key={`${workout.id}-${index}`}
                                    workout={adaptedWorkout}
                                    onStartWorkout={onStartWorkout}
                                    isToday={isToday}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Calendário Semanal */}
          {scheduledDays.length > 0 && (
            <Card className="border-0 card-app">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                    Calendário Semanal
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const hasWorkout = workoutsByDay[day.value];
                    const workoutCount = hasWorkout?.length || 0;
                    const isToday = new Date().getDay() === day.value;
                    
                    return (
                      <div
                        key={day.value}
                        className={`
                          p-3 rounded-lg text-center border-2 transition-all duration-300
                          ${hasWorkout 
                            ? `border-app-achievement-workout/30 bg-gradient-to-br from-app-achievement-workout/10 to-app-achievement-consecutive/10 ${isToday ? 'ring-2 ring-app-achievement-workout ring-opacity-50' : ''}` 
                            : 'border-app-border-muted bg-gradient-to-br from-app-bg-secondary to-app-bg-card'
                          }
                        `}
                      >
                        <div className={`text-xs font-medium mb-1 ${
                          hasWorkout ? 'text-app-achievement-workout' : 'text-app-text-muted'
                        }`}>
                          {day.short}
                        </div>
                        <div className={`text-lg font-bold ${
                          hasWorkout ? 'text-app-achievement-workout' : 'text-app-text-muted'
                        }`}>
                          {workoutCount}
                        </div>
                        {hasWorkout && (
                          <div className="w-2 h-2 bg-app-achievement-workout rounded-full mx-auto mt-1"></div>
                        )}
                        {isToday && (
                          <div className="text-xs text-app-achievement-workout font-bold mt-1">Hoje</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}