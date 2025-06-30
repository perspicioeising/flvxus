// components/workouts/detail/components/WorkoutExerciseCard.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Activity, 
  Hash, 
  Target, 
  Clock, 
  StickyNote,
  Play,
  Info
} from 'lucide-react';
import { WorkoutExerciseCardProps } from './types';

export function WorkoutExerciseCard({ 
  exercise, 
  index, 
  onView, 
  userRole 
}: WorkoutExerciseCardProps) {
  return (
    <div className="group relative">
      {/* Connection line for visual flow */}
      {index > 0 && (
        <div className="absolute -top-4 left-8 w-0.5 h-4 bg-gradient-to-b from-app-achievement-workout/50 to-transparent"></div>
      )}
      
      <div className="relative p-4 sm:p-6  rounded-2xl border-2 border-app-border-muted hover:border-app-achievement-workout transition-all duration-300  hover:shadow-app-large group-hover:transform group-hover:scale-[1.02]">
        
        {/* Exercise Number & Main Info */}
        <div className="flex items-start gap-4 mb-4">
          
          {/* Exercise Number */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-achievement-workout rounded-2xl flex items-center justify-center shadow-app-large">
              <span className="text-lg sm:text-xl font-bold text-white">{index + 1}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-app-achievement-consecutive to-app-achievement-consecutive rounded-full flex items-center justify-center">
              <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
            </div>
          </div>

          {/* Exercise Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-app-text-primary mb-2">
                  {exercise.exercise.name}
                </h3>
               
              </div>
              
              {/* View Exercise Button */}
              <Button
                onClick={() => onView(exercise.exercise)}
                size="sm"
                variant="ghost"
                className="flex-shrink-0 border-2 border-app-border-accent hover:border-app-achievement-workout text-app-achievement-workout hover:bg-app-achievement-workout/10 rounded-xl transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ver Detalhes</span>
                <span className="sm:hidden">Ver</span>
              </Button>
            </div>

            {/* Muscle Groups */}
            {/* <div className="flex flex-wrap gap-2 mb-4">
              {exercise.exercise.muscle_group.slice(0, 3).map((muscle) => (
                <Badge
                  key={muscle}
                  className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-xs font-medium"
                >
                  {muscle}
                </Badge>
              ))}
              {exercise.exercise.muscle_group.length > 3 && (
                <Badge className="bg-app-bg-secondary text-app-text-muted border border-app-border-muted text-xs">
                  +{exercise.exercise.muscle_group.length - 3} mais
                </Badge>
              )}
            </div> */}
          </div>
        </div>

        {/* Exercise Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          
          {/* Sets */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-r from-app-achievement-exercise/10 to-app-achievement-exercise/20 rounded-xl border border-app-border-accent">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-app-achievement-exercise rounded-lg flex items-center justify-center">
              <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-app-text-muted">Séries</p>
              <p className="text-base sm:text-lg font-bold text-app-text-primary">{exercise.sets}</p>
            </div>
          </div>

          {/* Reps */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-r from-app-achievement-consecutive/10 to-app-achievement-consecutive/20 rounded-xl border border-app-border-accent">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-app-achievement-consecutive rounded-lg flex items-center justify-center">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-app-text-muted">Reps</p>
              <p className="text-base sm:text-lg font-bold text-app-text-primary">{exercise.reps}</p>
            </div>
          </div>

          {/* Rest */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-r from-app-achievement-weight/10 to-app-achievement-weight/20 rounded-xl border border-app-border-accent">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-app-achievement-weight rounded-lg flex items-center justify-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-app-text-muted">Descanso</p>
              <p className="text-base sm:text-lg font-bold text-app-text-primary">{exercise.rest}s</p>
            </div>
          </div>

          {/* Duration (if exists) */}
          {exercise.duration ? (
            <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-workout/20 rounded-xl border border-app-border-accent">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-app-achievement-workout rounded-lg flex items-center justify-center">
                <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-app-text-muted">Duração</p>
                <p className="text-base sm:text-lg font-bold text-app-text-primary">{exercise.duration}s</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 p-3 bg-gradient-to-r from-app-bg-secondary/20 to-app-bg-secondary/30 rounded-xl border border-app-border-muted opacity-60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-app-bg-secondary rounded-lg flex items-center justify-center">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-app-text-muted">Tempo</p>
                <p className="text-sm font-medium text-app-text-muted">Livre</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes (if exists) */}
        {exercise.notes && (
          <div className="p-4 bg-gradient-to-r from-app-achievement-consecutive/10 to-app-achievement-consecutive/20 rounded-xl border border-app-border-accent mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-app-achievement-consecutive rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <StickyNote className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-app-achievement-consecutive mb-1">Observações:</p>
                <p className="text-sm text-app-text-secondary leading-relaxed">
                  {exercise.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Equipment (if exists) */}
        {/* {exercise.exercise.equipment && exercise.exercise.equipment.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-app-text-muted">Equipamentos:</span>
            <div className="flex flex-wrap gap-1">
              {exercise.exercise.equipment.slice(0, 3).map((eq) => (
                <Badge
                  key={eq}
                  variant="secondary"
                  className="text-xs bg-app-bg-secondary text-app-text-secondary border border-app-border-muted"
                >
                  {eq}
                </Badge>
              ))}
              {exercise.exercise.equipment.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-app-bg-secondary text-app-text-muted border border-app-border-muted">
                  +{exercise.exercise.equipment.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )} */}

        {/* Student Action Button */}
        {userRole === 'student' && (
          <div className="pt-4 border-t border-app-border-muted">
            <Button
              size="sm"
              className="w-full bg-app-achievement-consecutive hover:bg-app-achievement-consecutive/90 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Exercício
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}