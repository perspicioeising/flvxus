
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CalendarCheck, 
  Users, 
  Calendar, 
  Activity, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { WorkoutPlanCardProps } from '../../types';

interface ExtendedWorkoutPlanCardProps extends WorkoutPlanCardProps {
  viewMode?: 'grid' | 'list';
}

export function WorkoutPlanCard({
  plan,
  onView,
  onEdit,
  onClone,
  onDelete,
  isLoading,
  viewMode = 'grid'
}: ExtendedWorkoutPlanCardProps) {
  const isActive = new Date(plan.end_date) >= new Date();
  const workoutCount = plan.workouts?.length || 0;
  const duration = Math.ceil((new Date(plan.end_date).getTime() - new Date(plan.start_date).getTime()) / (1000 * 60 * 60 * 24));

  const handleView = () => onView(plan.id);
  const handleEdit = () => onEdit(plan.id);
  const handleClone = () => onClone(plan);
  const handleDelete = () => onDelete(plan);

  if (viewMode === 'grid') {
    return (
      <div className="relative group h-full">
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-achievement-consecutive/20 to-app-achievement-workout/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Main card */}
        <Card
          className="relative h-full border-0 card-app transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
          onClick={handleView}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-achievement-workout rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-app-bg-card rounded-2xl"></div>

          {/* Card content */}
          <div className="relative flex flex-col h-full">
            {/* Header com background gradient */}
            <div className="relative h-32 sm:h-36 bg-achievement-workout rounded-t-2xl overflow-hidden flex items-center justify-center">
              {/* Background particles effect */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full transform translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full transform -translate-x-6 sm:-translate-x-8 translate-y-6 sm:translate-y-8"></div>
              </div>

              {/* Main icon */}
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center shadow-app-xl transform group-hover:scale-110 transition-transform duration-300">
                  <CalendarCheck className="text-2xl sm:text-3xl text-white h-8 w-8 sm:h-10 sm:w-10" />
                </div>

                {/* Status badge */}
                <div className="absolute -bottom-1 -right-1">
                  <div className="w-6 h-6 bg-app-achievement-consecutive rounded-full flex items-center justify-center shadow-app-medium">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card body */}
            <CardContent className="flex-1 p-4 sm:p-5 flex flex-col">
              {/* Título e aluno */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-app-text-primary line-clamp-1 mb-2 group-hover:text-app-achievement-workout transition-colors">
                  {plan.name}
                </h3>
                
                {/* Aluno com ícone */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-app-achievement-consecutive">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-app-text-secondary truncate">
                    {plan.student?.full_name}
                  </span>
                </div>

                {/* Descrição */}
                {plan.description && (
                  <p className="text-app-text-secondary text-sm line-clamp-2">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div className="mb-3 sm:mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isActive 
                    ? 'bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent'
                    : 'bg-app-bg-secondary text-app-text-muted border border-app-border-muted'
                }`}>
                  {isActive ? 'ATIVO' : 'CONCLUÍDO'}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-auto pt-2 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-app-achievement-workout" />
                    <span className="text-app-text-secondary">
                      <span className="font-semibold text-app-achievement-workout">{workoutCount}</span> treinos
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-app-achievement-consecutive" />
                    <span className="text-app-text-secondary">
                      <span className="font-semibold text-app-achievement-consecutive">{duration}</span> dias
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="relative group">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-consecutive/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <Card
        className="relative border-0 card-app cursor-pointer transition-all duration-300 group-hover:scale-[1.01]"
        onClick={handleView}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout/20 via-app-achievement-consecutive/20 to-app-achievement-workout/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                
                <div className="relative w-14 h-14 bg-achievement-workout rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-app-xl group-hover:shadow-app-xl transition-all duration-300">
                  <CalendarCheck className="h-7 w-7 text-white" />
                  
                  <div className="absolute inset-1 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5">
                  <div className="absolute inset-0 bg-app-achievement-consecutive rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-5 h-5 bg-app-achievement-consecutive border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-app-medium">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-app-text-primary truncate group-hover:text-app-achievement-workout transition-colors duration-300 pr-2">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-app-achievement-consecutive' : 'bg-app-text-muted'}`}></div>
                    <span className={`text-xs font-medium ${isActive ? 'text-app-achievement-consecutive' : 'text-app-text-muted'}`}>
                      {isActive ? 'ATIVO' : 'CONCLUÍDO'}
                    </span>
                  </div>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-app-text-secondary truncate mb-3">
                    {plan.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-app-achievement-consecutive rounded-full"></div>
                    <span className="text-xs text-app-text-secondary font-medium">{plan.student?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-app-achievement-workout rounded-full"></div>
                    <span className="text-xs text-app-text-secondary font-medium">{workoutCount} treinos</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent text-xs px-2.5 py-1 font-medium rounded-full">
                    <Users className="h-3 w-3 mr-1.5 inline" />
                    {plan.student?.full_name}
                  </span>
                  <span className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-xs px-2.5 py-1 font-medium rounded-full">
                    <Clock className="h-3 w-3 mr-1.5 inline" />
                    {duration} dias
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-large">
                  <CalendarCheck className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                  
                  <div className="absolute inset-2 border border-white/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl"></div>
                </div>
                
                <div className="absolute -bottom-1 -right-1 w-6 h-6">
                  <div className="absolute inset-0 bg-app-achievement-consecutive rounded-full animate-ping opacity-25"></div>
                  <div className="relative w-6 h-6 bg-app-achievement-consecutive border-3 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-app-xl">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-app-text-primary group-hover:text-app-achievement-workout transition-colors duration-300">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-app-achievement-consecutive' : 'bg-app-text-muted'}`}></div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-app-achievement-consecutive' : 'text-app-text-muted'}`}>
                        {isActive ? 'ATIVO' : 'CONCLUÍDO'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-app-text-secondary mb-3">
                    {plan.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2.5">
                  <span className="bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent text-xs px-3 py-1.5 font-medium rounded-full">
                    <Users className="h-3 w-3 mr-2 inline" />
                    {plan.student?.full_name}
                  </span>
                  <span className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-xs px-3 py-1.5 font-medium rounded-full">
                    <Activity className="h-3 w-3 mr-2 inline" />
                    {workoutCount} treinos
                  </span>
                  <span className="bg-app-achievement-weight/10 text-app-achievement-weight border border-app-border-accent text-xs px-3 py-1.5 font-medium rounded-full">
                    <Clock className="h-3 w-3 mr-2 inline" />
                    {duration} dias
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
