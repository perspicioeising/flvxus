
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
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
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/10 to-red-600/10 rounded-2xl blur-md"></div>
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600 dark:text-red-400" />
              Estatísticas
            </h3>

            <div className="space-y-4">
              
              {/* Total Exercises */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Exercícios</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalExercises}</p>
                  </div>
                </div>
              </div>

              {/* Total Sets */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Séries Totais</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalSets}</p>
                  </div>
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duração Est.</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.estimatedDuration}min</p>
                  </div>
                </div>
              </div>

              {/* Average Rest */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Timer className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Descanso Médio</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.averageRest}s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Groups Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-500/10 to-green-600/10 rounded-2xl blur-md"></div>
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              Grupos Musculares
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.muscleGroups.map((muscle) => (
                <Badge
                  key={muscle}
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-600 text-xs font-medium"
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-blue-600/10 rounded-2xl blur-md"></div>
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Equipamentos
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.equipmentNeeded.length > 0 ? (
                stats.equipmentNeeded.map((equipment) => (
                  <Badge
                    key={equipment}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-600 text-xs font-medium"
                  >
                    {equipment}
                  </Badge>
                ))
              ) : (
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">
                  Peso corporal
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workout Level & Goal */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-2xl blur-md"></div>
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Classificação
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Nível</p>
                <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-600 text-sm font-semibold">
                  {level}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Objetivo</p>
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-600 text-sm font-semibold">
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