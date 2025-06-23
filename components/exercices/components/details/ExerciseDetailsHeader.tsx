// components/exercises/details/ExerciseDetailsHeader.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '@/components/exercices/types/exercise';
import { getMuscleGroupIcon } from '@/components/exercices/components/constants/exercise';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  Dumbbell, 
  Settings,
  Loader2,
  Calendar,
  Clock,
  MoreVertical,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExerciseDetailsHeaderProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ExerciseDetailsHeader({
  exercise,
  onBack,
  onEdit,
  onClone,
  onDelete,
  isDeleting
}: ExerciseDetailsHeaderProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMainMuscleGroup = () => {
    if (!exercise.muscle_group || exercise.muscle_group.length === 0) return null;
    return getMuscleGroupIcon(exercise.muscle_group[0]);
  };

  const mainMuscleGroup = getMainMuscleGroup();

  return (
    <div className="relative mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/10 via-app-text-accent/10 to-app-achievement-exercise/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
      
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/30 rounded-2xl sm:rounded-3xl shadow-app-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          
          {/* Navigation Bar - Mobile First */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-10 w-10 sm:h-12 sm:w-auto sm:px-4 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline sm:ml-2 font-semibold">Voltar</span>
            </Button>

            {/* Actions Menu - Mobile */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 bg-app-bg-secondary hover:bg-app-border-accent/20 rounded-xl"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-app-overlay backdrop-blur-xl border border-app-border-default rounded-xl shadow-app-xl"
                >
                  <DropdownMenuItem onClick={onEdit} className="flex items-center gap-2 p-3">
                    <Edit className="h-4 w-4 text-achievement-exercise" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onClone} className="flex items-center gap-2 p-3">
                    <Copy className="h-4 w-4 text-achievement-workout" />
                    <span>Clonar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    disabled={isDeleting}
                    className="flex items-center gap-2 p-3 text-red-600 dark:text-red-400"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>{isDeleting ? 'Deletando...' : 'Deletar'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Button
                onClick={onEdit}
                className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button
                onClick={onClone}
                variant="outline"
                className="h-10 px-4 bg-app-card border-app-border-accent text-app-text-primary hover:bg-app-border-accent/20 rounded-xl font-semibold transition-all duration-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                Clonar
              </Button>
              
              <Button
                onClick={onDelete}
                disabled={isDeleting}
                variant="outline"
                className="h-10 px-4 bg-app-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </Button>
            </div>
          </div>

          {/* Exercise Info */}
          <div className="space-y-4">
            
            {/* Title and Icon */}
            <div className="flex items-start gap-3 sm:gap-4">
              {mainMuscleGroup && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-achievement-exercise rounded-xl sm:rounded-2xl flex items-center justify-center shadow-app-large">
                    <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-app-heading leading-tight break-words">
                  {exercise.name}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-app-text-secondary">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Criado {formatDate(exercise.created_at)}</span>
                  </div>
                  
                  {exercise.updated_at !== exercise.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Atualizado {formatDate(exercise.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats - Mobile Optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-achievement-workout/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-lg sm:text-xl font-bold text-achievement-workout">
                  {exercise.muscle_group?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Músculos</div>
              </div>
              
              <div className="bg-achievement-exercise/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-lg sm:text-xl font-bold text-achievement-exercise">
                  {exercise.equipment?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Equipamentos</div>
              </div>
              
              <div className="bg-achievement-consecutive/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-lg sm:text-xl font-bold text-achievement-consecutive">
                  {exercise.variations?.length || 0}
                </div>
                <div className="text-xs text-app-text-secondary">Variações</div>
              </div>
              
              <div className="bg-achievement-weight/10 border border-app-border-accent rounded-xl p-3 text-center">
                <div className="text-lg sm:text-xl font-bold text-achievement-weight">
                  {(exercise.tips?.length || 0) + (exercise.common_errors?.length || 0)}
                </div>
                <div className="text-xs text-app-text-secondary">Dicas</div>
              </div>
            </div>

            {/* Tags Section - Collapsible on Mobile */}
            <div className="space-y-3">
              
              {/* Muscle Groups */}
              {exercise.muscle_group && exercise.muscle_group.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-4 w-4 text-achievement-exercise" />
                    <span className="text-sm font-semibold text-app-text-primary">
                      Grupos Musculares
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscle_group.slice(0, 3).map((group) => {
                      const groupInfo = getMuscleGroupIcon(group);
                      return (
                        <Badge
                          key={group}
                          className="px-2 py-1 bg-achievement-consecutive/10 text-achievement-consecutive border border-app-border-accent rounded-full text-xs font-medium"
                        >
                          <span className="mr-1">{groupInfo.icon}</span>
                          {group}
                        </Badge>
                      );
                    })}
                    {exercise.muscle_group.length > 3 && (
                      <Badge className="px-2 py-1 bg-app-bg-secondary text-app-text-muted border border-app-border-muted rounded-full text-xs">
                        +{exercise.muscle_group.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-achievement-workout" />
                    <span className="text-sm font-semibold text-app-text-primary">
                      Equipamentos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment.slice(0, 3).map((equipment) => (
                      <Badge
                        key={equipment}
                        className="px-2 py-1 bg-achievement-workout/10 text-achievement-workout border border-app-border-accent rounded-full text-xs font-medium"
                      >
                        {equipment}
                      </Badge>
                    ))}
                    {exercise.equipment.length > 3 && (
                      <Badge className="px-2 py-1 bg-app-bg-secondary text-app-text-muted border border-app-border-muted rounded-full text-xs">
                        +{exercise.equipment.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}