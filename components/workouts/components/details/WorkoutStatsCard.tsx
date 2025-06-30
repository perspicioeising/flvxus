import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Hash, 
  Clock, 
  TrendingUp,
  Target,
  Package,
  BarChart3,
  Timer
} from 'lucide-react';
import { WorkoutStatsCardProps } from './types';

export function WorkoutStatsCard({ stats, level, goal }: WorkoutStatsCardProps) {
  return (
    <div className="space-y-6">
      
      {/* Main Stats Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-workout/10 via-app-achievement-workout/15 to-app-achievement-workout/10 rounded-2xl blur-md"></div>
        <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-bold text-app-text-heading mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-app-achievement-workout" />
              Estatísticas
            </h3>

            <div className="space-y-4">
              
              {/* Total Exercises */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-app-achievement-exercise/10 to-app-achievement-exercise/20 rounded-xl border border-app-border-accent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-achievement-exercise rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-app-text-muted">Exercícios</p>
                    <p className="text-lg sm:text-xl font-bold text-app-text-primary">{stats.totalExercises}</p>
                  </div>
                </div>
              </div>

              {/* Total Sets */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-app-achievement-consecutive/10 to-app-achievement-consecutive/20 rounded-xl border border-app-border-accent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-achievement-consecutive rounded-xl flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-app-text-muted">Séries Totais</p>
                    <p className="text-lg sm:text-xl font-bold text-app-text-primary">{stats.totalSets}</p>
                  </div>
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-app-achievement-weight/10 to-app-achievement-weight/20 rounded-xl border border-app-border-accent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-achievement-weight rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-app-text-muted">Duração Est.</p>
                    <p className="text-lg sm:text-xl font-bold text-app-text-primary">{stats.estimatedDuration}min</p>
                  </div>
                </div>
              </div>

              {/* Average Rest */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-app-achievement-workout/10 to-app-achievement-workout/20 rounded-xl border border-app-border-accent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-achievement-workout rounded-xl flex items-center justify-center">
                    <Timer className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-app-text-muted">Descanso Médio</p>
                    <p className="text-lg sm:text-xl font-bold text-app-text-primary">{stats.averageRest}s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Groups Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-consecutive/10 via-app-achievement-consecutive/15 to-app-achievement-consecutive/10 rounded-2xl blur-md"></div>
        <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-bold text-app-text-heading mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-app-achievement-consecutive" />
              Grupos Musculares
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.muscleGroups.map((muscle) => (
                <Badge
                  key={muscle}
                  className="bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent text-xs font-medium"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-exercise/10 via-app-achievement-exercise/15 to-app-achievement-exercise/10 rounded-2xl blur-md"></div>
        <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-bold text-app-text-heading mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-app-achievement-exercise" />
              Equipamentos
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.equipmentNeeded.length > 0 ? (
                stats.equipmentNeeded.map((equipment) => (
                  <Badge
                    key={equipment}
                    className="bg-app-achievement-exercise/10 text-app-achievement-exercise border border-app-border-accent text-xs font-medium"
                  >
                    {equipment}
                  </Badge>
                ))
              ) : (
                <Badge className="bg-app-bg-secondary text-app-text-muted border border-app-border-muted text-xs">
                  Peso corporal
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workout Level & Goal */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-app-achievement-weight/10 via-app-achievement-weight/15 to-app-achievement-weight/10 rounded-2xl blur-md"></div>
        <div className="relative bg-app-overlay backdrop-blur-xl border-0 rounded-2xl shadow-app-xl">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-bold text-app-text-heading mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-app-achievement-weight" />
              Classificação
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-app-text-muted mb-2">Nível</p>
                <Badge className="bg-app-achievement-workout/10 text-app-achievement-workout border border-app-border-accent text-sm font-semibold">
                  {level}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-app-text-muted mb-2">Objetivo</p>
                <Badge className="bg-app-achievement-consecutive/10 text-app-achievement-consecutive border border-app-border-accent text-sm font-semibold">
                  {goal}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}