import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CalendarCheck, 
  Users, 
  Calendar, 
  Dumbbell, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Clock,
  Target
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
        {/* Efeito de glow no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Card principal */}
        <Card
          className="relative h-full border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
          onClick={handleView}
        >
          {/* Borda gradiente animada */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          {/* Conteúdo do card */}
          <div className="relative flex flex-col h-full">
            {/* Header com background gradient */}
            <div className="relative h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-t-2xl overflow-hidden flex items-center justify-center">
              {/* Efeito de background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-6 translate-y-6"></div>
              </div>

              {/* Ícone principal */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                  <CalendarCheck className="h-8 w-8 text-white" />
                </div>

                {/* Badge de status */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`px-2 py-1 text-xs font-bold ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {plan.name}
                </h3>
                
                {/* Aluno com ícone */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600">
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
                    <Dumbbell className="h-3 w-3 text-orange-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-orange-600">{workoutCount}</span> treinos
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
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView();
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit();
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClone();
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clonar</TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  // List view - Exatamente igual ao dos treinos
  return (
    <div className="group relative">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <Card className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-500 border border-orange-200/60 dark:border-orange-700/60 hover:border-orange-300/60 dark:hover:border-orange-600/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 group-hover:scale-[1.01]">
        <CardContent className="p-4 sm:p-6">
          
          {/* Mobile-optimized layout */}
          <div className="space-y-4">
            
            {/* Header section */}
            <div className="flex items-start gap-3 sm:gap-4">
              
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-20 blur-lg" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                
                {/* Title and badges */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300 truncate">
                      {plan.name}
                    </h3>
                    
                    {/* Badge de status */}
                    <Badge className={`self-start rounded-full px-2 sm:px-3 py-1 text-xs font-semibold ${
                      isActive 
                        ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600'
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600'
                    }`}>
                      {isActive ? 'Ativo' : 'Concluído'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {plan.description && (
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats section */}
            <div className="flex items-center justify-between">
              
              {/* Left stats */}
              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">{plan.student?.full_name}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">{workoutCount}</span> treinos
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{duration}</span> dias
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                
                {/* View button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleView}
                      disabled={isLoading}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver detalhes</TooltipContent>
                </Tooltip>

                {/* Edit button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleEdit}
                      disabled={isLoading}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar plano</TooltipContent>
                </Tooltip>

                {/* Clone button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleClone}
                      disabled={isLoading}
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clonar plano</TooltipContent>
                </Tooltip>

                {/* Delete button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir plano</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}