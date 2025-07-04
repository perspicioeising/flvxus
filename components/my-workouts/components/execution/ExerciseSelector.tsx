import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  CheckCircle2,
  Clock,
  Target,
  Play,
  Dumbbell
} from 'lucide-react';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: any[];
  currentIndex: number;
  session: any;
  onSelect: (index: number) => void;
}

export function ExerciseSelector({ 
  isOpen, 
  onClose, 
  exercises, 
  currentIndex, 
  session, 
  onSelect 
}: ExerciseSelectorProps) {
  if (!isOpen) return null;

  const getExerciseProgress = (exerciseId: string) => {
    const progress = session?.exercises?.find((e: any) => e.exercise_id === exerciseId);
    return progress || { sets_completed: 0, weights: [], reps: [] };
  };

  const isExerciseComplete = (exercise: any) => {
    const progress = getExerciseProgress(exercise.exercise.id);
    return (progress.sets_completed || 0) >= exercise.sets;
  };

  const getExerciseStatus = (exercise: any, index: number) => {
    const isComplete = isExerciseComplete(exercise);
    const isCurrent = index === currentIndex;
    const progress = getExerciseProgress(exercise.exercise.id);
    const hasStarted = (progress.sets_completed || 0) > 0;

    if (isComplete) return 'complete';
    if (isCurrent) return 'current';
    if (hasStarted) return 'inprogress';
    return 'pending';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'current':
        return {
          icon: Play,
          color: 'text-app-achievement-workout',
          bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
          badge: 'bg-app-achievement-workout text-white'
        };
      case 'inprogress':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        };
      default:
        return {
          icon: Target,
          color: 'text-app-text-muted',
          bg: 'bg-app-bg-secondary border-app-border-muted',
          badge: 'bg-app-bg-tertiary text-app-text-muted'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-app-overlay backdrop-blur-xl border border-app-border-accent/50 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-app-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-app-border-muted">
          <h3 className="text-lg font-bold text-app-heading">
            Selecionar Exercício
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-secondary rounded-xl transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Exercise List */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {exercises.map((exercise, index) => {
              const status = getExerciseStatus(exercise, index);
              const statusInfo = getStatusInfo(status);
              const progress = getExerciseProgress(exercise.exercise.id);
              const completedSets = progress.sets_completed || 0;
              const totalSets = exercise.sets;
              const progressPercentage = (completedSets / totalSets) * 100;
              const StatusIcon = statusInfo.icon;

              return (
                <button
                  key={exercise.exercise.id}
                  onClick={() => onSelect(index)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${statusInfo.bg} ${
                    index === currentIndex ? 'ring-2 ring-app-achievement-workout' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      status === 'complete' 
                        ? 'bg-green-100 dark:bg-green-900/50' 
                        : status === 'current'
                          ? 'bg-app-achievement-workout'
                          : status === 'inprogress'
                            ? 'bg-blue-100 dark:bg-blue-900/50'
                            : 'bg-app-bg-tertiary'
                    }`}>
                      <StatusIcon className={`h-5 w-5 ${
                        status === 'current' ? 'text-white' : statusInfo.color
                      }`} />
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-app-heading truncate">
                          {exercise.exercise.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`px-2 py-1 text-xs rounded-full ${statusInfo.badge}`}>
                            {status === 'complete' 
                              ? 'Concluído' 
                              : status === 'current'
                                ? 'Atual'
                                : status === 'inprogress'
                                  ? 'Em Progresso'
                                  : 'Pendente'
                            }
                          </Badge>
                          <span className="text-xs font-medium text-app-text-muted">
                            #{index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Exercise Details */}
                      <div className="flex items-center gap-4 text-sm text-app-text-secondary mb-2">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{exercise.sets} séries</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          <span>{exercise.reps} reps</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{exercise.rest}s</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress 
                            value={progressPercentage} 
                            className="h-2" 
                          />
                        </div>
                        <span className="text-xs font-medium text-app-text-secondary">
                          {completedSets}/{totalSets}
                        </span>
                      </div>

                      {/* Muscle Groups */}
                      {exercise.exercise.muscle_group?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exercise.exercise.muscle_group.slice(0, 3).map((muscle: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              className="px-2 py-0.5 bg-app-bg-tertiary text-app-text-muted text-xs rounded-full"
                            >
                              {muscle}
                            </Badge>
                          ))}
                          {exercise.exercise.muscle_group.length > 3 && (
                            <Badge className="px-2 py-0.5 bg-app-bg-tertiary text-app-text-muted text-xs rounded-full">
                              +{exercise.exercise.muscle_group.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-app-border-muted bg-app-bg-secondary/50">
          <div className="flex items-center justify-between text-sm text-app-text-secondary">
            <span>
              {exercises.filter((_, idx) => getExerciseStatus(exercises[idx], idx) === 'complete').length} de {exercises.length} concluídos
            </span>
            <span>
              Toque em um exercício para selecioná-lo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}