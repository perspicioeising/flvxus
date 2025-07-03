// components/my-workouts/components/cards/WorkoutPlanCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarCheck, 
  Clock, 
  Dumbbell, 
  ChevronRight,
  Calendar,
  Target,
  Users,
  Activity
} from 'lucide-react';
import { format, isToday, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WorkoutPlan } from '../../types';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onViewPlan: (planId: string) => void;
  className?: string;
}

export function WorkoutPlanCard({ plan, onViewPlan, className = '' }: WorkoutPlanCardProps) {
  const isActive = () => {
    const today = new Date();
    const startDate = new Date(plan.start_date || plan.startDate || '');
    const endDate = new Date(plan.end_date || plan.endDate || '');
    return (isBefore(startDate, today) || isToday(startDate)) && 
           (isAfter(endDate, today) || isToday(endDate));
  };

  // Usar nova estrutura (workouts) ou fallback para antiga (workout_plan_items)
  const getWorkoutCount = () => {
    if (plan.workouts) {
      return plan.workouts.length;
    }
    return plan.workout_plan_items?.length || 0;
  };

  const getUniqueDays = () => {
    if (plan.workouts) {
      const days = plan.workouts.map(w => w.dayOfWeek);
      return [...new Set(days)].length;
    }
    
    const days = plan.workout_plan_items?.map(item => item.day_of_week) || [];
    return [...new Set(days)].length;
  };

  const getPlanStatus = () => {
    if (!isActive()) {
      return { label: 'Inativo', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
    }
    return { label: 'Ativo', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  const status = getPlanStatus();
  const workoutCount = getWorkoutCount();
  const uniqueDays = getUniqueDays();
  const startDate = plan.start_date || plan.startDate || '';
  const endDate = plan.end_date || plan.endDate || '';

  return (
    <Card className={`border-0 card-app group hover:shadow-app-large transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="h-5 w-5 text-app-achievement-workout" />
              <h3 className="text-lg font-bold text-app-heading truncate">
                {plan.name}
              </h3>
            </div>
            
            {plan.description && (
              <p className="text-sm text-app-text-secondary line-clamp-2 mb-3">
                {plan.description}
              </p>
            )}
            
            {/* Status and Info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </Badge>
              
              <div className="flex items-center gap-1 text-xs text-app-text-muted">
                <Dumbbell className="h-3 w-3" />
                <span>{workoutCount} treinos</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-app-text-muted">
                <Activity className="h-3 w-3" />
                <span>{uniqueDays}x semana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {startDate && endDate && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs text-app-text-secondary">
              <span>Período do plano</span>
              <span>{Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-app-text-muted">
              <Clock className="h-3 w-3" />
              <span>
                {format(new Date(startDate), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(endDate), 'dd/MM/yy', { locale: ptBR })}
              </span>
            </div>
          </div>
        )}

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-app-bg-secondary rounded-lg">
            <p className="text-lg font-bold text-app-heading">{workoutCount}</p>
            <p className="text-xs text-app-text-muted">Treinos</p>
          </div>
          <div className="text-center p-2 bg-app-bg-secondary rounded-lg">
            <p className="text-lg font-bold text-app-heading">{uniqueDays}</p>
            <p className="text-xs text-app-text-muted">Dias/Sem</p>
          </div>
          <div className="text-center p-2 bg-app-bg-secondary rounded-lg">
            <p className="text-lg font-bold text-app-heading">
              {workoutCount > 0 ? Math.round(workoutCount * 25) : 0}
            </p>
            <p className="text-xs text-app-text-muted">Min/Sem</p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onViewPlan(plan.id)}
          className="w-full bg-gradient-to-r from-app-achievement-workout to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-app-medium hover:shadow-app-large transition-all duration-300 group-hover:scale-105"
        >
          Ver Treinos
          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}