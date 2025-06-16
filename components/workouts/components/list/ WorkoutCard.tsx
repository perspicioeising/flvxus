// components/workouts/components/list/WorkoutCard.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Dumbbell, 
  Target, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Clock,
  Sparkles
} from "lucide-react";
import { WorkoutCardProps } from '../../types';
import { DIFFICULTY_LEVELS, WORKOUT_GOALS } from '../../constants';

interface ExtendedWorkoutCardProps extends WorkoutCardProps {
  viewMode?: 'grid' | 'list';
}

export function WorkoutCard({ 
  workout, 
  onView, 
  onEdit, 
  onClone, 
  onDelete,
  isLoading = false,
  viewMode = 'grid'
}: ExtendedWorkoutCardProps) {
  
  const getLevelConfig = (level: string) => {
    return DIFFICULTY_LEVELS.find(l => l.value === level) || DIFFICULTY_LEVELS[0];
  };

  const getGoalConfig = (goal: string) => {
    return WORKOUT_GOALS.find(g => g.value === goal) || WORKOUT_GOALS[0];
  };

  const levelConfig = getLevelConfig(workout.level);
  const goalConfig = getGoalConfig(workout.goal);
  const GoalIcon = goalConfig.icon;

  const exerciseCount = workout.workout_exercises?.length || 0;
  const estimatedTime = Math.round(exerciseCount * 2.5);

  if (viewMode === 'grid') {
    return (
      <div className="relative group h-full">
        {/* Efeito de glow no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-rose-500/20 to-pink-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Card principal */}
        <Card
          className="relative h-full border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
          onClick={() => onView(workout.id)}
        >
          {/* Borda gradiente animada */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>

          {/* Conteúdo do card */}
          <div className="relative flex flex-col h-full">
            {/* Header com background gradient */}
            <div className="relative h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-t-2xl overflow-hidden flex items-center justify-center">
              {/* Efeito de background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-6 translate-y-6"></div>
              </div>

              {/* Ícone principal */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>

                {/* Badge de nível */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`px-2 py-1 text-xs font-bold bg-gradient-to-r ${levelConfig.color} text-white rounded-full shadow-lg`}>
                    {levelConfig.label.charAt(0)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Corpo do card */}
            <CardContent className="flex-1 p-5 flex flex-col">
              {/* Título e objetivo */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {workout.name}
                </h3>
                
                {/* Objetivo com ícone */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${goalConfig.color}`}>
                    <GoalIcon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {goalConfig.label}
                  </span>
                </div>

                {/* Descrição */}
                {workout.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {workout.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-auto pt-2 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-pink-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-pink-600">{exerciseCount}</span> exercícios
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-blue-600">~{estimatedTime}</span> min
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
                            onView(workout.id);
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
                            onEdit(workout.id);
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
                            onClone(workout);
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
                          onDelete(workout);
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

  // List view
  return (
    <div className="group relative">
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <Card className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-500 border border-pink-200/60 dark:border-pink-700/60 hover:border-pink-300/60 dark:hover:border-pink-600/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-pink-500/10 group-hover:scale-[1.01]">
        <CardContent className="p-4 sm:p-6">
          
          {/* Mobile-optimized layout */}
          <div className="space-y-4">
            
            {/* Header section */}
            <div className="flex items-start gap-3 sm:gap-4">
              
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full opacity-20 blur-lg" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                  <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                
                {/* Title and badges */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-300 truncate">
                      {workout.name}
                    </h3>
                    
                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`capitalize rounded-full px-2 sm:px-3 py-1 text-xs font-semibold bg-gradient-to-r ${levelConfig.color} text-white border-0`}>
                        {levelConfig.label}
                      </Badge>
                      
                      <Badge className={`rounded-full px-2 sm:px-3 py-1 text-xs font-semibold bg-gradient-to-r ${goalConfig.color} text-white border-0 flex items-center gap-1`}>
                        <GoalIcon className="h-3 w-3" />
                        {goalConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  {workout.description && (
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {workout.description}
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
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600 dark:text-pink-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-pink-600 dark:text-pink-400 font-semibold">{exerciseCount}</span> exercícios
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">~{estimatedTime}</span> min
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
                      onClick={() => onView(workout.id)}
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
                      onClick={() => onEdit(workout.id)}
                      disabled={isLoading}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar treino</TooltipContent>
                </Tooltip>

                {/* Clone button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => onClone(workout)}
                      disabled={isLoading}
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clonar treino</TooltipContent>
                </Tooltip>

                {/* Delete button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => onDelete(workout)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir treino</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}