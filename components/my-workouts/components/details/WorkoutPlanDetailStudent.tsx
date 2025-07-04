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
import { AllUserWorkoutsSection } from './AllUserWorkoutsSection';

interface WorkoutPlanDetailStudentProps {
  plan: WorkoutPlan;
  onStartWorkout: (workoutId: string) => void;
}

export function WorkoutPlanDetailStudent({ plan, onStartWorkout }: WorkoutPlanDetailStudentProps) {
  const router = useRouter();
  
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    schedule: true,
    allWorkouts: false,
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
          
         

          {/* Todos os Treinos do Usuário */}
          <AllUserWorkoutsSection onStartWorkout={onStartWorkout} />

          {/* Cronograma Resumido deste Plano Específico */}
          {scheduledDays.length > 0 && (
            <Card className="border-0 card-app">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-app-achievement-consecutive rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-app-heading">
                      Calendário - {plan.name}
                    </CardTitle>
                    <Badge className="px-2 py-1 bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent rounded-full text-xs">
                      {scheduledDays.length} dias
                    </Badge>
                  </div>
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
                            ? `border-app-achievement-consecutive/40 bg-gradient-to-br from-app-achievement-consecutive/10 to-app-achievement-consecutive/5 dark:from-app-achievement-consecutive/20 dark:to-app-achievement-consecutive/10 ${isToday ? 'ring-2 ring-app-achievement-consecutive ring-opacity-50' : ''}` 
                            : 'border-app-border-muted bg-gradient-to-br from-app-bg-secondary to-app-bg-card'
                          }
                        `}
                      >
                        <div className={`text-xs font-medium mb-1 ${
                          hasWorkout ? 'text-app-achievement-consecutive' : 'text-app-text-muted'
                        }`}>
                          {day.short}
                        </div>
                        <div className={`text-lg font-bold ${
                          hasWorkout ? 'text-app-achievement-consecutive' : 'text-app-text-muted'
                        }`}>
                          {workoutCount}
                        </div>
                        {hasWorkout && (
                          <div className="w-2 h-2 bg-app-achievement-consecutive rounded-full mx-auto mt-1"></div>
                        )}
                        {isToday && (
                          <div className="text-xs text-app-achievement-consecutive font-bold mt-1">Hoje</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Informação adicional sobre este plano */}
                <div className="mt-4 p-3 bg-gradient-to-r from-app-achievement-consecutive/5 to-app-achievement-consecutive/10 dark:from-app-achievement-consecutive/10 dark:to-app-achievement-consecutive/15 rounded-xl border border-app-achievement-consecutive/20">
                  <p className="text-sm text-app-text-secondary text-center">
                    📅 Este é o calendário específico do plano "<strong className="text-app-heading">{plan.name}</strong>"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}