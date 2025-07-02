// components/workouts/detail/components/WorkoutExerciseCard.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  Activity, 
  Hash, 
  Target, 
  Clock, 
  StickyNote,
  Play,
  Info,
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { WorkoutExerciseCardProps } from './types';

export function WorkoutExerciseCard({ 
  exercise, 
  index, 
  onView, 
  userRole 
}: WorkoutExerciseCardProps) {
  return (
    <div className="group relative animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Connection line for visual flow */}
      {index > 0 && (
        <div className="absolute -top-3 left-8 w-0.5 h-3 bg-gradient-to-b from-app-achievement-workout/50 to-transparent"></div>
      )}
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <Card className="relative border-0 bg-app-card backdrop-blur-xl rounded-2xl shadow-app-large hover:shadow-app-xl transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-app-text-primary to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(var(--achievement-workout),0.1)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--achievement-workout),0.1)_0%,transparent_50%)]"></div>
        </div>

        <CardContent className="relative p-6">
          
          {/* Exercise Number & Main Info */}
          <div className="flex items-start gap-4 mb-6">
            
            {/* Exercise Number */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-2xl flex items-center justify-center shadow-app-xl group-hover:shadow-app-achievement-workout/25 transition-all duration-300">
                <span className="text-xl font-bold text-white">{index + 1}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-app-achievement-consecutive to-app-achievement-consecutive rounded-full flex items-center justify-center shadow-app-medium">
                <Activity className="h-3 w-3 text-white" />
              </div>
              {/* Animated ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout to-app-btn-primary rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
            </div>

            {/* Exercise Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-app-text-primary mb-2 leading-tight group-hover:text-app-achievement-workout transition-colors duration-300">
                    {exercise.exercise.name}
                  </h3>
                  
                  {/* Exercise Description - if exists */}
                  {exercise.exercise.description && (
                    <p className="text-sm text-app-text-secondary leading-relaxed mb-3 line-clamp-2">
                      {exercise.exercise.description}
                    </p>
                  )}
                </div>
                
                {/* View Exercise Button */}
                <Button
                  onClick={() => onView(exercise.exercise)}
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0 h-10 px-4 border-2 border-app-border-accent hover:border-app-achievement-workout text-app-achievement-workout hover:bg-app-achievement-workout/10 rounded-xl transition-all duration-300 font-semibold group-hover:scale-105"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ver Detalhes</span>
                  <span className="sm:hidden">Ver</span>
                </Button>
              </div>

              {/* Muscle Groups */}
              <div className="flex flex-wrap gap-2 mb-4">
                {exercise.exercise.muscle_group.slice(0, 4).map((muscle) => (
                  <Badge
                    key={muscle}
                    className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 hover:bg-app-achievement-workout/20"
                  >
                    {muscle}
                  </Badge>
                ))}
                {exercise.exercise.muscle_group.length > 4 && (
                  <Badge className="bg-app-bg-secondary text-app-text-muted border border-app-border-muted text-xs px-2 py-1 rounded-full">
                    +{exercise.exercise.muscle_group.length - 4} mais
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Exercise Parameters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Sets */}
            <div className="relative group/param">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-exercise/20 to-app-achievement-exercise/30 rounded-xl blur-lg opacity-0 group-hover/param:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted transition-all duration-300 group-hover/param:scale-105 group-hover/param:border-app-achievement-exercise">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-app-achievement-exercise to-app-achievement-exercise rounded-xl flex items-center justify-center shadow-app-medium group-hover/param:shadow-app-large transition-all duration-300">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">Séries</p>
                    <p className="text-xl font-black text-app-text-primary">{exercise.sets}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reps */}
            <div className="relative group/param">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-consecutive/20 to-app-achievement-consecutive/30 rounded-xl blur-lg opacity-0 group-hover/param:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted transition-all duration-300 group-hover/param:scale-105 group-hover/param:border-app-achievement-consecutive">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-app-achievement-consecutive to-app-achievement-consecutive rounded-xl flex items-center justify-center shadow-app-medium group-hover/param:shadow-app-large transition-all duration-300">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">Reps</p>
                    <p className="text-xl font-black text-app-text-primary">{exercise.reps}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rest */}
            <div className="relative group/param">
              <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-weight/20 to-app-achievement-weight/30 rounded-xl blur-lg opacity-0 group-hover/param:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted transition-all duration-300 group-hover/param:scale-105 group-hover/param:border-app-achievement-weight">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-app-achievement-weight to-app-achievement-weight rounded-xl flex items-center justify-center shadow-app-medium group-hover/param:shadow-app-large transition-all duration-300">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">Descanso</p>
                    <p className="text-xl font-black text-app-text-primary">{exercise.rest}s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration (if exists) */}
            {exercise.duration ? (
              <div className="relative group/param">
                <div className="absolute inset-0 bg-gradient-to-br from-app-achievement-workout/20 to-app-achievement-workout/30 rounded-xl blur-lg opacity-0 group-hover/param:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-app-bg-secondary/30 to-app-bg-secondary/50 rounded-xl border border-app-border-muted transition-all duration-300 group-hover/param:scale-105 group-hover/param:border-app-achievement-workout">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-app-achievement-workout to-app-achievement-workout rounded-xl flex items-center justify-center shadow-app-medium group-hover/param:shadow-app-large transition-all duration-300">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">Duração</p>
                      <p className="text-xl font-black text-app-text-primary">{exercise.duration}s</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative p-4 bg-gradient-to-br from-app-bg-secondary/20 to-app-bg-secondary/30 rounded-xl border border-app-border-muted opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-bg-secondary rounded-xl flex items-center justify-center">
                    <Info className="h-5 w-5 text-app-text-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-1">Tempo</p>
                    <p className="text-sm font-semibold text-app-text-muted">Livre</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes (if exists) */}
          {exercise.notes && (
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-consecutive/10 to-app-achievement-consecutive/20 rounded-xl blur-lg"></div>
              <div className="relative p-4 bg-gradient-to-r from-app-bg-secondary/20 to-app-achievement-workout/5 rounded-xl border border-app-border-accent">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-app-achievement-consecutive to-app-achievement-consecutive rounded-xl flex items-center justify-center flex-shrink-0 shadow-app-medium">
                    <StickyNote className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-app-achievement-consecutive mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Observações:
                    </p>
                    <p className="text-sm text-app-text-secondary leading-relaxed">
                      {exercise.notes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment (if exists) */}
          {exercise.exercise.equipment && exercise.exercise.equipment.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Equipamentos:</span>
              <div className="flex flex-wrap gap-1">
                {exercise.exercise.equipment.slice(0, 3).map((eq) => (
                  <Badge
                    key={eq}
                    variant="secondary"
                    className="text-xs bg-app-bg-secondary text-app-text-secondary border border-app-border-muted px-2 py-1 rounded-full transition-all duration-300 hover:bg-app-achievement-workout/10 hover:text-app-achievement-workout"
                  >
                    {eq}
                  </Badge>
                ))}
                {exercise.exercise.equipment.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-app-bg-secondary text-app-text-muted border border-app-border-muted px-2 py-1 rounded-full">
                    +{exercise.exercise.equipment.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Student Action Button */}
          {userRole === 'student' && (
            <div className="pt-4 border-t border-app-border-muted">
              <Button
                size="sm"
                className="w-full h-12 bg-gradient-to-r from-app-achievement-consecutive to-app-achievement-consecutive hover:from-app-achievement-consecutive/90 hover:to-app-achievement-consecutive/90 text-white font-bold rounded-xl transition-all duration-300 shadow-app-medium hover:shadow-app-large transform hover:scale-105 active:scale-95"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Exercício
              </Button>
            </div>
          )}

          {/* Decorative Elements */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-app-achievement-workout/10 to-app-achievement-workout/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-app-achievement-consecutive/10 to-app-achievement-consecutive/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl animation-delay-200"></div>
        </CardContent>
      </Card>
    </div>
  );
}