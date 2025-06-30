// components/workouts/components/list/WorkoutCard.tsx
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Activity, 
  Target, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Clock,
  Sparkles,
  Flame,
  TrendingUp
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
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/20 via-app-achievement-workout/30 to-app-achievement-workout/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Main card */}
        <Card
          className="relative h-full border-0 card-app transition-all duration-300 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.01] cursor-pointer"
          onClick={() => onView(workout.id)}
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
                  <Activity className="h-8 w-8 text-white" />
                </div>

                {/* Level badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-app-achievement-consecutive to-app-achievement-consecutive rounded-full flex items-center justify-center shadow-app-medium">
                  <Flame className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            {/* Card body */}
            <CardContent className="flex-1 p-4 sm:p-5 flex flex-col">
              {/* Title and description */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-app-text-primary line-clamp-1 mb-2 group-hover:text-app-achievement-workout transition-colors">
                  {workout.name}
                </h3>
                
                {/* Goal with icon */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-achievement-workout">
                    <GoalIcon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-app-text-secondary">
                    {goalConfig.label}
                  </span>
                </div>

                {/* Description */}
                {workout.description && (
                  <p className="text-app-text-secondary text-sm line-clamp-2">
                    {workout.description}
                  </p>
                )}
              </div>

              {/* Level badge */}
              <div className="mb-3 sm:mb-4">
                <div className="text-xs text-app-achievement-workout font-semibold mb-2 uppercase tracking-wider">
                  Nível de Dificuldade
                </div>
                <span className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout text-xs font-medium rounded-full border border-app-border-accent">
                  <Target className="h-3 w-3 mr-1 inline" />
                  {levelConfig.label}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-auto pt-2">
                <div className="text-xs text-app-achievement-workout font-semibold mb-1 uppercase tracking-wider">
                  Estatísticas
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-app-achievement-workout" />
                    <span className="text-app-text-secondary">
                      <span className="font-semibold text-app-achievement-workout">{exerciseCount}</span> exercícios
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-app-achievement-workout" />
                    <span className="text-app-text-secondary">
                      <span className="font-semibold text-app-achievement-workout">~{estimatedTime}</span> min
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
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/10 to-app-achievement-workout/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <Card
        className="relative border-0 card-app cursor-pointer transition-all duration-300 group-hover:scale-[1.01]"
        onClick={() => onView(workout.id)}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-achievement-workout rounded-xl flex items-center justify-center shadow-app-medium">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-app-achievement-consecutive to-app-achievement-consecutive rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-app-text-primary mb-1 group-hover:text-app-achievement-workout transition-colors truncate">
                {workout.name}
              </h3>
              <p className="text-app-text-secondary text-sm line-clamp-2 mb-2">
                {workout.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-app-achievement-workout/10 text-app-achievement-workout text-xs rounded-full border border-app-border-accent">
                  <Target className="h-3 w-3 mr-1 inline" />
                  {levelConfig.label}
                </span>
                <span className="px-2 py-1 bg-app-achievement-consecutive/10 text-app-achievement-consecutive text-xs rounded-full border border-app-border-accent">
                  <GoalIcon className="h-3 w-3 mr-1 inline" />
                  {goalConfig.label}
                </span>
                <span className="px-2 py-1 bg-app-bg-secondary text-app-text-muted text-xs rounded-full border border-app-border-muted">
                  <Clock className="h-3 w-3 mr-1 inline" />
                  {exerciseCount} ex • ~{estimatedTime} min
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-app-bg-secondary rounded-full flex items-center justify-center group-hover:bg-app-achievement-workout group-hover:text-white transition-all duration-300">
                <Eye className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}