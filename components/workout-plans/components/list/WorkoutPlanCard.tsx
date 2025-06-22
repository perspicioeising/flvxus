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
        {/* Sophisticated hover effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-700"></div>
        
        <Card className="relative h-full bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:border-gray-300/80 dark:group-hover:border-gray-700/80 cursor-pointer"
          onClick={handleView}
        >
          
          {/* Innovative background pattern */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.008]" 
                 style={{
                   backgroundImage: `
                     linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                   `,
                   backgroundSize: '20px 20px'
                 }}>
            </div>
            
            {/* Static geometric shapes */}
            <div className="absolute top-4 right-6 w-8 h-8 border border-blue-400/15 dark:border-blue-500/20 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
            <div className="absolute bottom-6 left-8 w-6 h-6 border border-green-400/15 dark:border-green-500/20 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          </div>

          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Header com background gradient */}
          <div className="relative h-32 bg-gradient-to-br from-green-500 to-green-600 overflow-hidden flex items-center justify-center">
            {/* Efeito de background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-6 translate-y-6"></div>
            </div>

            {/* Ícone principal */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <CalendarCheck className="h-8 w-8 text-white" />
              </div>

              {/* Badge de status */}
              <div className="absolute -bottom-2 -right-2">
                <Badge className={`px-2 py-1 text-xs font-bold ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                } rounded-full shadow-lg`}>
                  {isActive ? 'A' : 'C'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Corpo do card */}
          <CardContent className="flex-1 p-5 flex flex-col">
            {/* Título e aluno */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {plan.name}
              </h3>
              
              {/* Aluno com ícone */}
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {plan.student?.full_name}
                </span>
              </div>

              {/* Descrição */}
              {plan.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {plan.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="mt-auto pt-2 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-green-600">{workoutCount}</span> treinos
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600">{duration}</span> dias
                  </span>
                </div>
              </div>

              {/* Action buttons */}
             
            </div>
          </CardContent>

          {/* Elegant bottom highlight */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 via-green-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="relative group">
      {/* Sophisticated hover effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-700"></div>
      
      <Card className="relative h-full bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:border-gray-300/80 dark:group-hover:border-gray-700/80 cursor-pointer"
        onClick={handleView}
      >
        
        {/* Innovative background pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.008]" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                 `,
                 backgroundSize: '20px 20px'
               }}>
          </div>
          
          {/* Static geometric shapes - Hidden on mobile */}
          <div className="hidden lg:block absolute top-4 right-6 w-8 h-8 border border-blue-400/15 dark:border-blue-500/20 rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="hidden lg:block absolute bottom-6 left-8 w-6 h-6 border border-green-400/15 dark:border-green-500/20 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
        </div>

        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <CardContent className="relative p-4 sm:p-6">
          <div className="lg:hidden space-y-4">
            {/* Header Mobile */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                
                <div className="relative w-14 h-14 bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <CalendarCheck className="h-7 w-7 text-white" />
                  
                  <div className="absolute inset-1 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300 pr-2">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-gray-400'}`}></div>
                    <span className={`text-xs font-medium ${isActive ? 'text-emerald-600 dark:text-emerald-300' : 'text-gray-500'}`}>
                      {isActive ? 'ATIVO' : 'CONCLUÍDO'}
                    </span>
                  </div>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
                    {plan.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{plan.student?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{workoutCount} treinos</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800/60 text-xs px-2.5 py-1 font-medium">
                    <Users className="h-3 w-3 mr-1.5" />
                    {plan.student?.full_name}
                  </Badge>
                  <Badge className="bg-green-50 text-green-700 border border-green-200/70 dark:bg-green-950/60 dark:text-green-200 dark:border-green-800/60 text-xs px-2.5 py-1 font-medium">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {duration} dias
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CalendarCheck className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                  
                  <div className="absolute inset-2 border border-white/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl"></div>
                </div>
                
                <div className="absolute -bottom-1 -right-1 w-6 h-6">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-25"></div>
                  <div className="relative w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 border-3 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-xl">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                        {isActive ? 'ATIVO' : 'CONCLUÍDO'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {plan.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2.5">
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50 text-xs px-3 py-1.5 font-medium">
                    <Users className="h-3 w-3 mr-2" />
                    {plan.student?.full_name}
                  </Badge>
                  <Badge className="bg-green-50 text-green-700 border border-green-200/70 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50 text-xs px-3 py-1.5 font-medium">
                    <Activity className="h-3 w-3 mr-2" />
                    {workoutCount} treinos
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 text-xs px-3 py-1.5 font-medium">
                    <Clock className="h-3 w-3 mr-2" />
                    {duration} dias
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Elegant bottom highlight */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 via-green-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      </Card>
    </div>
  );
}